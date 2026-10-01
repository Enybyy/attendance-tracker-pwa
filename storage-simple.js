/**
 * Gestor de almacenamiento híbrido:
 * - IndexedDB (persistencia silenciosa)
 * - File System Access API (sin servidor, escribe en carpeta "db")
 * - localStorage como último respaldo
 *
 * Todos los métodos son asíncronos y devuelven Promises.
 */

class StorageManager {
  constructor() {
    this.DB_NAME = "AsistenciasDB";
    this.DB_VERSION = 2;
    this.STORE_NAME = "appData";
    this.APP_DATA_KEY = "appData";
    this.HANDLE_KEY = "fsHandle";
    this.FILE_NAME = "appData.json";

    this.db = null;
    this.dbPromise = null;
    this.directoryHandle = null;
    this.fileHandle = null;
    this.queue = Promise.resolve();
    this.persistenceType = "empty";
    this.lastFileWarning = "";
  }

  async init() {
    if (!this.dbPromise) {
      this.dbPromise = this.openDatabase();
    }
    try { await this.dbPromise; } catch { this.db = null; }
    if (!this.directoryHandle) {
      await this.restoreDirectoryHandle();
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.db.onversionchange = () => { this.db.close(); this.db = null; };
        resolve(this.db);
      };
      request.onblocked = () => reject(new Error("Cierra las otras pestañas para actualizar el almacenamiento."));

      request.onerror = () => {
        console.error("Error al abrir IndexedDB:", request.error);
        reject(request.error);
      };
    });
  }

  getObjectStore(mode = "readonly") {
    if (!this.db) {
      throw new Error("IndexedDB no inicializado");
    }
    const tx = this.db.transaction([this.STORE_NAME], mode);
    return tx.objectStore(this.STORE_NAME);
  }

  putValue(key, value) {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readwrite");
        const request = store.put(value, key);

        store.transaction.oncomplete = () => resolve(true);
        store.transaction.onerror = () => reject(store.transaction.error);
        store.transaction.onabort = () => reject(store.transaction.error || new Error("Guardado interrumpido."));
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  getValue(key) {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getObjectStore("readonly");
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  save(data) {
    const snapshot = structuredClone(data);
    const action = async () => {
      await this.init();
      try {
        await this.putValue(this.APP_DATA_KEY, snapshot);
        this.persistenceType = "indexeddb";
        try { localStorage.removeItem("attendanceLegacyFallback"); } catch {}
      } catch {
        const previous = localStorage.getItem(this.APP_DATA_KEY);
        localStorage.setItem(this.APP_DATA_KEY, JSON.stringify(snapshot));
        try { localStorage.setItem("attendanceLegacyFallback", "1"); }
        catch (error) {
          if (previous === null) localStorage.removeItem(this.APP_DATA_KEY);
          else localStorage.setItem(this.APP_DATA_KEY, previous);
          throw error;
        }
        this.persistenceType = "localstorage";
      }
      this.lastFileWarning = "";
      if (this.directoryHandle) {
        try { await this.writeFile(snapshot); }
        catch { this.lastFileWarning = "Guardado en el navegador; no se pudo actualizar la carpeta vinculada."; }
      }
      return { type: this.persistenceType, fileWarning: this.lastFileWarning };
    };
    const current = this.queue.then(action, action);
    this.queue = current.catch(() => {});
    return current;
  }

  async load() {
    await this.init();

    if (localStorage.getItem("attendanceLegacyFallback")) {
      const raw = localStorage.getItem(this.APP_DATA_KEY);
      if (raw) { this.persistenceType = "localstorage"; return JSON.parse(raw); }
    }

    if (this.db) {
      const dbData = await this.getValue(this.APP_DATA_KEY);
      if (dbData) { this.persistenceType = "indexeddb"; return dbData; }
    }

    const raw = localStorage.getItem(this.APP_DATA_KEY);
    if (raw) { this.persistenceType = "localstorage"; return JSON.parse(raw); }
    if (this.directoryHandle) return this.readFile();

    return null;
  }

  async clear() {
    await this.init();
    try {
      await this.putValue(this.APP_DATA_KEY, null);
    } catch {}
    if (this.directoryHandle && this.fileHandle) {
      try {
        await this.writeFile({});
      } catch {}
    }
    try {
      localStorage.removeItem(this.APP_DATA_KEY);
    } catch {}
  }

  supportsFileSystemAccess() {
    return typeof window.showDirectoryPicker === "function";
  }

  async restoreDirectoryHandle() {
    if (!this.supportsFileSystemAccess()) return;
    try {
      const handle = await this.getValue(this.HANDLE_KEY);
      if (!handle) return;

      const hasPermission = await handle.queryPermission({ mode: "readwrite" }) === "granted";
      if (!hasPermission) return;

      this.directoryHandle = handle;
      await this.ensureFileHandle();
    } catch (error) {
      console.warn("No se pudo restaurar la carpeta de datos:", error);
    }
  }

  async requestDirectoryAccess() {
    if (!this.supportsFileSystemAccess()) {
      throw new Error(
        "El navegador no soporta File System Access API. Usa Chrome/Edge reciente."
      );
    }

    const dirHandle = await window.showDirectoryPicker({
      id: "registro-asistencias-db",
      mode: "readwrite",
      startIn: "documents",
    });

    const granted = await this.verifyPermission(dirHandle, true);
    if (!granted) {
      throw new Error("Se requieren permisos de lectura y escritura.");
    }

    try {
      await dirHandle.getFileHandle(this.FILE_NAME);
      if (!confirm("Esta carpeta ya contiene appData.json. ¿Reemplazarlo con los datos actuales? Importa primero el archivo si necesitas conservarlo.")) return false;
    } catch (error) { if (error.name !== "NotFoundError") throw error; }
    this.directoryHandle = dirHandle;
    await this.ensureFileHandle(true);
    if (this.db) await this.putValue(this.HANDLE_KEY, dirHandle);

    return true;
  }

  async ensureFileHandle(create = false) {
    if (!this.directoryHandle) return null;
    try {
      this.fileHandle = await this.directoryHandle.getFileHandle(
        this.FILE_NAME,
        { create }
      );
      return this.fileHandle;
    } catch (error) {
      if (create) throw error;
      console.warn("No se pudo obtener el archivo de datos:", error);
      return null;
    }
  }

  async writeFile(data) {
    await this.ensureFileHandle(true);
    if (!this.fileHandle) throw new Error("No hay archivo de datos disponible.");

    const writable = await this.fileHandle.createWritable();
    await writable.write(
      new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
    );
    await writable.close();
    return true;
  }

  async readFile() {
    try {
      await this.ensureFileHandle(false);
      if (!this.fileHandle) return null;

      const file = await this.fileHandle.getFile();
      const text = await file.text();
      if (!text) return null;
      return JSON.parse(text);
    } catch (error) {
      if (error.name === "NotFoundError") return null;
      throw error;
    }
  }

  async verifyPermission(handle, write) {
    if (!handle) return false;
    const opts = write ? { mode: "readwrite" } : {};

    if ((await handle.queryPermission(opts)) === "granted") {
      return true;
    }

    if ((await handle.requestPermission(opts)) === "granted") {
      return true;
    }

    return false;
  }

  async getStatus() {
    await this.init();
    if (this.lastFileWarning) return { type: this.persistenceType, warning: this.lastFileWarning };
    if (this.persistenceType === "localstorage") return { type: "localstorage" };

    if (this.directoryHandle) {
      return {
        type: "filesystem",
        fileName: this.FILE_NAME,
      };
    }

    try {
      const dbData = await this.getValue(this.APP_DATA_KEY);
      if (dbData) {
        return { type: "indexeddb" };
      }
    } catch {}

    try {
      const raw = localStorage.getItem(this.APP_DATA_KEY);
      if (raw) {
        return { type: "localstorage" };
      }
    } catch {}

    return { type: "empty" };
  }
}

const storage = new StorageManager();
window.storage = storage;

window.addEventListener("beforeunload", () => {
  if (window.appData) {
    storage.save(window.appData);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && window.appData) {
    storage.save(window.appData);
  }
});

console.log("Gestor de almacenamiento híbrido inicializado.");
