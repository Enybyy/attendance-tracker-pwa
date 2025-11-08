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
  }

  async init() {
    if (!this.dbPromise) {
      this.dbPromise = this.openDatabase();
    }
    await this.dbPromise;
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
        resolve(this.db);
      };

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

        request.onsuccess = () => resolve(true);
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

  async save(data) {
    await this.init();
    try {
      await this.putValue(this.APP_DATA_KEY, data);
    } catch (error) {
      console.error("Error guardando en IndexedDB:", error);
    }

    if (this.directoryHandle) {
      try {
        await this.writeFile(data);
      } catch (error) {
        console.error("No se pudo escribir el archivo de datos:", error);
      }
    } else {
      try {
        localStorage.setItem(this.APP_DATA_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn("No se pudo usar localStorage:", error);
      }
    }
  }

  async load() {
    await this.init();

    if (this.directoryHandle) {
      const fileData = await this.readFile();
      if (fileData) return fileData;
    }

    try {
      const dbData = await this.getValue(this.APP_DATA_KEY);
      if (dbData) return dbData;
    } catch (error) {
      console.error("No se pudo leer IndexedDB:", error);
    }

    try {
      const raw = localStorage.getItem(this.APP_DATA_KEY);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      console.warn("No se pudo leer localStorage:", error);
    }

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

      const hasPermission = await this.verifyPermission(handle, false);
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

    this.directoryHandle = dirHandle;
    await this.ensureFileHandle(true);
    await this.putValue(this.HANDLE_KEY, dirHandle);

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
      console.warn("No se pudo leer el archivo de datos:", error);
      return null;
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
