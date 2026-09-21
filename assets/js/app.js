document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIGURACIÓN DE SEDES ---

  let locations = [
    'Losa Deportiva "La Bombonera"',
    'Losa Deportiva "Santa Rosa"',
  ];

  let appData = {}; // Contendrá todos los datos, separados por sede

  let currentLocationName = "";

  // Referencias a elementos del DOM para el selector de sede

  const prevLocationBtn = document.getElementById("prev-location");

  const nextLocationBtn = document.getElementById("next-location");

  const currentLocationNameEl = document.getElementById(
    "current-location-name"
  );

  const currentLocationAddressEl = document.getElementById(
    "current-location-address"
  );

  const locationSwitcherMain = document.getElementById(
    "location-switcher-main"
  );

  const locationPanel = document.getElementById("location-panel");

  const locationPanelList = document.getElementById(
    "location-panel-list"
  );

  const addLocationToggle = document.getElementById("addLocationToggle");

  const addLocationInline = document.getElementById("addLocationInline");

  const newLocationNameInput = document.getElementById("newLocationName");

  const newLocationAddressInput =
    document.getElementById("newLocationAddress");

  const saveNewLocationBtn = document.getElementById("saveNewLocation");

  const cancelNewLocationBtn =
    document.getElementById("cancelNewLocation");

  const editLocationToggle =
    document.getElementById("editLocationToggle");

  const editLocationInline =
    document.getElementById("editLocationInline");

  const editLocationNameInput =
    document.getElementById("editLocationName");

  const editLocationAddressInput = document.getElementById(
    "editLocationAddress"
  );

  const saveEditLocationBtn = document.getElementById("saveEditLocation");

  const cancelEditLocationBtn =
    document.getElementById("cancelEditLocation");

  // Referencias para panel de Más Opciones

  const locationToggleList =
    document.getElementById("locationToggleList");

  // Referencias a elementos del DOM

  const employeeNameInput = document.getElementById("employeeName");

  const employeeDniInput = document.getElementById("employeeDni");

  const employeePositionInput =
    document.getElementById("employeePosition");

  const addEmployeeBtn = document.getElementById("addEmployeeBtn");

  const employeeListDiv = document.getElementById("employeeList");

  const employeeFilterInput = document.getElementById("employeeFilter");

  const manageWeeklyLogBtn =
    document.getElementById("manageWeeklyLogBtn");

  const employeeSearchSelect = document.getElementById(
    "employeeSearchSelect"
  );

  const employeeDropdown = document.getElementById("employeeDropdown");

  // Estado para navegación por teclado en el dropdown de empleados (Paso 2)

  let dropdownActiveIndex = -1;

  let lastDropdownEmployees = [];

  const updateDropdownHighlight = () => {
    if (!employeeDropdown) return;

    const items = Array.from(employeeDropdown.children || []);

    items.forEach((el, idx) => {
      if (idx === dropdownActiveIndex) {
        el.classList.add("bg-cyan-700");

        el.classList.remove("hover:bg-cyan-600");
      } else {
        el.classList.remove("bg-cyan-700");

        el.classList.add("hover:bg-cyan-600");
      }
    });
  };

  const checkInTimeInput = document.getElementById("checkInTime");

  const checkOutTimeInput = document.getElementById("checkOutTime");

  const addAttendanceBtn = document.getElementById("addAttendanceBtn");

  const reportDateInput = document.getElementById("reportDate");

  const reportDateVisual = document.getElementById("reportDateVisual");
  const updateDateVisual = () => {
    if (!reportDateInput || !reportDateVisual) return;
    const val = reportDateInput.value;
    if (!val) {
      reportDateVisual.value = "";
      return;
    }
    const [y, m, d] = val.split("-");
    reportDateVisual.value = `${d}/${m}/${y}`;
  };
  if (reportDateInput) {
    reportDateInput.addEventListener("change", updateDateVisual);
    reportDateInput.addEventListener("input", updateDateVisual);
  }

  const prevDayBtn = document.getElementById("prevDayBtn");

  const nextDayBtn = document.getElementById("nextDayBtn");

  const expectedHoursInput = document.getElementById("expectedHours");

  const setWeeklyHoursBtn = document.getElementById("setWeeklyHours");

  const attendanceTableBody = document.getElementById(
    "attendanceTableBody"
  );

  const summaryDiv = document.getElementById("summary");

  const exportExcelBtn = document.getElementById("exportExcelBtn");

  const exportPdfBtn = document.getElementById("exportPdfBtn");

  const addAllAttendanceBtn = document.getElementById(
    "addAllAttendanceBtn"
  );

  const clearAllAttendanceBtn = document.getElementById(
    "clearAllAttendanceBtn"
  );

  // Respaldo

  const exportJsonBtn = document.getElementById("exportJsonBtn");

  const importJsonBtn = document.getElementById("importJsonBtn");

  const importJsonInput = document.getElementById("importJsonInput");

  const exportReportJsonBtn = document.getElementById(
    "exportReportJsonBtn"
  );

  const loadSampleDataBtn = document.getElementById("loadSampleDataBtn");

  const linkStorageFolderBtn = document.getElementById(
    "linkStorageFolderBtn"
  );

  const storageStatusText = document.getElementById("storageStatus");

  const formatStorageStatus = (info) => {
    if (!info || !info.type) return "Estado de almacenamiento: desconocido.";

    if (info.type === "filesystem") {
      return `Estado de almacenamiento: carpeta vinculada (${info.fileName}).`;
    }

    if (info.type === "indexeddb") {
      return "Estado de almacenamiento: guardado en IndexedDB del navegador.";
    }

    if (info.type === "localstorage") {
      return "Estado de almacenamiento: guardado en localStorage.";
    }

    return "Estado de almacenamiento: sin datos guardados.";
  };

  const refreshStorageStatus = async () => {
    if (!storageStatusText || !window.storage) return;
    try {
      const info = await storage.getStatus();
      storageStatusText.textContent = formatStorageStatus(info);
    } catch (error) {
      console.error("No se pudo obtener el estado del almacenamiento:", error);
      storageStatusText.textContent =
        "Estado de almacenamiento: error al consultar.";
    }
  };

  if (linkStorageFolderBtn) {
    linkStorageFolderBtn.addEventListener("click", async () => {
      if (!window.storage) return;
      try {
        await storage.requestDirectoryAccess();
        await storage.save(appData);
        await refreshStorageStatus();
        alert(
          "Carpeta vinculada correctamente. Los cambios se guardarán en el archivo local."
        );
      } catch (error) {
        console.error("No se pudo vincular la carpeta:", error);
        alert(
          "No se pudo vincular la carpeta. Revisa que el navegador permita acceso a archivos."
        );
      }
    });
  }

  // Tema del día

  const dailyTopicInput = document.getElementById("dailyTopic");

  const saveDailyTopicBtn = document.getElementById("saveDailyTopic");

  const dailyTopicDurationInput =
    document.getElementById("dailyTopicDuration");

  // Modal Editar Empleado (declarado aquí para usarlo en handlers posteriores)

  const editModal = document.getElementById("editEmployeeModal");

  const editEmployeeName = document.getElementById("editEmployeeName");

  const editEmployeeDni = document.getElementById("editEmployeeDni");

  const editEmployeePosition = document.getElementById(
    "editEmployeePosition"
  );

  const saveEditEmployeeBtn = document.getElementById("saveEditEmployee");

  const cancelEditEmployeeBtn =
    document.getElementById("cancelEditEmployee");

  // Payroll fields in employee edit modal
  const editEmployeeProcedencia = document.getElementById("editEmployeeProcedencia");
  const editEmployeeTarifa = document.getElementById("editEmployeeTarifa");
  const editEmployeeModalidadPago = document.getElementById("editEmployeeModalidadPago");
  const editEmployeeBanco = document.getElementById("editEmployeeBanco");
  const editEmployeeCuenta = document.getElementById("editEmployeeCuenta");
  const editEmployeeCCI = document.getElementById("editEmployeeCCI");

  // Payroll table elements
  const payrollTableBody = document.getElementById("payrollTableBody");
  const payrollWeekLabel = document.getElementById("payrollWeekLabel");
  const payrollTotalEmployees = document.getElementById("payrollTotalEmployees");
  const payrollTotalDays = document.getElementById("payrollTotalDays");
  const payrollTotalDeposito = document.getElementById("payrollTotalDeposito");
  const payrollTotalEfectivo = document.getElementById("payrollTotalEfectivo");
  const payrollFooterDays = document.getElementById("payrollFooterDays");
  const payrollFooterMonto = document.getElementById("payrollFooterMonto");
  const exportPayrollExcelBtn = document.getElementById("exportPayrollExcelBtn");
  const exportPayrollPdfBtn = document.getElementById("exportPayrollPdfBtn");

  // Modal Editar Asistencia

  const editAttendanceModal = document.getElementById(
    "editAttendanceModal"
  );

  const editAttendanceEmployeeSpan = document.getElementById(
    "editAttendanceEmployee"
  );

  const editCheckInTimeInput = document.getElementById("editCheckInTime");

  const editCheckOutTimeInput =
    document.getElementById("editCheckOutTime");

  const saveEditAttendanceBtn =
    document.getElementById("saveEditAttendance");

  const cancelEditAttendanceBtn = document.getElementById(
    "cancelEditAttendance"
  );

  // Referencias para reporte semanal (sin tarjeta semanal superior)

  const isoWeekBadgeEl = document.getElementById("isoWeekBadge");

  // Referencias para resumen visual

  const quickAttendanceChartCtx = document
    .getElementById("quickAttendanceChart")
    .getContext("2d");

  const weeklyMetricsDiv = document.getElementById("weeklyMetrics");

  const mostAbsentDiv = document.getElementById("mostAbsent");

  const overtimeEmployeesDiv =
    document.getElementById("overtimeEmployees");

  const debtHoursDiv = document.getElementById("debtHours");

  const weekRangeBadgeEl = document.getElementById("weekRangeBadge");

  const weeklyNotesInput = document.getElementById("weeklyNotes");

  const saveWeeklyNotesBtn = document.getElementById("saveWeeklyNotes");

  // Variables de estado para la sede activa (se cargan dinámicamente)

  let employees = [];

  let attendance = {};

  let weeklyHoursConfig = {};

  let dailyTopics = {};

  let weeklyNotes = {};

  let weeklyNotesLog = {};

  let selectedEmployeeForAttendance = null;

  let editingEmployeeIndex = null;

  let previousEmployeeName = "";

  let editingAttendanceName = null;

  let editingAttendanceDate = null;

  let quickAttendanceChart;

  // Estado de orden para la tabla diaria

  let dailySort = { key: null, dir: "asc" };

  const TIME_PATTERN = /^\d{2}:\d{2}$/;

  const isValidTime = (value) =>
    typeof value === "string" && TIME_PATTERN.test(value);

  const isCompleteAttendanceRecord = (record) =>
    !!(
      record &&
      isValidTime(record.checkIn) &&
      isValidTime(record.checkOut)
    );

  // --- Utilidades generales ---

  const downloadFile = (filename, content, type = "application/json") => {
    const blob = new Blob([content], { type });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);
  };

  const migrateImportedData = (raw) => {
    // Soporte para backups antiguos (sin estructura por sedes)

    if (raw && !raw.locations && (raw.employees || raw.attendance)) {
      const wrapped = {
        locations: locations,

        currentLocationIndex: 0,

        data: {},

        locationDetails: {},
      };

      locations.forEach((loc) => {
        wrapped.data[loc] = {
          employees: Array.isArray(raw.employees) ? raw.employees : [],

          attendance: raw.attendance || {},

          weeklyHoursConfig: raw.weeklyHoursConfig || {
            0: 0,
            1: 9,
            2: 9,
            3: 9,
            4: 9,
            5: 9,
            6: 5,
          },

          dailyTopics: {},

          weeklyNotes: {},

          weeklyNotesLog: {},
        };

        wrapped.locationDetails[loc] = { address: "" };
      });

      return wrapped;
    }

    return raw;
  };

  const validateAppData = (data) => {
    if (!data || typeof data !== "object") return false;

    if (!Array.isArray(data.locations)) return false;

    if (!data.data || typeof data.data !== "object") return false;

    const first = data.locations[0];

    if (!first || !data.data[first]) return false;

    return true;
  };

  // Asegura que existan todas las sedes definidas en appData.locations dentro de appData.data

  const ensureLocationsConsistency = () => {
    // appData.locations es la fuente de verdad; inicializar si no existe

    if (!Array.isArray(appData.locations)) {
      appData.locations = Array.isArray(locations) ? [...locations] : [];
    }

    // Sincronizar variable local 'locations' desde appData.locations

    locations = [...appData.locations];

    // Eliminar datos de sedes que ya no están en la lista maestra

    if (appData.data) {
      Object.keys(appData.data).forEach((locName) => {
        if (!appData.locations.includes(locName)) {
          delete appData.data[locName];
        }
      });
    }

    if (appData.locationDetails) {
      Object.keys(appData.locationDetails).forEach((locName) => {
        if (!appData.locations.includes(locName)) {
          delete appData.locationDetails[locName];
        }
      });
    }

    // Edición de sede existente

    if (editLocationToggle && editLocationInline) {
      editLocationToggle.addEventListener("click", () => {
        editLocationInline.classList.toggle("hidden");

        if (!editLocationInline.classList.contains("hidden")) {
          const idx = appData.currentLocationIndex || 0;

          const name = (appData.locations || [])[idx] || "";

          const addr =
            appData.locationDetails && appData.locationDetails[name]
              ? appData.locationDetails[name].address || ""
              : "";

          editLocationNameInput.value = name;

          editLocationAddressInput.value = addr;

          editLocationNameInput.focus();
        }
      });
    }

    if (cancelEditLocationBtn && editLocationInline) {
      cancelEditLocationBtn.addEventListener("click", () => {
        editLocationInline.classList.add("hidden");
      });
    }

    if (saveEditLocationBtn) {
      saveEditLocationBtn.addEventListener("click", () => {
        const idx = appData.currentLocationIndex || 0;

        const oldName = (appData.locations || [])[idx];

        if (!oldName) {
          alert("No hay sede seleccionada.");
          return;
        }

        const newName = (editLocationNameInput.value || "").trim();

        const newAddress = (editLocationAddressInput.value || "").trim();

        if (!newName) {
          alert("Ingresa el nombre corto.");
          return;
        }

        if (newName !== oldName && appData.locations.includes(newName)) {
          alert("Ya existe una losa con ese nombre.");
          return;
        }

        // Actualizar estructuras: si cambia el nombre, mover keys

        if (newName !== oldName) {
          // mover data

          appData.data[newName] = appData.data[oldName] || {
            employees: [],
            attendance: {},
            weeklyHoursConfig: {
              0: 0,
              1: 9,
              2: 9,
              3: 9,
              4: 9,
              5: 9,
              6: 5,
            },
            dailyTopics: {},
          };

          delete appData.data[oldName];

          // mover detalles

          const oldDet = (appData.locationDetails &&
            appData.locationDetails[oldName]) || { address: "" };

          if (!appData.locationDetails) appData.locationDetails = {};

          appData.locationDetails[newName] = oldDet;

          delete appData.locationDetails[oldName];

          // actualizar nombre en lista

          appData.locations[idx] = newName;

          locations = appData.locations;

          currentLocationName = newName;
        }

        // Actualizar dirección

        if (!appData.locationDetails) appData.locationDetails = {};

        if (!appData.locationDetails[newName])
          appData.locationDetails[newName] = { address: "" };

        appData.locationDetails[newName].address = newAddress;

        // Refrescar UI

        renderLocationPanelList();

        currentLocationNameEl.textContent = newName;

        if (currentLocationAddressEl)
          currentLocationAddressEl.textContent = newAddress;

        editLocationInline.classList.add("hidden");

        saveData();
      });
    }

    if (!appData.data || typeof appData.data !== "object")
      appData.data = {};

    if (
      !appData.locationDetails ||
      typeof appData.locationDetails !== "object"
    )
      appData.locationDetails = {};

    appData.locations.forEach((loc) => {
      if (!appData.data[loc]) {
        appData.data[loc] = {
          employees: [],

          attendance: {},

          weeklyHoursConfig: { 0: 0, 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 5 },

          dailyTopics: {},
        };
      } else {
        if (!appData.data[loc].dailyTopics)
          appData.data[loc].dailyTopics = {};

        if (!appData.data[loc].weeklyHoursConfig)
          appData.data[loc].weeklyHoursConfig = {
            0: 0,
            1: 9,
            2: 9,
            3: 9,
            4: 9,
            5: 9,
            6: 5,
          };
      }

      if (!appData.locationDetails[loc])
        appData.locationDetails[loc] = { address: "" };
    });

    // Sincronizar variable local

    locations = appData.locations;

    if (
      typeof appData.currentLocationIndex !== "number" ||
      appData.currentLocationIndex < 0 ||
      appData.currentLocationIndex >= appData.locations.length
    ) {
      appData.currentLocationIndex = 0;
    }
  };

  // --- CONSTRUCTOR DE REPORTE JSON PARA IA ---

  const normalizeTopicEntry = (entry) => {
    if (entry && typeof entry === "object") {
      return {
        topic: entry.topic || "",
        duration: entry.duration ?? null,
      };
    }

    return { topic: entry || "", duration: null };
  };

  const listAllDates = (attendanceMap) => {
    const dates = new Set(Object.keys(attendanceMap || {}));

    // También considerar fechas desde topics (por si hay tema sin asistencias)

    const topicsMap =
      (appData.data[currentLocationName] &&
        appData.data[currentLocationName].dailyTopics) ||
      {};

    Object.keys(topicsMap).forEach((d) => dates.add(d));

    return Array.from(dates).sort();
  };

  const buildDailyForLocation = (locName, locData) => {
    const results = {};

    const dates = new Set([
      ...Object.keys(locData.attendance || {}),

      ...Object.keys(locData.dailyTopics || {}),
    ]);

    const datesSorted = Array.from(dates).sort();

    datesSorted.forEach((date) => {
      const topicEntry = normalizeTopicEntry(
        (locData.dailyTopics || {})[date]
      );

      const expectedHours = getExpectedHoursForDate(date);

      const active = (() => {
        const prevEmployees = employees; // guardar ref

        const prevAttendance = attendance;

        // Cambiar contexto a la sede

        employees = locData.employees || [];

        attendance = locData.attendance || {};

        const arr = employeesForDate(date);

        // restaurar

        employees = prevEmployees;
        attendance = prevAttendance;

        return arr;
      })();

      const activeSet = new Set(active.map((e) => e.name));

      const dailyAttendance = (locData.attendance || {})[date] || [];

      const presentMap = new Map(dailyAttendance.map((r) => [r.name, r]));

      const names = Array.from(
        new Set([
          ...active.map((e) => e.name),
          ...dailyAttendance.map((r) => r.name),
        ])
      );

      let presentCount = 0,
        absentCount = 0;

      const empByName = new Map(
        (locData.employees || []).map((e) => [e.name, e])
      );

      const records = names.map((name) => {
        const emp = empByName.get(name) || { dni: "", position: "" };

        const rec = presentMap.get(name);

        const hasCompleteRecord = isCompleteAttendanceRecord(rec);

        const observation = rec && rec.observation ? rec.observation : "";

        if (hasCompleteRecord) {
          const { total, overtime } = calculateHours(
            rec.checkIn,
            rec.checkOut,
            date
          );

          presentCount++;

          return {
            name,
            dni: emp.dni,
            position: emp.position,

            present: true,

            checkIn: rec.checkIn,
            checkOut: rec.checkOut,

            totalHours: total,
            overtime,

            observation,
          };
        }

        absentCount++;

        return {
          name,
          dni: emp.dni,
          position: emp.position,

          present: false,

          checkIn: rec && rec.checkIn ? rec.checkIn : "-",

          checkOut: rec && rec.checkOut ? rec.checkOut : "-",

          totalHours: null,
          overtime: null,

          observation,
        };
      });

      results[date] = {
        date,

        topic: topicEntry.topic,

        durationMinutes: topicEntry.duration,

        expectedHours,

        presentCount,

        absentCount,

        totalActiveEmployees: active.length,

        records,
      };
    });

    return results;
  };

  const buildWeeklyForLocation = (locName, locData) => {
    const weekly = {};

    const allDates = new Set([
      ...Object.keys(locData.attendance || {}),

      ...Object.keys(locData.dailyTopics || {}),
    ]);

    const sorted = Array.from(allDates).sort();

    const weekKey = (dateStr) => {
      const d = new Date(dateStr + "T00:00:00");

      const { year, week } = getISOWeekInfo(d);

      return `${year}-W${String(week).padStart(2, "0")}`;
    };

    // Cambiar contexto temporalmente para reutilizar helpers

    const prevEmployees = employees;

    const prevAttendance = attendance;

    employees = locData.employees || [];

    attendance = locData.attendance || {};

    sorted.forEach((date) => {
      const wk = weekKey(date);

      if (!weekly[wk])
        weekly[wk] = {
          week: wk,
          days: [],
          summary: { totalPresent: 0, totalAbsent: 0 },
        };

      const days = getWeekDatesFromDate(date).slice(0, 6); // Lun-Sáb

      // Solo llenar una vez por semana

      if (weekly[wk].days.length === 0) {
        days.forEach((d) => {
          const dayList = attendance[d] || [];

          const activeEmps = employeesForDate(d);

          const activeSet = new Set(activeEmps.map((e) => e.name));

          const present = dayList.filter((r) =>
            activeSet.has(r.name)
          ).length;

          const absent = Math.max(0, activeEmps.length - present);

          weekly[wk].days.push({
            date: d,
            present,
            absent,
            activeEmployees: activeEmps.length,
          });

          weekly[wk].summary.totalPresent += present;

          weekly[wk].summary.totalAbsent += absent;
        });
      }
    });

    // restaurar contexto

    employees = prevEmployees;
    attendance = prevAttendance;

    return weekly;
  };

  const buildFullReport = () => {
    const stamped = new Date();

    const report = {
      version: 1,

      generatedAtISO: stamped.toISOString(),

      locations: appData.locations.slice(),

      currentLocationIndex: appData.currentLocationIndex,

      byLocation: {},
    };

    appData.locations.forEach((locName) => {
      const locData = appData.data[locName] || {
        employees: [],
        attendance: {},
        weeklyHoursConfig: {},
        dailyTopics: {},
        weeklyNotes: {},
        weeklyNotesLog: {},
      };

      // Copias profundas mínimas

      const employeesCopy = (locData.employees || []).map((e) => ({
        name: e.name,
        dni: e.dni,
        position: e.position,
        statusEvents: (e.statusEvents || []).map((ev) => ({
          date: ev.date,
          active: !!ev.active,
        })),
      }));

      const attendanceCopy = JSON.parse(
        JSON.stringify(locData.attendance || {})
      );

      // Normalizar topics a objeto

      const topicsCopy = {};

      Object.entries(locData.dailyTopics || {}).forEach(([d, ent]) => {
        topicsCopy[d] = normalizeTopicEntry(ent);
      });

      const daily = buildDailyForLocation(locName, locData);

      const weekly = buildWeeklyForLocation(locName, locData);

      report.byLocation[locName] = {
        employees: employeesCopy,

        attendance: attendanceCopy,

        weeklyHoursConfig: { ...locData.weeklyHoursConfig },

        topics: topicsCopy,

        weeklyNotes: { ...(locData.weeklyNotes || {}) },

        weeklyNotesLog: { ...(locData.weeklyNotesLog || {}) },

        computed: {
          daily,

          weekly,
        },
      };
    });

    return report;
  };

  const buildMonthlyTablesReport = () => {
    const stamped = new Date();

    const report = {
      version: 1,

      generatedAtISO: stamped.toISOString(),

      description:
        "Reporte mensual por losa con tablas de asistencias, personal activo y charlas diarias",

      losas: {},
    };

    appData.locations.forEach((locName) => {
      const locData = appData.data[locName] || {
        employees: [],

        attendance: {},

        dailyTopics: {},
      };

      // Agrupar por mes

      const monthlyData = {};

      const allDates = new Set([
        ...Object.keys(locData.attendance || {}),

        ...Object.keys(locData.dailyTopics || {}),
      ]);

      // Cambiar contexto temporalmente

      const prevEmployees = employees;

      const prevAttendance = attendance;

      employees = locData.employees || [];

      attendance = locData.attendance || {};

      Array.from(allDates)
        .sort()
        .forEach((dateStr) => {
          const [year, month] = dateStr.split("-");

          const monthKey = `${year}-${month}`;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              mes: monthKey,

              asistencias: [],

              personalActivo: [],

              charlasDiarias: [],
            };
          }

          // Obtener personal activo para esta fecha

          const activeEmps = employeesForDate(dateStr);

          const activeSet = new Set(activeEmps.map((e) => e.name));

          // Registros de asistencia del día

          const dailyAttendance =
            (locData.attendance || {})[dateStr] || [];

          const validAttendance = dailyAttendance.filter(
            isCompleteAttendanceRecord
          );

          const presentMap = new Map(
            dailyAttendance.map((r) => [r.name, r])
          );

          // Contar presentes

          const presentCount = validAttendance.filter((r) =>
            activeSet.has(r.name)
          ).length;

          // Agregar datos numéricos de personal activo

          monthlyData[monthKey].personalActivo.push({
            fecha: dateStr,

            totalActivos: activeEmps.length,

            asistieron: presentCount,

            ausentes: activeEmps.length - presentCount,
          });

          // Construir tabla de asistencias del día

          activeEmps.forEach((emp) => {
            const rec = presentMap.get(emp.name);

            const hasCompleteRecord = isCompleteAttendanceRecord(rec);

            if (hasCompleteRecord) {
              const { total, overtime } = calculateHours(
                rec.checkIn,
                rec.checkOut,
                dateStr
              );

              monthlyData[monthKey].asistencias.push({
                fecha: dateStr,

                nombre: emp.name,

                dni: emp.dni || "",

                cargo: emp.position || "",

                horaEntrada: rec.checkIn || "-",

                horaSalida: rec.checkOut || "-",

                horasTrabajadas:
                  typeof total === "number"
                    ? parseFloat(total.toFixed(2))
                    : null,

                horasExtra:
                  typeof overtime === "number"
                    ? parseFloat(overtime.toFixed(2))
                    : null,

                presente: true,
              });
            } else {
              monthlyData[monthKey].asistencias.push({
                fecha: dateStr,

                nombre: emp.name,

                dni: emp.dni || "",

                cargo: emp.position || "",

                horaEntrada: rec && rec.checkIn ? rec.checkIn : "-",

                horaSalida: rec && rec.checkOut ? rec.checkOut : "-",

                horasTrabajadas: null,

                horasExtra: null,

                presente: false,
              });
            }
          });

          // Charla del día

          const topicEntry = normalizeTopicEntry(
            (locData.dailyTopics || {})[dateStr]
          );

          if (topicEntry.topic || topicEntry.duration !== null) {
            monthlyData[monthKey].charlasDiarias.push({
              fecha: dateStr,

              tema: topicEntry.topic || "",

              duracionMinutos: topicEntry.duration,
            });
          }
        });

      // Restaurar contexto

      employees = prevEmployees;

      attendance = prevAttendance;

      report.losas[locName] = {
        nombreLosa: locName,

        direccion:
          appData.locationDetails && appData.locationDetails[locName]
            ? appData.locationDetails[locName].address || ""
            : "",

        meses: monthlyData,
      };
    });

    return report;
  };

  // --- Helpers de fecha y estado histórico de empleados ---

  const toYMD = (d) => {
    const yyyy = d.getFullYear();

    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeStatusEvents = (emp) => {
    if (
      !emp.statusEvents ||
      !Array.isArray(emp.statusEvents) ||
      emp.statusEvents.length === 0
    ) {
      emp.statusEvents = [{ date: "0001-01-01", active: true }];
    }

    emp.statusEvents = emp.statusEvents

      .filter(
        (ev) =>
          ev &&
          typeof ev.date === "string" &&
          ev.date.length === 10 &&
          typeof ev.active !== "undefined"
      )

      .sort((a, b) => a.date.localeCompare(b.date));

    const dedup = new Map();

    emp.statusEvents.forEach((ev) => {
      dedup.set(ev.date, { date: ev.date, active: !!ev.active });
    });

    emp.statusEvents = Array.from(dedup.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return emp;
  };

  const isActiveOnDate = (emp, dateStr) => {
    normalizeStatusEvents(emp);

    // Por defecto, un empleado NO está activo antes de su primer evento

    let state = false;

    for (const ev of emp.statusEvents) {
      if (ev.date <= dateStr) state = !!ev.active;
      else break;
    }

    return state;
  };

  const employeesForDate = (dateStr) => {
    return employees.filter((emp) => isActiveOnDate(emp, dateStr));
  };

  const setEmployeeActiveFromDate = (emp, dateStr, active) => {
    normalizeStatusEvents(emp);

    const idx = emp.statusEvents.findIndex((ev) => ev.date === dateStr);

    if (idx > -1) emp.statusEvents[idx].active = !!active;
    else emp.statusEvents.push({ date: dateStr, active: !!active });

    emp.statusEvents.sort((a, b) => a.date.localeCompare(b.date));
  };

  const migrateEmployeesStructure = () => {
    if (!appData || !appData.data) return;

    Object.values(appData.data).forEach((loc) => {
      (loc.employees || []).forEach((e) => normalizeStatusEvents(e));
    });

    // Exportar/Importar JSON (respaldo)

    if (exportJsonBtn)
      exportJsonBtn.addEventListener("click", () => {
        try {
          const stamped = new Date();

          const yyyy = stamped.getFullYear();

          const mm = String(stamped.getMonth() + 1).padStart(2, "0");

          const dd = String(stamped.getDate()).padStart(2, "0");

          const hh = String(stamped.getHours()).padStart(2, "0");

          const mi = String(stamped.getMinutes()).padStart(2, "0");

          const ss = String(stamped.getSeconds()).padStart(2, "0");

          const filename = `backup_asistencias_${yyyy}${mm}${dd}_${hh}${mi}${ss}.json`;

          // Crear backup completo con metadatos adicionales
          const completeBackup = {
            // Metadatos del backup
            _metadata: {
              version: "1.0",
              exportDate: stamped.toISOString(),
              exportTimestamp: stamped.getTime(),
              appVersion: "Sistema de Registro de Asistencias",
              description: "Backup completo de todos los datos de la aplicación"
            },

            // Datos completos de la aplicación
            ...appData,

            // Estadísticas del backup (para verificación)
            _stats: {
              totalLocations: appData.locations ? appData.locations.length : 0,
              enabledLocations: appData.locations ? appData.locations.filter(loc =>
                !appData.disabledLocations || !appData.disabledLocations.includes(loc)
              ).length : 0,
              disabledLocations: appData.disabledLocations ? appData.disabledLocations.length : 0,
              totalEmployees: Object.keys(appData.data || {}).reduce((sum, loc) => {
                return sum + (appData.data[loc].employees ? appData.data[loc].employees.length : 0);
              }, 0),
              totalAttendanceRecords: Object.keys(appData.data || {}).reduce((sum, loc) => {
                return sum + Object.keys(appData.data[loc].attendance || {}).length;
              }, 0),
              locationsWithData: Object.keys(appData.data || {}).length
            }
          };

          downloadFile(filename, JSON.stringify(completeBackup, null, 2));

          // Mostrar resumen de lo exportado
          const stats = completeBackup._stats;
          alert(
            `✅ Backup exportado exitosamente!\n\n` +
            `📊 Resumen del backup:\n` +
            `• Total de losas: ${stats.totalLocations}\n` +
            `• Losas habilitadas: ${stats.enabledLocations}\n` +
            `• Losas deshabilitadas: ${stats.disabledLocations}\n` +
            `• Total de empleados: ${stats.totalEmployees}\n` +
            `• Total de registros de asistencia: ${stats.totalAttendanceRecords}\n\n` +
            `📁 Archivo: ${filename}\n\n` +
            `Este backup incluye:\n` +
            `✓ Todos los empleados (habilitados y deshabilitados)\n` +
            `✓ Todos los registros de asistencia\n` +
            `✓ Todas las losas (habilitadas y deshabilitadas)\n` +
            `✓ Configuración de horas semanales\n` +
            `✓ Temas del día\n` +
            `✓ Notas semanales y registros\n` +
            `✓ Detalles de ubicaciones`
          );
        } catch (e) {
          alert(
            "No se pudo exportar el JSON: " +
            (e && e.message ? e.message : e)
          );
        }
      });

    if (importJsonBtn && importJsonInput) {
      importJsonBtn.addEventListener("click", () =>
        importJsonInput.click()
      );

      importJsonInput.addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onerror = () =>
          alert("Error leyendo archivo seleccionado.");

        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);

            // Extraer metadatos si existen
            const metadata = parsed._metadata || null;
            const stats = parsed._stats || null;

            // Limpiar metadatos antes de migrar (no son parte de appData)
            const cleanData = { ...parsed };
            delete cleanData._metadata;
            delete cleanData._stats;

            const migrated = migrateImportedData(cleanData);

            if (!validateAppData(migrated)) {
              alert("El archivo no tiene el formato esperado.");

              return;
            }

            // Mostrar información del backup antes de importar
            let confirmMessage = "⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales.\n\n";

            if (metadata) {
              confirmMessage += `📋 Información del backup:\n`;
              confirmMessage += `• Fecha de exportación: ${new Date(metadata.exportDate).toLocaleString()}\n`;
              confirmMessage += `• Versión: ${metadata.version}\n\n`;
            }

            if (stats) {
              confirmMessage += `📊 Contenido del backup:\n`;
              confirmMessage += `• Total de losas: ${stats.totalLocations}\n`;
              confirmMessage += `• Losas habilitadas: ${stats.enabledLocations}\n`;
              confirmMessage += `• Losas deshabilitadas: ${stats.disabledLocations}\n`;
              confirmMessage += `• Total de empleados: ${stats.totalEmployees}\n`;
              confirmMessage += `• Total de registros: ${stats.totalAttendanceRecords}\n\n`;
            }

            confirmMessage += "¿Deseas continuar con la importación?";

            if (!confirm(confirmMessage)) return;

            appData = migrated;

            // Asegurar estructura de status por empleado

            migrateEmployeesStructure();

            // Restablecer sede actual y cargar datos

            const idx = Math.min(
              Math.max(appData.currentLocationIndex || 0, 0),
              appData.locations.length - 1
            );

            currentLocationName = appData.locations[idx];

            appData.currentLocationIndex = idx;

            currentLocationNameEl.textContent = currentLocationName;

            loadLocationData();

            // Persistir y refrescar UI

            saveData();

            renderEmployeeList();

            renderCustomDropdown();

            renderAllReports();

            updateIsoWeekBadge();

            // Mostrar resumen de importación
            let successMessage = "✅ Datos importados correctamente!\n\n";
            successMessage += `📊 Se importaron:\n`;
            successMessage += `• ${appData.locations.length} losas\n`;
            successMessage += `• ${Object.keys(appData.data || {}).reduce((sum, loc) => {
              return sum + (appData.data[loc].employees ? appData.data[loc].employees.length : 0);
            }, 0)} empleados\n`;
            successMessage += `• Todos los registros de asistencia\n`;
            successMessage += `• Configuraciones y notas`;

            alert(successMessage);
          } catch (e) {
            alert(
              "Error al importar el archivo JSON: " +
              (e && e.message ? e.message : e)
            );
          } finally {
            ev.target.value = "";
          }
        };

        reader.readAsText(file, "utf-8");
      });
    }

    // Cargar datos de muestra
    if (loadSampleDataBtn) {
      loadSampleDataBtn.addEventListener("click", () => {
        const confirmMessage = "⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales con datos de muestra.\n\n" +
          "¿Estás seguro de que deseas continuar?";

        if (!confirm(confirmMessage)) return;

        if (!window.DemoData) {
          alert("No se pudo cargar el generador de datos de muestra (demo-data.js).");
          return;
        }

        try {
          appData = window.DemoData.build();
          window.DemoData.markSeeded();

          ensureLocationsConsistency();
          migrateEmployeesStructure();

          const idx = Math.min(
            Math.max(appData.currentLocationIndex || 0, 0),
            appData.locations.length - 1
          );
          appData.currentLocationIndex = idx;

          currentLocationName = appData.locations[idx];
          currentLocationNameEl.textContent = currentLocationName;

          if (currentLocationAddressEl) {
            const addr =
              (appData.locationDetails &&
                appData.locationDetails[currentLocationName] &&
                appData.locationDetails[currentLocationName].address) ||
              "";
            currentLocationAddressEl.textContent = addr;
          }

          loadLocationData();
          saveData();
          renderLocationPanelList();

          renderEmployeeList();
          renderCustomDropdown();
          renderAllReports();
          updateIsoWeekBadge();

          const successMessage = "✅ Datos de muestra cargados correctamente!\n\n" +
            "📊 Se han cargado:\n" +
            "• 3 losas deportivas con su personal (34 trabajadores)\n" +
            "• ~7 semanas de registros de asistencia\n" +
            "• Charlas SSOMA diarias y notas semanales\n" +
            "• Planilla semanal con incidencias ya revisadas";

          alert(successMessage);
        } catch (e) {
          alert("Error al cargar datos de muestra: " + (e && e.message ? e.message : e));
        }
      });
    }
  };

  // Exportar Reporte JSON (IA)

  if (exportReportJsonBtn) {
    exportReportJsonBtn.addEventListener("click", () => {
      try {
        const report = buildMonthlyTablesReport();

        const stamped = new Date();

        const yyyy = stamped.getFullYear();

        const mm = String(stamped.getMonth() + 1).padStart(2, "0");

        const dd = String(stamped.getDate()).padStart(2, "0");

        const hh = String(stamped.getHours()).padStart(2, "0");

        const mi = String(stamped.getMinutes()).padStart(2, "0");

        const ss = String(stamped.getSeconds()).padStart(2, "0");

        const filename = `reporte_mensual_tablas_${yyyy}${mm}${dd}_${hh}${mi}${ss}.json`;

        downloadFile(filename, JSON.stringify(report, null, 2));
      } catch (e) {
        alert(
          "No se pudo generar el reporte mensual: " +
          (e && e.message ? e.message : e)
        );
      }
    });
  }

  // Exportar JSON de la losa actual (mes)

  const exportLocationMonthJsonBtn = document.getElementById("exportLocationMonthJsonBtn");

  if (exportLocationMonthJsonBtn) {
    exportLocationMonthJsonBtn.addEventListener("click", () => {
      try {
        // Obtener el mes actual
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
        const monthKey = `${currentYear}-${currentMonth}`;

        // Obtener datos de la losa actual
        const locData = appData.data[currentLocationName] || {
          employees: [],
          attendance: {},
          dailyTopics: {},
        };

        // Filtrar datos del mes actual
        const monthlyAttendance = {};
        const monthlyTopics = {};

        // Filtrar asistencias del mes actual
        Object.keys(locData.attendance || {}).forEach(dateStr => {
          if (dateStr.startsWith(monthKey)) {
            monthlyAttendance[dateStr] = locData.attendance[dateStr];
          }
        });

        // Filtrar temas del mes actual
        Object.keys(locData.dailyTopics || {}).forEach(dateStr => {
          if (dateStr.startsWith(monthKey)) {
            monthlyTopics[dateStr] = locData.dailyTopics[dateStr];
          }
        });

        // Crear objeto con datos filtrados
        const monthlyData = {
          version: 1,
          generatedAtISO: currentDate.toISOString(),
          description: `Datos de la losa "${currentLocationName}" para el mes ${monthKey}`,
          losa: currentLocationName,
          direccion: appData.locationDetails && appData.locationDetails[currentLocationName]
            ? appData.locationDetails[currentLocationName].address || ""
            : "",
          mes: monthKey,
          empleados: locData.employees || [],
          asistencias: monthlyAttendance,
          temasDelDia: monthlyTopics,
          configuracionHorasSemanales: locData.weeklyHoursConfig || {},
          notasSemanales: locData.weeklyNotes || {},
          logNotasSemanales: locData.weeklyNotesLog || {}
        };

        // Generar nombre de archivo
        const stamped = new Date();
        const yyyy = stamped.getFullYear();
        const mm = String(stamped.getMonth() + 1).padStart(2, "0");
        const dd = String(stamped.getDate()).padStart(2, "0");
        const hh = String(stamped.getHours()).padStart(2, "0");
        const mi = String(stamped.getMinutes()).padStart(2, "0");
        const ss = String(stamped.getSeconds()).padStart(2, "0");

        // Limpiar nombre de losa para el archivo
        const cleanLocationName = currentLocationName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const filename = `${cleanLocationName}_mes_${yyyy}${mm}_${dd}_${hh}${mi}${ss}.json`;

        downloadFile(filename, JSON.stringify(monthlyData, null, 2));

        // Mostrar información al usuario
        const totalDays = Object.keys(monthlyAttendance).length;
        alert(`Exportación completada:\n- Losa: ${currentLocationName}\n- Mes: ${monthKey}\n- Días con registros: ${totalDays}\n- Empleados: ${monthlyData.empleados.length}`);

      } catch (e) {
        alert(
          "No se pudo exportar los datos de la losa: " +
          (e && e.message ? e.message : e)
        );
      }
    });
  }

  // --- LÓGICA DE GESTIÓN DE DATOS POR SEDE ---

  const saveData = async () => {
    try {
      await storage.save(appData);
    } catch (error) {
      console.error("Error al guardar datos:", error);
    }

    await refreshStorageStatus();
  };

  const saveEmployees = () => {
    appData.data[currentLocationName].employees = employees;

    saveData();
  };

  // --- Notas generales estructuradas (log de eventos por semana) ---

  const addWeeklyLogEntry = ({ type, dateStr, employee }) => {
    const weekKey = getWeekKeyFromDateStr(dateStr);

    if (!appData.data[currentLocationName].weeklyNotesLog)
      appData.data[currentLocationName].weeklyNotesLog = {};

    const arr =
      appData.data[currentLocationName].weeklyNotesLog[weekKey] || [];

    const entry = {
      date: dateStr,

      event: type,

      name: employee.name,

      dni: employee.dni || "",

      position: employee.position || "",
    };

    arr.push(entry);

    appData.data[currentLocationName].weeklyNotesLog[weekKey] = arr;

    weeklyNotesLog = appData.data[currentLocationName].weeklyNotesLog;

    saveData();
  };

  // Notas generales por semana (por sede)

  const loadWeeklyNotes = () => {
    if (!weeklyNotesInput) return;

    const weekKey = getWeekKeyFromDateStr(reportDateInput.value);

    const data = appData.data[currentLocationName] || {};

    const notesMap = data.weeklyNotes || {};

    weeklyNotes = notesMap; // mantener cache en memoria

    weeklyNotesInput.value = notesMap[weekKey] || "";
  };

  const saveWeeklyNotesValue = () => {
    if (!weeklyNotesInput) return;

    const weekKey = getWeekKeyFromDateStr(reportDateInput.value);

    const text = (weeklyNotesInput.value || "").trim();

    if (!appData.data[currentLocationName].weeklyNotes)
      appData.data[currentLocationName].weeklyNotes = {};

    appData.data[currentLocationName].weeklyNotes[weekKey] = text;

    weeklyNotes = appData.data[currentLocationName].weeklyNotes;

    saveData();
  };

  if (saveWeeklyNotesBtn) {
    saveWeeklyNotesBtn.addEventListener("click", saveWeeklyNotesValue);
  }

  if (weeklyNotesInput) {
    weeklyNotesInput.addEventListener("blur", saveWeeklyNotesValue);

    weeklyNotesInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveWeeklyNotesValue();
        weeklyNotesInput.blur();
      }
    });
  }

  // --- Modal dinámico: Registros generales de la semana ---

  let weeklyLogModalEl = null;

  let weeklyLogTableBodyEl = null;

  let weeklyLogCaptionEl = null;

  let closeWeeklyLogModalBtn = null;

  let saveWeeklyLogBtn = null;

  let addWeeklyLogEntryBtn = null;

  const ensureWeeklyLogModal = () => {
    if (weeklyLogModalEl) return;

    const wrapper = document.createElement("div");

    wrapper.id = "weeklyLogModal";

    wrapper.className =
      "fixed inset-0 bg-black/60 flex items-center justify-center z-50 hidden";

    wrapper.innerHTML = `

            <div class="bg-slate-900 w-[95vw] max-w-3xl rounded-lg shadow-xl border border-slate-700">

                <div class="flex items-center justify-between px-4 py-3 border-b border-slate-700">

                    <h3 class="text-lg font-semibold">Registros generales de la semana</h3>

                    <button id="closeWeeklyLogModal" class="btn btn-secondary px-2 py-1 rounded-md">✕</button>

                </div>

                <div class="p-4 space-y-3">

                    <div class="text-sm text-slate-300" id="weeklyLogCaption"></div>

                    <div class="overflow-x-auto">

                        <table class="w-full text-sm">

                            <thead class="bg-slate-800">

                                <tr>

                                    <th class="px-2 py-2 text-left">Fecha</th>

                                    <th class="px-2 py-2 text-left">Evento</th>

                                    <th class="px-2 py-2 text-left">Empleado</th>

                                    <th class="px-2 py-2 text-left">DNI</th>

                                    <th class="px-2 py-2 text-left">Cargo</th>

                                    <th class="px-2 py-2 text-right">Acciones</th>

                                </tr>

                            </thead>

                            <tbody id="weeklyLogTableBody"></tbody>

                        </table>

                    </div>

                    <div class="flex items-center justify-end gap-2 pt-2">

                        <button id="addWeeklyLogEntryBtn" class="btn btn-secondary px-3 py-1 rounded-md">Agregar registro</button>

                        <button id="saveWeeklyLogBtn" class="btn btn-primary px-4 py-2 rounded-md">Guardar cambios</button>

                    </div>

                </div>

            </div>`;

    document.body.appendChild(wrapper);

    weeklyLogModalEl = wrapper;

    weeklyLogTableBodyEl = wrapper.querySelector("#weeklyLogTableBody");

    weeklyLogCaptionEl = wrapper.querySelector("#weeklyLogCaption");

    closeWeeklyLogModalBtn = wrapper.querySelector(
      "#closeWeeklyLogModal"
    );

    saveWeeklyLogBtn = wrapper.querySelector("#saveWeeklyLogBtn");

    addWeeklyLogEntryBtn = wrapper.querySelector("#addWeeklyLogEntryBtn");

    closeWeeklyLogModalBtn.addEventListener("click", () =>
      weeklyLogModalEl.classList.add("hidden")
    );

    wrapper.addEventListener("click", (e) => {
      if (e.target === wrapper) wrapper.classList.add("hidden");
    });

    addWeeklyLogEntryBtn.addEventListener("click", () =>
      addWeeklyLogRow()
    );

    saveWeeklyLogBtn.addEventListener("click", () =>
      saveWeeklyLogChanges()
    );
  };

  const currentWeekKey = () =>
    getWeekKeyFromDateStr(reportDateInput.value || toYMD(new Date()));

  const toDMY = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const renderWeeklyLogRows = () => {
    if (!weeklyLogTableBodyEl) return;

    const wk = currentWeekKey();

    const list =
      ((appData.data[currentLocationName] || {}).weeklyNotesLog || {})[
      wk
      ] || [];

    weeklyLogTableBodyEl.innerHTML = "";

    list

      .slice()

      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))

      .forEach((ev, idx) => {
        const tr = document.createElement("tr");

        tr.className = "border-b border-slate-700";

        tr.innerHTML = `

                    <td class="px-2 py-1"><input type="date" class="p-1 rounded-md bg-slate-800 border border-slate-600" value="${ev.date || ""
          }" data-field="date"></td>

                    <td class="px-2 py-1"><input type="text" class="w-full p-1 rounded-md bg-slate-800 border border-slate-600" value="${ev.event || ""
          }" placeholder="Evento (Nuevo personal / Baja / Reactivación)" data-field="event"></td>

                    <td class="px-2 py-1"><input type="text" class="w-full p-1 rounded-md bg-slate-800 border border-slate-600" value="${ev.name || ""
          }" data-field="name"></td>

                    <td class="px-2 py-1"><input type="text" class="w-full p-1 rounded-md bg-slate-800 border border-slate-600" value="${ev.dni || ""
          }" data-field="dni"></td>

                    <td class="px-2 py-1"><input type="text" class="w-full p-1 rounded-md bg-slate-800 border border-slate-600" value="${ev.position || ""
          }" data-field="position"></td>

                    <td class="px-2 py-1 text-right"><button class="btn btn-danger px-2 py-1 rounded-md" data-action="delete" data-index="${idx}">Eliminar</button></td>

                `;

        weeklyLogTableBodyEl.appendChild(tr);
      });

    weeklyLogTableBodyEl.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest('button[data-action="delete"]');

        if (!btn) return;

        const idx = Number(btn.getAttribute("data-index"));

        const wk2 = currentWeekKey();

        const base =
          appData.data[currentLocationName].weeklyNotesLog[wk2] || [];

        base.splice(idx, 1);

        appData.data[currentLocationName].weeklyNotesLog[wk2] = base;

        saveData();

        renderWeeklyLogRows();
      },
      { once: true }
    );
  };

  const addWeeklyLogRow = () => {
    const wk = currentWeekKey();

    if (!appData.data[currentLocationName].weeklyNotesLog)
      appData.data[currentLocationName].weeklyNotesLog = {};

    const list =
      appData.data[currentLocationName].weeklyNotesLog[wk] || [];

    const today = reportDateInput.value || toYMD(new Date());

    list.push({
      date: today,
      event: "Nuevo personal",
      name: "",
      dni: "",
      position: "",
    });

    appData.data[currentLocationName].weeklyNotesLog[wk] = list;

    saveData();

    renderWeeklyLogRows();
  };

  const openWeeklyLogModal = () => {
    ensureWeeklyLogModal();

    const wk = currentWeekKey();

    const days = getWeekDatesFromDate(
      reportDateInput.value || toYMD(new Date())
    );

    weeklyLogCaptionEl.textContent = `Semana ${wk} — Rango: ${toDMY(
      days[0]
    )} a ${toDMY(days[5])}`;

    weeklyLogModalEl.classList.remove("hidden");

    renderWeeklyLogRows();
  };

  const saveWeeklyLogChanges = () => {
    const wk = currentWeekKey();

    if (!weeklyLogTableBodyEl) return;

    const rows = Array.from(weeklyLogTableBodyEl.querySelectorAll("tr"));

    const updated = rows
      .map((tr) => {
        const get = (f) =>
          tr.querySelector(`[data-field="${f}"]`)?.value?.trim() || "";

        return {
          date: get("date"),
          event: get("event"),
          name: get("name"),
          dni: get("dni"),
          position: get("position"),
        };
      })
      .filter((ev) => ev.date && ev.event && ev.name);

    if (!appData.data[currentLocationName].weeklyNotesLog)
      appData.data[currentLocationName].weeklyNotesLog = {};

    appData.data[currentLocationName].weeklyNotesLog[wk] = updated;

    saveData();

    alert("Cambios guardados.");

    weeklyLogModalEl.classList.add("hidden");
  };

  if (manageWeeklyLogBtn) {
    manageWeeklyLogBtn.addEventListener("click", openWeeklyLogModal);
  }

  const saveWeeklyHoursConfig = () => {
    appData.data[currentLocationName].weeklyHoursConfig =
      weeklyHoursConfig;

    saveData();
  };

  const renderEmployeeList = () => {
    employeeListDiv.innerHTML = "";

    if (employees.length === 0) {
      employeeListDiv.innerHTML =
        '<p class="text-sm text-slate-400">No hay empleados registrados.</p>';

      return;
    }

    const dateRef = reportDateInput.value || toYMD(new Date());

    const term =
      employeeFilterInput && employeeFilterInput.value
        ? employeeFilterInput.value.toLowerCase().trim()
        : "";

    const matches = (emp) => {
      if (!term) return true;

      return (
        (emp.name || "").toLowerCase().includes(term) ||
        (emp.dni || "").toString().includes(term) ||
        (emp.position || "").toLowerCase().includes(term)
      );
    };

    const items = employees

      .map((emp, idx) => ({
        emp,
        idx,
        active: isActiveOnDate(emp, dateRef),
      }))

      .filter(({ emp }) => matches(emp));

    const enabled = items.filter((i) => i.active);

    const disabled = items.filter((i) => !i.active);

    const appendGroup = (title, arr) => {
      const header = document.createElement("div");

      header.className =
        "text-xs uppercase tracking-wide text-slate-400 mt-1 mb-1";

      header.textContent = `${title} (${arr.length})`;

      employeeListDiv.appendChild(header);

      if (arr.length === 0) {
        const empty = document.createElement("div");

        empty.className = "text-xs text-slate-500 mb-2";

        empty.textContent = "— Ninguno —";

        employeeListDiv.appendChild(empty);

        return;
      }

      arr.forEach(({ emp, idx }) => {
        const employeeItem = document.createElement("div");

        employeeItem.className =
          "flex justify-between items-center bg-slate-700 p-2 rounded-md";

        const activeNow = isActiveOnDate(emp, dateRef);

        const statusBtn = activeNow
          ? `<button class="bg-amber-600 hover:bg-amber-700 text-white text-xs px-2 py-1 rounded self-center" data-action="deactivate" data-index="${idx}">Deshabilitar</button>`
          : `<button class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1 rounded self-center" data-action="activate" data-index="${idx}">Habilitar</button>`;

        employeeItem.innerHTML = `

                    <div class="flex flex-col">

                        <span class="text-sm font-medium">${emp.name}</span>

                        <span class="text-xs text-slate-400">${emp.dni} - ${emp.position}</span>

                    </div>

                    <div class="flex gap-2">

                        <button class="btn-secondary text-xs px-2 py-1 rounded self-center" data-action="edit" data-index="${idx}">Editar</button>

                        ${statusBtn}

                        <button class="btn-danger text-xs px-2 py-1 rounded self-center" data-action="delete" data-index="${idx}">Eliminar</button>

                    </div>

                `;

        employeeListDiv.appendChild(employeeItem);
      });
    };

    appendGroup("Habilitados", enabled);

    const sep = document.createElement("div");

    sep.className = "border-t border-slate-600 my-2";

    employeeListDiv.appendChild(sep);

    appendGroup("Deshabilitados", disabled);
  };

  if (employeeFilterInput) {
    employeeFilterInput.addEventListener("input", () => {
      renderEmployeeList();
    });
  }

  const renderCustomDropdown = () => {
    const searchTerm = (employeeSearchSelect.value || "").toLowerCase();

    const currentDate = reportDateInput.value;

    const registeredToday = (attendance[currentDate] || []).map(
      (record) => record.name
    );

    const sourceEmployees = currentDate
      ? employeesForDate(currentDate)
      : employees;

    // Filtrar candidatos por término básico

    let candidates = sourceEmployees

      .filter((emp) => !registeredToday.includes(emp.name))

      .filter((emp) => {
        if (!searchTerm) return true; // sin término: mostrar todos activos no registrados

        return (
          emp.name.toLowerCase().includes(searchTerm) ||
          emp.dni.toLowerCase().includes(searchTerm) ||
          emp.position.toLowerCase().includes(searchTerm)
        );
      });

    // Ordenar por "mejor coincidencia": exacto > empieza con > contiene; prioridad: DNI, nombre, cargo

    const score = (emp) => {
      const name = emp.name.toLowerCase();

      const dni = String(emp.dni || "").toLowerCase();

      const pos = String(emp.position || "").toLowerCase();

      if (!searchTerm) return 1000; // sin término, mantener orden pero con misma puntuación base

      const exactDni = dni === searchTerm ? 0 : Infinity;

      const startsDni = dni.startsWith(searchTerm) ? 1 : Infinity;

      const inclDni = dni.includes(searchTerm) ? 2 : Infinity;

      const exactName = name === searchTerm ? 3 : Infinity;

      const startsName = name.startsWith(searchTerm) ? 4 : Infinity;

      const inclName = name.includes(searchTerm) ? 5 : Infinity;

      const exactPos = pos === searchTerm ? 6 : Infinity;

      const startsPos = pos.startsWith(searchTerm) ? 7 : Infinity;

      const inclPos = pos.includes(searchTerm) ? 8 : Infinity;

      return Math.min(
        exactDni,
        startsDni,
        inclDni,

        exactName,
        startsName,
        inclName,

        exactPos,
        startsPos,
        inclPos,

        9999
      );
    };

    candidates.sort((a, b) => {
      const sa = score(a);

      const sb = score(b);

      if (sa !== sb) return sa - sb;

      return a.name.localeCompare(b.name);
    });

    // Render

    employeeDropdown.innerHTML = "";

    lastDropdownEmployees = candidates;

    if (lastDropdownEmployees.length === 0) {
      employeeDropdown.innerHTML = `<div class="p-2 text-sm text-slate-400">No hay empleados disponibles.</div>`;

      dropdownActiveIndex = -1;

      return;
    }

    // Asegurar preselección del primero cuando corresponda

    if (
      dropdownActiveIndex < 0 ||
      dropdownActiveIndex >= lastDropdownEmployees.length
    ) {
      dropdownActiveIndex = 0;
    }

    lastDropdownEmployees.forEach((employee, idx) => {
      const item = document.createElement("div");

      item.className = "p-2 hover:bg-cyan-600 cursor-pointer text-sm";

      item.textContent = `${employee.name} (${employee.position})`;

      item.addEventListener("click", () => {
        selectedEmployeeForAttendance = employee;

        employeeSearchSelect.value = employee.name;

        employeeDropdown.classList.add("hidden");
      });

      employeeDropdown.appendChild(item);
    });

    // Aplicar highlight al activo (preselección visible)

    updateDropdownHighlight();
  };

  addEmployeeBtn.addEventListener("click", () => {
    const name = employeeNameInput.value.trim();

    const dni = employeeDniInput.value.trim();

    const position = employeePositionInput.value.trim();

    if (name && dni && position) {
      if (!employees.some((emp) => emp.dni === dni)) {
        // Activar al empleado desde la fecha efectiva (fecha del reporte o hoy)

        const effDate = reportDateInput.value || toYMD(new Date());

        employees.push({
          name,
          dni,
          position,
          statusEvents: [{ date: effDate, active: true }],
        });

        saveEmployees();

        // Preguntar si desea agregar a notas generales (log semanal)

        const wantLog = confirm(
          `¿Deseas agregar el ingreso de ${name} (${dni}) a los registros generales de la semana?`
        );

        if (wantLog) {
          addWeeklyLogEntry({
            type: "Nuevo personal",
            dateStr: effDate,
            employee: { name, dni, position },
          });
        }

        renderEmployeeList();

        renderCustomDropdown();

        employeeNameInput.value = "";

        employeeDniInput.value = "";

        employeePositionInput.value = "";
      } else {
        alert("El DNI de este empleado ya existe.");
      }
    } else {
      alert("Por favor, complete todos los campos del empleado.");
    }
  });

  employeeListDiv.addEventListener("click", (e) => {
    const btn = e.target.closest("button");

    if (!btn) return;

    const action = btn.getAttribute("data-action");

    const index = Number(btn.getAttribute("data-index"));

    if (Number.isNaN(index)) return;

    if (action === "delete") {
      const toDelete = employees[index];

      employees.splice(index, 1);

      if (
        selectedEmployeeForAttendance &&
        selectedEmployeeForAttendance.name === toDelete.name
      ) {
        selectedEmployeeForAttendance = null;

        employeeSearchSelect.value = "";
      }

      saveEmployees();

      renderEmployeeList();

      renderCustomDropdown();

      renderAllReports();
    } else if (action === "deactivate" || action === "activate") {
      const emp = employees[index];

      const effDate = reportDateInput.value || toYMD(new Date());

      const makeActive = action === "activate";

      const msg = makeActive
        ? `¿Reactivar a ${emp.name} desde ${effDate}?`
        : `¿Dar de baja a ${emp.name} desde ${effDate}?`;

      if (!confirm(msg)) return;

      setEmployeeActiveFromDate(emp, effDate, makeActive);

      saveEmployees();

      renderEmployeeList();

      renderCustomDropdown();

      renderAllReports();

      // Preguntar si desea agregar al log semanal

      const wantLog = confirm(
        `¿Deseas registrar esta ${makeActive ? "Reactivación" : "Baja"
        } en las Notas generales de la semana?`
      );

      if (wantLog) {
        addWeeklyLogEntry({
          type: makeActive ? "Reactivación" : "Baja",
          dateStr: effDate,
          employee: emp,
        });
      }
    } else if (action === "edit") {
      // Abrir modal con los datos actuales

      editingEmployeeIndex = index;

      previousEmployeeName = employees[index].name;

      editEmployeeName.value = employees[index].name;

      editEmployeeDni.value = employees[index].dni;

      editEmployeePosition.value = employees[index].position;

      // Campos de planilla
      if (editEmployeeProcedencia) editEmployeeProcedencia.value = employees[index].procedencia || "";
      if (editEmployeeTarifa) editEmployeeTarifa.value = employees[index].tarifaDiaria || "";
      if (editEmployeeModalidadPago) editEmployeeModalidadPago.value = employees[index].modalidadPago || "";
      if (editEmployeeBanco) editEmployeeBanco.value = employees[index].banco || "";
      if (editEmployeeCuenta) editEmployeeCuenta.value = employees[index].numeroCuenta || "";
      if (editEmployeeCCI) editEmployeeCCI.value = employees[index].cci || "";

      editModal.classList.remove("hidden");
    }
  });

  // Guardar cambios del modal

  const closeEditModal = () => {
    editModal.classList.add("hidden");

    editingEmployeeIndex = null;

    previousEmployeeName = "";
  };

  cancelEditEmployeeBtn.addEventListener("click", () => {
    closeEditModal();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !editModal.classList.contains("hidden"))
      closeEditModal();
  });

  // Cerrar modal al hacer clic en el fondo

  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
  });

  saveEditEmployeeBtn.addEventListener("click", () => {
    if (editingEmployeeIndex === null) return;

    const name = editEmployeeName.value.trim();

    const dni = editEmployeeDni.value.trim();

    const position = editEmployeePosition.value.trim();

    if (!name || !dni || !position) {
      alert("Completa nombre, DNI|CE y cargo.");
      return;
    }

    const duplicateDni = employees.some(
      (e, i) => i !== editingEmployeeIndex && e.dni === dni
    );

    if (duplicateDni) {
      alert("El DNI|CE ya existe en otro empleado.");
      return;
    }

    // Actualizar empleado

    const oldName = previousEmployeeName;

    const prevStatus = (employees[editingEmployeeIndex] &&
      employees[editingEmployeeIndex].statusEvents) || [
        { date: "0001-01-01", active: true },
      ];

    employees[editingEmployeeIndex] = {
      name,
      dni,
      position,
      statusEvents: prevStatus,
      // Payroll fields
      procedencia: editEmployeeProcedencia ? editEmployeeProcedencia.value.trim() : (employees[editingEmployeeIndex].procedencia || ""),
      tarifaDiaria: editEmployeeTarifa ? parseFloat(editEmployeeTarifa.value) || 0 : (employees[editingEmployeeIndex].tarifaDiaria || 0),
      modalidadPago: editEmployeeModalidadPago ? editEmployeeModalidadPago.value : (employees[editingEmployeeIndex].modalidadPago || ""),
      banco: editEmployeeBanco ? editEmployeeBanco.value : (employees[editingEmployeeIndex].banco || ""),
      numeroCuenta: editEmployeeCuenta ? editEmployeeCuenta.value.trim() : (employees[editingEmployeeIndex].numeroCuenta || ""),
      cci: editEmployeeCCI ? editEmployeeCCI.value.trim() : (employees[editingEmployeeIndex].cci || ""),
    };

    saveEmployees();

    // Si el empleado editado estaba seleccionado para registrar asistencia, actualizar referencia y el input

    if (
      selectedEmployeeForAttendance &&
      selectedEmployeeForAttendance.name === oldName
    ) {
      selectedEmployeeForAttendance = employees[editingEmployeeIndex];

      employeeSearchSelect.value = name;
    }

    // Propagar cambio de nombre a registros de asistencia

    if (oldName !== name) {
      const dates = Object.keys(attendance);

      for (const d of dates) {
        const list = attendance[d];

        if (!Array.isArray(list)) continue;

        for (const rec of list) {
          if (rec.name === oldName) rec.name = name;
        }
      }

      saveAttendance();
    }

    renderEmployeeList();

    renderCustomDropdown();

    renderAllReports();

    renderPayroll(); // Update payroll table

    closeEditModal();
  });

  // --- LÓGICA DE GESTIÓN DE ASISTENCIA ---

  const saveAttendance = () => {
    appData.data[currentLocationName].attendance = attendance;

    saveData();
  };

  const registerSelectedAttendance = () => {
    const checkIn = checkInTimeInput.value;

    const checkOut = checkOutTimeInput.value;

    const date = reportDateInput.value;

    if (
      !selectedEmployeeForAttendance ||
      !checkIn ||
      !checkOut ||
      !date
    ) {
      alert(
        "Por favor, seleccione un empleado y complete todos los campos de asistencia."
      );

      return;
    }

    const name = selectedEmployeeForAttendance.name;

    if (!attendance[date]) attendance[date] = [];

    const existingRecordIndex = attendance[date].findIndex(
      (record) => record.name === name
    );

    if (existingRecordIndex > -1) {
      const previousRecord = attendance[date][existingRecordIndex] || {};

      const updatedRecord = { name, checkIn, checkOut };

      if (previousRecord.observation) {
        updatedRecord.observation = previousRecord.observation;
      }

      attendance[date][existingRecordIndex] = updatedRecord;
    } else {
      attendance[date].push({ name, checkIn, checkOut });
    }

    saveAttendance();

    renderAllReports();

    selectedEmployeeForAttendance = null;

    employeeSearchSelect.value = "";

    renderCustomDropdown();

    // Reset a valores por defecto

    checkInTimeInput.value = "08:00";

    // Calcular hora de salida según el día de la semana

    const defaultCheckOut = getDefaultCheckOutTime(date, "08:00");

    checkOutTimeInput.value = defaultCheckOut;
  };

  addAttendanceBtn.addEventListener("click", registerSelectedAttendance);

  // Registrar asistencia masiva para todos los empleados no registrados hoy

  addAllAttendanceBtn.addEventListener("click", () => {
    const date = reportDateInput.value;

    const checkIn = checkInTimeInput.value || "08:00";

    const checkOut = checkOutTimeInput.value || "18:00";

    if (!date) {
      alert("Selecciona una fecha.");
      return;
    }

    if (!employees.length) {
      alert("No hay empleados.");
      return;
    }

    const dayList = attendance[date] || [];

    const registered = new Set(
      dayList

        .filter((record) => isCompleteAttendanceRecord(record))

        .map((r) => r.name)
    );

    const activeEmps = employeesForDate(date);

    const toAdd = activeEmps.filter((e) => !registered.has(e.name));

    if (toAdd.length === 0) {
      alert("Todos los empleados ya están registrados hoy.");
      return;
    }

    if (
      !confirm(
        `¿Registrar asistencia para ${toAdd.length} empleados no registrados hoy con Entrada ${checkIn} y Salida ${checkOut}?`
      )
    )
      return;

    if (!attendance[date]) attendance[date] = dayList; // asegurar referencia

    toAdd.forEach((emp) => {
      dayList.push({ name: emp.name, checkIn, checkOut });
    });

    attendance[date] = dayList;

    saveAttendance();

    renderAllReports();

    renderCustomDropdown();
  });

  // Eliminar todos los registros de asistencia del día (doble confirmación)

  if (clearAllAttendanceBtn) {
    clearAllAttendanceBtn.addEventListener("click", () => {
      const date = reportDateInput.value;

      if (!date) {
        alert("Selecciona una fecha.");
        return;
      }

      const count = (attendance[date] || []).length;

      if (count === 0) {
        alert("No hay registros para eliminar en esta fecha.");
        return;
      }

      const ok1 = confirm(
        `¿Seguro que deseas eliminar ${count} registro(s) de asistencia del ${date}?`
      );

      if (!ok1) return;

      const typed = prompt(
        "Confirmación final: escribe ELIMINAR para borrar todos los registros de hoy"
      );

      if ((typed || "").trim().toUpperCase() !== "ELIMINAR") {
        alert("Operación cancelada.");
        return;
      }

      // Borrar registros del día

      attendance[date] = [];

      saveAttendance();

      renderAllReports();

      renderCustomDropdown();

      alert("Registros de asistencia eliminados.");
    });
  }

  // Listener para guardar observaciones

  attendanceTableBody.addEventListener("input", (e) => {
    const input = e.target;

    if (!input.matches("[data-observation-for]")) return;

    const name = input.getAttribute("data-observation-for");

    const date = input.getAttribute("data-date");

    const observation = input.value.trim();

    if (!date || !name) return;

    // Buscar o crear registro de asistencia

    if (!attendance[date]) attendance[date] = [];

    const dayList = attendance[date];

    const recordIndex = dayList.findIndex((r) => r.name === name);

    const record = recordIndex > -1 ? dayList[recordIndex] : null;

    if (record) {
      if (observation) {
        record.observation = observation;

        if (
          record.observationOnly &&
          isCompleteAttendanceRecord(record)
        ) {
          delete record.observationOnly;
        }
      } else {
        delete record.observation;

        if (
          record.observationOnly &&
          !isCompleteAttendanceRecord(record)
        ) {
          dayList.splice(recordIndex, 1);
        } else {
          delete record.observationOnly;
        }
      }
    } else if (observation) {
      // Solo crear registro si hay observación

      dayList.push({
        name,
        checkIn: "",
        checkOut: "",
        observation,
        observationOnly: true,
      });
    }

    saveAttendance();
  });

  // Acciones en la tabla diaria (editar/quitar asistencia y observaciones)

  attendanceTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");

    if (!btn) return;

    const action = btn.getAttribute("data-action");

    const name = btn.getAttribute("data-name");

    const date = reportDateInput.value;

    if (!date || !name) return;

    const dayList = attendance[date] || [];

    if (action === "delete-attendance") {
      if (!confirm(`¿Quitar registro de asistencia de ${name}?`)) return;

      const idx = dayList.findIndex((r) => r.name === name);

      if (idx > -1) {
        dayList.splice(idx, 1);

        attendance[date] = dayList;

        saveAttendance();

        renderAllReports();

        renderCustomDropdown();
      }
    } else if (action === "edit-attendance") {
      const rec = dayList.find((r) => r.name === name);

      if (!rec) return;

      editingAttendanceName = name;

      editingAttendanceDate = date;

      editAttendanceEmployeeSpan.textContent = name;

      editCheckInTimeInput.value = rec.checkIn || "";

      editCheckOutTimeInput.value = rec.checkOut || "";

      editAttendanceModal.classList.remove("hidden");
    }
  });

  const closeEditAttendanceModal = () => {
    editAttendanceModal.classList.add("hidden");

    editingAttendanceName = null;

    editingAttendanceDate = null;
  };

  cancelEditAttendanceBtn.addEventListener(
    "click",
    closeEditAttendanceModal
  );

  editAttendanceModal.addEventListener("click", (e) => {
    if (e.target === editAttendanceModal) closeEditAttendanceModal();
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !editAttendanceModal.classList.contains("hidden")
    )
      closeEditAttendanceModal();
  });

  saveEditAttendanceBtn.addEventListener("click", () => {
    if (!editingAttendanceName || !editingAttendanceDate) return;

    const inTime = editCheckInTimeInput.value;

    const outTime = editCheckOutTimeInput.value;

    if (!inTime || !outTime) {
      alert("Completa hora de entrada y salida.");
      return;
    }

    const list = attendance[editingAttendanceDate] || [];

    const idx = list.findIndex((r) => r.name === editingAttendanceName);

    if (idx > -1) {
      list[idx] = {
        name: editingAttendanceName,
        checkIn: inTime,
        checkOut: outTime,
      };

      attendance[editingAttendanceDate] = list;

      saveAttendance();

      renderAllReports();

      renderCustomDropdown();
    }

    closeEditAttendanceModal();
  });

  // --- LÓGICA DE REPORTE Y CÁLCULOS ---

  const renderAllReports = () => {
    renderDailyReport();

    renderWeeklyReport();
  };

  const calculateHours = (start, end, dateStr) => {
    if (!isValidTime(start) || !isValidTime(end)) {
      return {
        total: 0,
        overtime: 0,
        lunchDeducted: false,
        lunchMinutes: 0,
      };
    }

    const startTime = new Date(`1970-01-01T${start}:00`);

    let endTime = new Date(`1970-01-01T${end}:00`);

    let diffHrs = (endTime - startTime) / (1000 * 60 * 60);

    // Manejo básico de cruce de medianoche

    const crossesMidnight = diffHrs < 0;

    if (crossesMidnight) {
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);

      diffHrs = (endTime - startTime) / (1000 * 60 * 60);
    }

    // Determinar si es sábado para no descontar almuerzo

    let isSaturday = false;

    if (dateStr) {
      const day = new Date(dateStr + "T00:00:00").getDay(); // 6 = Sábado

      isSaturday = day === 6;
    }

    // Descontar hora de almuerzo (12:00 - 13:00) solo si no cruza medianoche y no es sábado

    let lunchMinutes = 0;

    let lunchDeducted = false;

    if (!crossesMidnight && !isSaturday) {
      const lunchStart = new Date("1970-01-01T12:00:00");

      const lunchEnd = new Date("1970-01-01T13:00:00");

      const overlapStart = Math.max(
        startTime.getTime(),
        lunchStart.getTime()
      );

      const overlapEnd = Math.min(endTime.getTime(), lunchEnd.getTime());

      const overlap = Math.max(0, overlapEnd - overlapStart);

      lunchMinutes = overlap / (1000 * 60);

      lunchDeducted = lunchMinutes > 0;
    }

    const totalHours = parseFloat(
      ((diffHrs * 60 - lunchMinutes) / 60).toFixed(2)
    );

    const standardHours = dateStr ? getExpectedHoursForDate(dateStr) : 9;

    const overtime = Math.max(
      0,
      parseFloat((totalHours - standardHours).toFixed(2))
    );

    return { total: totalHours, overtime, lunchDeducted, lunchMinutes };
  };

  const renderDailyReport = () => {
    const date = reportDateInput.value;

    attendanceTableBody.innerHTML = "";

    const dailyAttendance = attendance[date] || [];

    const activeEmployees = date ? employeesForDate(date) : employees;

    const activeNamesSet = new Set(activeEmployees.map((e) => e.name));

    const presentMap = new Map(dailyAttendance.map((r) => [r.name, r]));

    const presentCount = dailyAttendance.filter(
      (r) => activeNamesSet.has(r.name) && isCompleteAttendanceRecord(r)
    ).length;

    if (employees.length === 0) {
      attendanceTableBody.innerHTML = `<tr><td colspan="11" class="text-center py-4 text-slate-400">Agregue empleados para ver el reporte.</td></tr>`;

      summaryDiv.innerHTML = "";

      return;
    }

    // Construir filas con datos calculados (activos del día + cualquiera que tenga registro)

    const allNames = Array.from(
      new Set([
        ...activeEmployees.map((e) => e.name),

        ...dailyAttendance.map((r) => r.name),
      ])
    );

    const empByName = new Map(employees.map((e) => [e.name, e]));

    const rows = allNames.map((name) => {
      const employee = empByName.get(name) || { dni: "", position: "" };

      const record = presentMap.get(name);

      const hasCompleteRecord = isCompleteAttendanceRecord(record);

      const checkInValue =
        record && record.checkIn ? record.checkIn : "-";

      const checkOutValue =
        record && record.checkOut ? record.checkOut : "-";

      const observation =
        record && record.observation ? record.observation : "";

      if (hasCompleteRecord) {
        const { total, overtime, lunchDeducted } = calculateHours(
          record.checkIn,
          record.checkOut,
          date
        );

        return {
          name,

          dni: employee.dni,

          position: employee.position,

          checkIn: checkInValue,

          checkOut: checkOutValue,

          lunchText: lunchDeducted ? "12:00 - 13:00" : "-",

          total,

          overtime,

          observation,

          present: true,
        };
      }

      return {
        name,

        dni: employee.dni,

        position: employee.position,

        checkIn: checkInValue,

        checkOut: checkOutValue,

        lunchText: "-",

        total: null,

        overtime: null,

        observation,

        present: false,
      };
    });

    // Ordenar si hay clave seleccionada

    if (dailySort.key) {
      const dir = dailySort.dir === "asc" ? 1 : -1;

      rows.sort((a, b) => {
        const key = dailySort.key;

        let va, vb;

        if (key === "name" || key === "position") {
          va = (a[key] || "").toString();

          vb = (b[key] || "").toString();

          const cmp = va.localeCompare(vb, "es", { sensitivity: "base" });

          return cmp * dir;
        } else if (key === "dni") {
          va = parseInt((a.dni || "").toString().replace(/\D/g, ""), 10);

          vb = parseInt((b.dni || "").toString().replace(/\D/g, ""), 10);

          va = isNaN(va)
            ? dailySort.dir === "asc"
              ? Number.NEGATIVE_INFINITY
              : Number.POSITIVE_INFINITY
            : va;

          vb = isNaN(vb)
            ? dailySort.dir === "asc"
              ? Number.NEGATIVE_INFINITY
              : Number.POSITIVE_INFINITY
            : vb;

          return (va - vb) * dir;
        } else if (key === "total" || key === "overtime") {
          va =
            typeof a[key] === "number"
              ? a[key]
              : dailySort.dir === "asc"
                ? Number.NEGATIVE_INFINITY
                : Number.POSITIVE_INFINITY;

          vb =
            typeof b[key] === "number"
              ? b[key]
              : dailySort.dir === "asc"
                ? Number.NEGATIVE_INFINITY
                : Number.POSITIVE_INFINITY;

          if (va === vb) return 0;

          return (va < vb ? -1 : 1) * dir;
        }

        return 0;
      });
    }

    // Helper de formato H:MM

    const formatHoursHM = (hours) => {
      if (typeof hours !== "number" || isNaN(hours)) return "-";

      const sign = hours < 0 ? "-" : "";

      const totalMinutes = Math.round(Math.abs(hours) * 60);

      const h = Math.floor(totalMinutes / 60);

      const m = totalMinutes % 60;

      return `${sign}${h}:${String(m).padStart(2, "0")}`;
    };

    // Renderizar filas

    const frag = document.createDocumentFragment();

    rows.forEach((r) => {
      const tr = document.createElement("tr");

      tr.className = "border-b border-slate-700 hover:bg-slate-800";

      const overtimeCell =
        typeof r.overtime === "number" && r.overtime > 0
          ? `<span class=\"font-bold text-amber-400\">${formatHoursHM(
            r.overtime
          )}</span>`
          : typeof r.overtime === "number"
            ? formatHoursHM(r.overtime)
            : "-";

      const observationKey = `${date}_${r.name}`;

      const currentObservation =
        (attendance[date] &&
          attendance[date].find((rec) => rec.name === r.name)
            ?.observation) ||
        "";

      tr.innerHTML = `

                <td class=\"px-4 py-2 font-medium\">${r.name}</td>

                <td class=\"px-4 py-2 text-slate-400\">${r.dni}</td>

                <td class=\"px-4 py-2 text-slate-400\">${r.position}</td>

                <td class=\"px-4 py-2\">${r.checkIn}</td>

                <td class=\"px-4 py-2\">${r.lunchText}</td>

                <td class=\"px-4 py-2\">${r.checkOut}</td>

                <td class=\"px-4 py-2\">${typeof r.total === "number" ? formatHoursHM(r.total) : "-"
        }</td>

                <td class=\"px-4 py-2\">${overtimeCell}</td>

                <td class=\"px-4 py-2\">${r.present
          ? '<span class=\\"bg-green-600 text-green-100 text-xs font-medium px-2.5 py-0.5 rounded-full\\">Presente</span>'
          : '<span class=\\"bg-red-600 text-red-100 text-xs font-medium px-2.5 py-0.5 rounded-full\\">Ausente</span>'
        }</td>

                <td class=\"px-4 py-2\">

                    <input type=\"text\" 

                           class=\"w-full p-1 text-xs bg-slate-700 border border-slate-600 rounded focus:border-cyan-500 focus:outline-none\" 

                           placeholder=\"Observación...\" 

                           value=\"${currentObservation}\" 

                           data-observation-for=\"${r.name}\" 

                           data-date=\"${date}\">

                </td>

                <td class=\"px-4 py-2 text-center\">${r.present
          ? '<div class="flex gap-1 justify-center"><button class="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors" data-action="edit-attendance" data-name="' +
          r.name +
          '" title="Editar">✏️</button><button class="w-6 h-6 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors" data-action="delete-attendance" data-name="' +
          r.name +
          '" title="Quitar">🗑️</button></div>'
          : ""
        }</td>

            `;

      frag.appendChild(tr);
    });

    attendanceTableBody.appendChild(frag);

    // Resumen

    const absentCount = Math.max(
      0,
      activeEmployees.length - presentCount
    );

    const rawTopic = (dailyTopics || {})[date];

    const topic =
      rawTopic && typeof rawTopic === "object"
        ? rawTopic.topic || ""
        : rawTopic || "";

    const duration =
      rawTopic &&
        typeof rawTopic === "object" &&
        rawTopic.duration != null &&
        rawTopic.duration !== ""
        ? ` (${rawTopic.duration} min)`
        : "";

    summaryDiv.innerHTML = `

            <div class=\"flex items-center gap-2\"><span class=\"font-bold text-lg text-green-400\">${presentCount}</span><span class=\"text-slate-300\">Presentes</span></div>

            <div class=\"flex items-center gap-2\"><span class=\"font-bold text-lg text-red-400\">${absentCount}</span><span class=\"text-slate-300\">Ausentes</span></div>

            <div class=\"flex items-center gap-2\"><span class=\"font-bold text-lg text-cyan-400\">${activeEmployees.length
      }</span><span class=\"text-slate-300\">Total Empleados (activos)</span></div>

            <div class=\"flex items-center gap-2\"><span class=\"text-slate-300\">Tema:</span><span class=\"font-medium text-indigo-300 whitespace-nowrap overflow-x-auto max-w-[50vw] md:max-w-[30vw] scrollbar-hide\" title=\"${(
        topic || ""
      )
        .replace(/\\\"/g, "&quot;")
        .replace(/'/g, "&#39;")}\">${topic || "-"}${duration}</span></div>

        `;

    updateDailySortIndicators();
  };

  const updateDailySortIndicators = () => {
    const indicators = document.querySelectorAll("[data-sort-indicator]");

    indicators.forEach((span) => {
      span.textContent = "";
    });

    if (!dailySort.key) return;

    const active = document.querySelector(
      `[data-sort-indicator="${dailySort.key}"]`
    );

    if (active) active.textContent = dailySort.dir === "asc" ? "▲" : "▼";
  };

  const setupDailySort = () => {
    const headers = document.querySelectorAll("thead [data-sort-key]");

    headers.forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-sort-key");

        if (dailySort.key === key) {
          dailySort.dir = dailySort.dir === "asc" ? "desc" : "asc";
        } else {
          dailySort.key = key;

          dailySort.dir = "asc";
        }

        renderDailyReport();
      });
    });
  };

  // --- LÓGICA DEL REPORTE SEMANAL Y GRÁFICOS ---

  const getWeekDates = (weekString) => {
    const [year, week] = weekString.split("-W");

    if (!year || !week) return [];

    const simple = new Date(year, 0, 1 + (week - 1) * 7);

    const dow = simple.getDay();

    const ISOweekStart = simple;

    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(ISOweekStart);

      d.setDate(d.getDate() + i);

      dates.push(d.toISOString().split("T")[0]);
    }

    return dates;
  };

  // Obtener fechas de la semana (Lun..Dom) a partir de una fecha base YYYY-MM-DD

  const getWeekDatesFromDate = (dateStr) => {
    if (!dateStr) return [];

    const base = new Date(dateStr + "T00:00:00");

    const day = base.getDay(); // 0=Domingo, 1=Lunes,... 6=Sábado

    const shift = (day + 6) % 7; // días a restar para llegar al lunes

    const monday = new Date(base);

    monday.setDate(base.getDate() - shift);

    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);

      d.setDate(monday.getDate() + i);

      dates.push(d.toISOString().split("T")[0]);
    }

    return dates;
  };

  // Clave de semana ISO (YYYY-Www) a partir de fecha YYYY-MM-DD

  const getWeekKeyFromDateStr = (dateStr) => {
    if (!dateStr) return "";

    const d = new Date(dateStr + "T00:00:00");

    const { year, week } = getISOWeekInfo(d);

    return `${year}-W${String(week).padStart(2, "0")}`;
  };

  const renderWeeklyReport = () => {
    const baseDate = reportDateInput.value;

    if (!baseDate) return;

    const weekDates = getWeekDatesFromDate(baseDate);

    let totalPresent = 0,
      totalAbsent = 0;

    const overtimeEmployees = {};

    const absentEmployees = {};

    const dayMapping = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Cálculos por semana (horas y ausencias)

    const sixDays = weekDates.slice(0, 6);

    const cutoffDate = baseDate; // Limitar cálculos hasta la fecha seleccionada

    // Totales por empleado para computar extras y sumatoria de extras diarias

    const weeklyTotals = new Map();

    const dailyOvertimeTotals = new Map();

    sixDays.forEach((date) => {
      if (cutoffDate && date > cutoffDate) return;

      const dailyAttendance = attendance[date] || [];

      const validAttendance = dailyAttendance.filter(
        isCompleteAttendanceRecord
      );

      const activeEmps = employeesForDate(date);

      const activeSet = new Set(activeEmps.map((e) => e.name));

      const presentNamesSet = new Set(validAttendance.map((r) => r.name));

      const dayPresent = validAttendance.filter((r) =>
        activeSet.has(r.name)
      ).length;

      totalPresent += dayPresent;

      totalAbsent += Math.max(0, activeEmps.length - dayPresent);

      validAttendance.forEach((record) => {
        const { total, overtime } = calculateHours(
          record.checkIn,
          record.checkOut,
          date
        );

        weeklyTotals.set(
          record.name,
          (weeklyTotals.get(record.name) || 0) + total
        );

        dailyOvertimeTotals.set(
          record.name,
          (dailyOvertimeTotals.get(record.name) || 0) + overtime
        );
      });

      activeEmps.forEach((employee) => {
        if (!presentNamesSet.has(employee.name)) {
          if (!absentEmployees[employee.name])
            absentEmployees[employee.name] = [];

          const dayOfWeek =
            dayMapping[new Date(date + "T00:00:00").getDay()];

          absentEmployees[employee.name].push(dayOfWeek);
        }
      });
    });

    // Calcular horas extra semanales: mayor entre suma de extras diarias y (total semanal - 50)

    Object.keys(overtimeEmployees).forEach(
      (k) => delete overtimeEmployees[k]
    );

    weeklyTotals.forEach((sum, name) => {
      const weeklyExtra = Math.max(0, parseFloat((sum - 50).toFixed(2)));

      const dailyExtra = parseFloat(
        (dailyOvertimeTotals.get(name) || 0).toFixed(2)
      );

      const extra = Math.max(weeklyExtra, dailyExtra);

      if (extra > 0) overtimeEmployees[name] = extra;
    });

    // (El gráfico semanal tipo doughnut fue eliminado)

    // (La lista de Horas Extra semanal fue eliminada)

    // (La lista de Ausencias semanal fue eliminada)

    // Renderizar resumen visual rápido (limitado a la fecha seleccionada)

    renderQuickOverview(sixDays, cutoffDate);
  };

  // Función para obtener horas esperadas según el día de la semana

  const getExpectedHoursForDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");

    const dayOfWeek = date.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

    if (
      weeklyHoursConfig &&
      Object.prototype.hasOwnProperty.call(weeklyHoursConfig, dayOfWeek)
    ) {
      const configured = weeklyHoursConfig[dayOfWeek];

      return typeof configured === "number" ? configured : 9;
    }

    return 9;
  };

  // Función para calcular hora de salida por defecto según horas esperadas del día

  const getDefaultCheckOutTime = (dateStr, checkInTime = "08:00") => {
    const expectedHours = getExpectedHoursForDate(dateStr);

    if (expectedHours === 0) return "08:00"; // Día sin trabajo

    // Validar que checkInTime sea válido
    if (!checkInTime || checkInTime.trim() === "") {
      checkInTime = "08:00";
    }

    // Parsear hora de entrada
    const [inHour, inMin] = checkInTime.split(":").map(Number);

    // Validar que los valores sean números válidos
    if (isNaN(inHour) || isNaN(inMin)) {
      return "08:00";
    }

    const inMinutes = inHour * 60 + inMin;

    // Determinar si corresponde sumar la hora de almuerzo (solo días largos)
    let includeLunch = expectedHours >= 6;

    if (dateStr) {
      const day = new Date(`${dateStr}T00:00:00`).getDay();
      if (day === 6) includeLunch = false; // No sumar almuerzo en sábado
    }

    const lunchMinutes = includeLunch ? 60 : 0;

    // Calcular hora de salida: entrada + horas esperadas + pausa de almuerzo
    const outMinutes = inMinutes + expectedHours * 60 + lunchMinutes;

    const outHour = Math.floor(outMinutes / 60);

    const outMin = outMinutes % 60;

    return `${String(outHour).padStart(2, "0")}:${String(outMin).padStart(
      2,
      "0"
    )}`;
  };

  // Actualizar horas esperadas cuando cambia la fecha

  const updateExpectedHours = () => {
    if (reportDateInput.value) {
      const expectedHours = getExpectedHoursForDate(
        reportDateInput.value
      );

      expectedHoursInput.value = expectedHours;

      // Actualizar hora de salida por defecto según el día

      const defaultCheckOut = getDefaultCheckOutTime(
        reportDateInput.value,
        checkInTimeInput.value
      );

      checkOutTimeInput.value = defaultCheckOut;
    }
  };

  // --- Tema del día: helpers ---

  const loadDailyTopic = () => {
    if (!dailyTopicInput) return;

    const date = reportDateInput.value;

    if (!date) {
      dailyTopicInput.value = "";
      if (dailyTopicDurationInput) dailyTopicDurationInput.value = "";
      return;
    }

    const entry = (dailyTopics || {})[date];

    if (entry && typeof entry === "object") {
      dailyTopicInput.value = entry.topic || "";

      if (dailyTopicDurationInput)
        dailyTopicDurationInput.value = entry.duration ?? "";
    } else {
      dailyTopicInput.value = entry || "";

      if (dailyTopicDurationInput) dailyTopicDurationInput.value = "";
    }
  };

  const saveDailyTopicValue = () => {
    const date = reportDateInput.value;

    if (!date) {
      alert("Selecciona una fecha.");
      return;
    }

    const topic = (dailyTopicInput.value || "").trim();

    let durationVal = null;

    if (dailyTopicDurationInput) {
      const raw = dailyTopicDurationInput.value;

      const n = raw === "" ? null : Number(raw);

      durationVal = n === null || (!Number.isNaN(n) && n >= 0) ? n : null;
    }

    dailyTopics[date] = { topic, duration: durationVal };

    if (appData && appData.data && appData.data[currentLocationName]) {
      appData.data[currentLocationName].dailyTopics = dailyTopics;
    }

    saveData();
  };

  const renderQuickOverview = (sixDays, cutoffDate) => {
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const presentData = [];

    const absentData = [];

    const compliantData = [];

    const nonCompliantData = [];

    let totalPresent = 0,
      totalAbsent = 0,
      totalCompliant = 0,
      totalNonCompliant = 0;

    let totalHours = 0,
      totalOvertime = 0;

    let totalActiveAcrossDays = 0;

    let maxActive = 0;

    sixDays.forEach((date) => {
      if (cutoffDate && date > cutoffDate) {
        presentData.push(null);

        absentData.push(null);

        compliantData.push(null);

        nonCompliantData.push(null);

        return;
      }

      const dayList = attendance[date] || [];

      const activeEmps = employeesForDate(date);

      const activeSet = new Set(activeEmps.map((e) => e.name));

      const dayPresent = dayList.filter((r) =>
        activeSet.has(r.name)
      ).length;

      const dayAbsent = Math.max(0, activeEmps.length - dayPresent);

      let dayCompliant = 0,
        dayNonCompliant = 0;

      let dayHours = 0,
        dayOvertime = 0;

      dayList.forEach((rec) => {
        if (!activeSet.has(rec.name)) return;

        const { total, overtime } = calculateHours(
          rec.checkIn,
          rec.checkOut,
          date
        );

        // Si tiene horas extra

        if (typeof overtime === "number" && overtime > 0) {
          dayOvertime += overtime;
        }

        // Si cumplió las horas esperadas

        const expectedHours = getExpectedHoursForDate(date);

        if (typeof total === "number" && total >= expectedHours) {
          dayCompliant++;
        } else {
          dayNonCompliant++;
        }

        dayHours += typeof total === "number" ? total : 0;
      });

      presentData.push(dayPresent);

      absentData.push(dayAbsent);

      compliantData.push(dayCompliant);

      nonCompliantData.push(dayNonCompliant);

      totalPresent += dayPresent;

      totalAbsent += dayAbsent;

      totalCompliant += dayCompliant;

      totalNonCompliant += dayNonCompliant;

      totalHours += dayHours;

      totalOvertime += dayOvertime;

      totalActiveAcrossDays += activeEmps.length;

      maxActive = Math.max(maxActive, activeEmps.length);
    });

    // Gráfico de asistencia

    if (quickAttendanceChart) quickAttendanceChart.destroy();

    const onlyNums = (arr) => arr.filter((v) => typeof v === "number");

    const maxDayCount = Math.max(
      ...onlyNums(presentData),
      ...onlyNums(absentData),
      0
    );

    const yMax = Math.max(maxActive, maxDayCount) + 1; // pequeño margen superior

    quickAttendanceChart = new Chart(quickAttendanceChartCtx, {
      type: "bar",

      data: {
        labels: dayNames,

        datasets: [
          {
            label: "Presentes",
            data: presentData,
            backgroundColor: "#16a34a",
          },

          {
            label: "Ausentes",
            data: absentData,
            backgroundColor: "#ef4444",
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#f3f4f6", boxWidth: 12 },
          },
        },

        scales: {
          x: {
            stacked: false,
            ticks: { color: "#f3f4f6" },
            grid: { color: "#374151", display: true },
          },

          y: {
            stacked: false,
            beginAtZero: true,
            ticks: { color: "#f3f4f6", stepSize: 1 },
            suggestedMax: yMax,
            grid: { color: "#374151", display: true },
          },
        },
      },

      plugins: [],
    });

    // Cálculo de estadísticas por empleado para destacados

    const employeeStats = new Map();

    employees.forEach((emp) => {
      employeeStats.set(emp.name, { name: emp.name, totalHours: 0 });
    });

    sixDays.forEach((date) => {
      const dayList = attendance[date] || [];

      dayList.forEach((rec) => {
        const stats = employeeStats.get(rec.name);

        if (stats) {
          const { total } = calculateHours(
            rec.checkIn,
            rec.checkOut,
            date
          );

          stats.totalHours += typeof total === "number" ? total : 0;
        }
      });
    });

    // Métricas clave

    const avgAttendance =
      totalActiveAcrossDays > 0
        ? ((totalPresent / totalActiveAcrossDays) * 100).toFixed(1)
        : 0;

    const complianceRate =
      totalPresent > 0
        ? ((totalCompliant / totalPresent) * 100).toFixed(1)
        : 0;

    weeklyMetricsDiv.innerHTML = `

            <div class="bg-cyan-900/30 p-3 rounded border-l-4 border-cyan-500">

                <div class="text-lg font-bold text-cyan-400">${avgAttendance}%</div>

                <div class="text-xs text-slate-300">Asistencia promedio</div>

            </div>

            <div class="bg-green-900/30 p-3 rounded border-l-4 border-green-500">

                <div class="text-lg font-bold text-green-400">${complianceRate}%</div>

                <div class="text-xs text-slate-300">Cumplimiento jornada</div>

            </div>

            <div class="bg-purple-900/30 p-3 rounded border-l-4 border-purple-500">

                <div class="text-lg font-bold text-purple-400">${totalOvertime.toFixed(
      1
    )}h</div>

                <div class="text-xs text-slate-300">Horas extra totales</div>

            </div>

        `;

    // Análisis de empleados destacados (el cálculo de stats se movió arriba)

    renderEmployeeHighlights(sixDays, employeeStats, cutoffDate);
  };

  const renderEmployeeHighlights = (
    sixDays,
    employeeStats,
    cutoffDate
  ) => {
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Las stats ya vienen calculadas, solo se completan con los datos de ausencias

    // y otra información necesaria para los destacados.

    const formatHoursHM = (hours) => {
      if (typeof hours !== "number" || isNaN(hours)) return "-";

      const sign = hours < 0 ? "-" : "";

      const totalMinutes = Math.round(Math.abs(hours) * 60);

      const h = Math.floor(totalMinutes / 60);

      const m = totalMinutes % 60;

      return `${sign}${h}:${String(m).padStart(2, "0")}`;
    };

    employeeStats.forEach((stats) => {
      stats.daysAbsent = 0;

      stats.absentDays = [];

      const emp = employees.find((e) => e.name === stats.name);

      stats.position = emp ? emp.position : "";
    });

    sixDays.forEach((date, idx) => {
      if (cutoffDate && date > cutoffDate) return;

      const presentNames = new Set(
        (attendance[date] || []).map((r) => r.name)
      );

      const activeSet = new Set(
        employeesForDate(date).map((e) => e.name)
      );

      employeeStats.forEach((stats) => {
        // Solo contar ausencia si el empleado estaba activo ese día

        if (!activeSet.has(stats.name)) return;

        if (!presentNames.has(stats.name)) {
          stats.daysAbsent++;

          stats.absentDays.push(dayNames[idx]);
        }
      });
    });

    const statsArray = Array.from(employeeStats.values());

    // Top 5 más ausencias (ordenado por día de la semana)

    const dayOrder = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6 };

    const mostAbsent = statsArray

      .filter((s) => s.daysAbsent > 0)

      .sort((a, b) => {
        // Primero por el día más temprano de la semana

        const aFirstDay = Math.min(
          ...a.absentDays.map((day) => dayOrder[day] || 7)
        );

        const bFirstDay = Math.min(
          ...b.absentDays.map((day) => dayOrder[day] || 7)
        );

        if (aFirstDay !== bFirstDay) return aFirstDay - bFirstDay;

        // Luego por cantidad de días ausentes

        if (a.daysAbsent !== b.daysAbsent)
          return b.daysAbsent - a.daysAbsent;

        // Finalmente por nombre

        return a.name.localeCompare(b.name);
      })

      .slice(0, 5);

    mostAbsentDiv.innerHTML =
      mostAbsent.length > 0
        ? mostAbsent
          .map(
            (emp) => `

            <div class="bg-red-900/20 p-2 rounded text-sm">

                <div class="font-medium text-red-300">${emp.name}</div>

                <div class="text-xs text-slate-400">${emp.position}</div>

                <div class="text-xs text-red-400">${emp.daysAbsent
              } días: ${emp.absentDays.join(", ")}</div>

            </div>

        `
          )
          .join("")
        : '<div class="flex items-center gap-2 bg-green-900/30 border border-green-700 text-green-200 p-2 rounded text-sm"><span>✅</span><span>Todos asistieron completo</span></div>';

    // Empleados con horas extra (detalles por día)

    const employeesWithOvertime = [];

    const employeesWithDebt = [];

    sixDays.forEach((date, idx) => {
      const dayList = attendance[date] || [];

      const presentMap = new Map(dayList.map((r) => [r.name, r]));

      employees.forEach((emp) => {
        const rec = presentMap.get(emp.name);

        if (rec) {
          const { total, overtime } = calculateHours(
            rec.checkIn,
            rec.checkOut,
            date
          );

          // Si tiene horas extra

          if (typeof overtime === "number" && overtime > 0) {
            employeesWithOvertime.push({
              name: emp.name,

              position: emp.position,

              day: dayNames[idx],

              hours: total,

              overtime: overtime,
            });
          }

          // Si no cumplió las horas esperadas (deuda)

          const expectedHours = getExpectedHoursForDate(date);

          if (typeof total === "number" && total < expectedHours) {
            const debt = expectedHours - total;

            employeesWithDebt.push({
              name: emp.name,

              position: emp.position,

              day: dayNames[idx],

              hours: total,

              debt: debt,
            });
          }
        }
      });
    });

    // Ordenar por mayor overtime y mayor deuda

    employeesWithOvertime.sort((a, b) => b.overtime - a.overtime);

    employeesWithDebt.sort((a, b) => b.debt - a.debt);

    // Mostrar empleados con horas extra

    overtimeEmployeesDiv.innerHTML =
      employeesWithOvertime.length > 0
        ? employeesWithOvertime
          .slice(0, 10)
          .map(
            (emp) => `

            <div class="bg-green-900/20 p-2 rounded text-sm">

                <div class="font-medium text-green-300">${emp.name}</div>

                <div class="text-xs text-slate-400">${emp.position}</div>

                <div class="text-xs text-green-400">${emp.day}: ${formatHoursHM(
              emp.hours
            )}h (+${formatHoursHM(emp.overtime)}h extra)</div>

            </div>

        `
          )
          .join("")
        : '<div class="flex items-center gap-2 bg-green-900/30 border border-green-700 text-green-200 p-2 rounded text-sm"><span>✅</span><span>Nadie hizo horas extra</span></div>';

    // Mostrar empleados con deuda de horas

    debtHoursDiv.innerHTML =
      employeesWithDebt.length > 0
        ? employeesWithDebt
          .slice(0, 10)
          .map(
            (emp) => `

            <div class="bg-amber-900/20 p-2 rounded text-sm">

                <div class="font-medium text-amber-300">${emp.name}</div>

                <div class="text-xs text-slate-400">${emp.position}</div>

                <div class="text-xs text-amber-400">${emp.day}: ${formatHoursHM(
              emp.hours
            )}h (${formatHoursHM(-emp.debt)}h deuda)</div>

            </div>

        `
          )
          .join("")
        : '<div class="flex items-center gap-2 bg-green-900/30 border border-green-700 text-green-200 p-2 rounded text-sm"><span>✅</span><span>Todos cumplieron las horas</span></div>';
  };

  // --- GESTIÓN DE INCIDENCIAS (REVIEW) ---
  const STANDARD_ENTRY_TIME = "08:00";
  const TOLERANCE_MINUTES = 15;

  // Helper: Check for attendance issues
  // Helper: Check for attendance issues
  const checkAttendanceIssues = (record, dateStr) => {
    if (!record || !record.checkIn || !record.checkOut) return null;

    let expectedHours = 9; // Default M-F (including lunch)
    if (dateStr) {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(y, m - 1, d);
      if (date.getDay() === 6) expectedHours = 5; // Saturday
    }

    const issues = [];

    // Check Late Entry
    const [hIn, mIn] = record.checkIn.split(":").map(Number);
    const checkInMinutes = hIn * 60 + mIn;
    const [stdH, stdM] = STANDARD_ENTRY_TIME.split(":").map(Number);
    const standardMinutes = stdH * 60 + stdM;

    // Tolerance check
    if (checkInMinutes > standardMinutes + TOLERANCE_MINUTES) {
      issues.push(`Llegada Tarde (${record.checkIn})`);
    }

    // Check Undertime (Early Exit or less hours)
    const [hOut, mOut] = record.checkOut.split(":").map(Number);
    const checkOutMinutes = hOut * 60 + mOut;
    const workedMin = checkOutMinutes - checkInMinutes;

    // Validation threshold (small buffer)
    if (workedMin < expectedHours * 60 - 10) {
      issues.push(`Horas insuficientes (${(workedMin / 60).toFixed(1)}h)`);
    }

    return issues.length > 0 ? issues : null;
  };

  // Logic to open modal
  const openPayrollReviewModal = (employeeName, weekDates) => {
    const modal = document.getElementById("payrollReviewModal");
    const title = document.getElementById("reviewEmployeeName");
    const list = document.getElementById("reviewList");
    const pendingCount = document.getElementById("reviewPendingCount");
    const close = document.getElementById("closePayrollReviewModal");
    const save = document.getElementById("savePayrollReviewBtn");

    if (!modal) return;

    title.textContent = employeeName;
    list.innerHTML = "";

    let pending = 0;
    let totalDiscount = 0;
    const currentReviews = (appData.data && appData.data[currentLocationName]) ? (appData.data[currentLocationName].payrollReviews || {}) : {};
    const emp = employees.find(e => e.name === employeeName);
    const dailyRate = emp && emp.tarifaDiaria ? parseFloat(emp.tarifaDiaria) : 0;

    // Iterate week
    weekDates.split(',').forEach(dateStr => {
      const dayRecord = (appData.data[currentLocationName].attendance[dateStr] || []).find(r => r.name === employeeName);
      if (!dayRecord || !dayRecord.checkIn || !dayRecord.checkOut) return;

      // Use date-aware issue detection
      const issues = checkAttendanceIssues(dayRecord, dateStr);
      if (!issues) return;

      // Check existing review
      const reviewKey = `${dateStr}_${employeeName}`;
      const review = currentReviews[reviewKey] || { status: 'pending', amount: 0, note: '' };

      if (review.status === 'pending') pending++;
      if (review.status === 'discounted') totalDiscount += review.amount || 0;

      const div = document.createElement("div");
      div.className = "grid grid-cols-12 gap-4 items-start text-sm p-4 border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors rounded-lg mb-2 bg-slate-800/20";

      // Date
      const [y, m, d] = dateStr.split('-');
      const dateDate = new Date(y, m - 1, d);
      const dateLabel = dateDate.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
      const isSaturday = dateDate.getDay() === 6;

      // Calculate suggested discount automatically
      let suggestedDiscount = 0;
      const [hIn, mIn] = dayRecord.checkIn.split(":").map(Number);
      const [hOut, mOut] = dayRecord.checkOut.split(":").map(Number);
      const checkInMinutes = hIn * 60 + mIn;
      const checkOutMinutes = hOut * 60 + mOut;
      const workedMinutes = checkOutMinutes - checkInMinutes;

      // Proportional discount calculation
      // M-F: 8 hours work (480m), Sat: 5 hours work (300m)
      const expectedMinutes = (isSaturday ? 5 : 8) * 60;

      if (workedMinutes < expectedMinutes) {
        const missingMinutes = expectedMinutes - workedMinutes;
        suggestedDiscount = (dailyRate * missingMinutes) / expectedMinutes;
      }

      // Lateness penalty
      const [stdH, stdM] = STANDARD_ENTRY_TIME.split(":").map(Number);
      const standardMinutes = stdH * 60 + stdM;
      if (checkInMinutes > standardMinutes + TOLERANCE_MINUTES) {
        const lateMinutes = checkInMinutes - standardMinutes - TOLERANCE_MINUTES;
        suggestedDiscount += (dailyRate * lateMinutes) / expectedMinutes;
      }

      const isPending = review.status === 'pending';
      const isApproved = review.status === 'approved';
      const isDiscount = review.status === 'discounted';

      const currentAmount = review.amount || (isDiscount ? suggestedDiscount : 0);

      div.innerHTML = `
        <!-- Columna 1: Fecha e Info -->
        <div class="col-span-2 flex flex-col justify-center h-full">
          <div class="text-slate-200 font-bold capitalize text-base">${dateLabel}</div>
          <div class="text-xs text-slate-500">${dateStr}</div>
        </div>

        <!-- Columna 2: Incidencia y Tiempos -->
        <div class="col-span-4 flex flex-col justify-center gap-1">
           <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                ${issues[0].split('(')[0]} 
              </span>
           </div>
           <div class="text-xs text-slate-400 flex items-center gap-2">
             <span>🕒 ${dayRecord.checkIn} - ${dayRecord.checkOut}</span>
             <span class="text-slate-600">|</span>
             <span class="text-purple-400 font-medium">${(workedMinutes / 60).toFixed(1)} hrs</span>
           </div>
        </div>

        <!-- Columna 3: Acción (Organizada) -->
        <div class="col-span-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 space-y-3">
          
          <!-- Botones de Estado -->
          <div class="flex gap-2 w-full">
            <label class="flex-1 text-center cursor-pointer py-1.5 rounded text-xs font-bold transition-all border ${isPending ? 'bg-slate-700 border-slate-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}">
              <input type="radio" name="action_${reviewKey}" value="pending" ${isPending ? 'checked' : ''} class="hidden">
              ⏳ Pendiente
            </label>
            <label class="flex-1 text-center cursor-pointer py-1.5 rounded text-xs font-bold transition-all border ${isApproved ? 'bg-emerald-600 border-emerald-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}">
              <input type="radio" name="action_${reviewKey}" value="approved" ${isApproved ? 'checked' : ''} class="hidden">
              ✓ Justificar
            </label>
            <label class="flex-1 text-center cursor-pointer py-1.5 rounded text-xs font-bold transition-all border ${isDiscount ? 'bg-red-600 border-red-500 text-white shadow' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}">
              <input type="radio" name="action_${reviewKey}" value="discounted" ${isDiscount ? 'checked' : ''} class="hidden">
              $ Descontar
            </label>
          </div>
          
          <!-- Controles de Descuento (Visible solo si Descontar) -->
          <div id="controls_${reviewKey}" class="${isDiscount ? '' : 'hidden opacity-50 pointer-events-none'} transition-all space-y-2">
             <div class="flex items-center justify-between bg-slate-950/30 p-2 rounded border border-slate-700/30">
                <span class="text-xs text-slate-400">Monto a descontar:</span>
                <div class="flex items-center gap-2">
                   ${suggestedDiscount > 0 ? `<span class="text-[10px] text-cyan-400/80 cursor-pointer hover:text-cyan-300 hover:underline" onclick="document.getElementById('amount_${reviewKey}').value = ${suggestedDiscount.toFixed(2)}">Sugerido: S/ ${suggestedDiscount.toFixed(2)}</span>` : ''}
                   <div class="relative">
                      <span class="absolute left-2 top-1.5 text-slate-500 text-xs">S/</span>
                      <input type="number" id="amount_${reviewKey}" value="${currentAmount.toFixed(2)}" min="0" step="0.01" 
                        class="w-24 pl-6 pr-2 py-1 bg-slate-900 border border-red-500/50 rounded text-right text-sm text-white focus:outline-none focus:border-red-500">
                   </div>
                </div>
             </div>
          </div>

          <!-- Nota -->
          <textarea id="note_${reviewKey}" rows="2" placeholder="📝 Agregar nota / justificación..." 
            class="w-full bg-slate-950/50 border border-slate-700 rounded text-xs p-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-none">${review.note || ''}</textarea>
        </div>
      `;

      // Listeners
      const radios = div.querySelectorAll(`input[name="action_${reviewKey}"]`);
      const inputsDiv = div.querySelector(`#controls_${reviewKey}`);
      const amountInput = div.querySelector(`#amount_${reviewKey}`);
      const labels = div.querySelectorAll('label');

      radios.forEach(r => {
        r.addEventListener('change', (e) => {
          // Actualizar estilos de botones
          labels.forEach(lbl => {
            const input = lbl.querySelector('input');
            if (input.checked) {
              lbl.className = `flex-1 text-center cursor-pointer py-1.5 rounded text-xs font-bold transition-all border shadow text-white ${input.value === 'discounted' ? 'bg-red-600 border-red-500' : (input.value === 'approved' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-700 border-slate-500')}`;
            } else {
              lbl.className = 'flex-1 text-center cursor-pointer py-1.5 rounded text-xs font-bold transition-all border bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700';
            }
          });

          if (e.target.value === 'discounted') {
            inputsDiv.classList.remove('hidden', 'opacity-50', 'pointer-events-none');

            // Auto-fill
            if (parseFloat(amountInput.value) === 0 && suggestedDiscount > 0) {
              amountInput.value = suggestedDiscount.toFixed(2);
            }
          } else {
            inputsDiv.classList.add('hidden', 'opacity-50', 'pointer-events-none');
            if (e.target.value === 'approved') amountInput.value = '0.00';
          }
        });
      });

      list.appendChild(div);
    });

    pendingCount.textContent = pending;

    // Add summary footer
    const summaryDiv = document.createElement("div");
    summaryDiv.className = "mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center";
    summaryDiv.innerHTML = `
      <div class="flex flex-col">
        <span class="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Descuentos</span>
        <span class="text-[10px] text-slate-500">En esta semana para este empleado</span>
      </div>
      <span class="text-red-400 font-bold text-2xl font-mono">S/ ${totalDiscount.toFixed(2)}</span>
    `;
    list.appendChild(summaryDiv);

    modal.classList.remove('hidden');

    // Save handler
    save.onclick = () => {
      const inputs = list.querySelectorAll('input[type="radio"]:checked');
      if (!appData.data[currentLocationName].payrollReviews) appData.data[currentLocationName].payrollReviews = {};

      inputs.forEach(input => {
        const key = input.name.replace('action_', '');
        const amountEl = document.getElementById(`amount_${key}`);
        const noteEl = document.getElementById(`note_${key}`);
        appData.data[currentLocationName].payrollReviews[key] = {
          status: input.value,
          amount: input.value === 'discounted' ? parseFloat(amountEl.value) : 0,
          note: noteEl ? noteEl.value : ''
        };
      });

      saveData();
      renderPayroll();
      modal.classList.add('hidden');
    };

    close.onclick = () => modal.classList.add('hidden');
  };
  window.openPayrollReviewModal = openPayrollReviewModal;

  // --- PLANILLA DE PAGO ---
  const renderPayroll = () => {
    const payrollTableBody = document.getElementById("payrollTableBody");
    const payrollTotalEmployees = document.getElementById("payrollTotalEmployees");
    const payrollTotalDays = document.getElementById("payrollTotalDays");
    const payrollTotalDeposito = document.getElementById("payrollTotalDeposito");
    const payrollTotalEfectivo = document.getElementById("payrollTotalEfectivo");
    const payrollFooterDays = document.getElementById("payrollFooterDays");
    const payrollFooterMonto = document.getElementById("payrollFooterMonto");

    if (!payrollTableBody) return;

    const baseDate = reportDateInput.value;
    if (!baseDate) {
      payrollTableBody.innerHTML = '<tr><td colspan="17" class="text-center py-4 text-slate-500">Selecciona una fecha para ver la planilla</td></tr>';
      return;
    }

    // Get week dates (Mon-Sun)
    const weekDates = getWeekDatesFromDate(baseDate).slice(0, 7);
    const { year: isoYear, week: isoWeek } = getISOWeekInfo(new Date(baseDate + "T00:00:00"));
    const weekStr = `${isoYear}-W${isoWeek.toString().padStart(2, "0")}`;

    if (payrollWeekLabel) payrollWeekLabel.textContent = weekStr;

    // Check Active Employees
    // Check Active Employees or Employees with Attendance in this week
    const activeEmps = employees.filter((emp) => {
      if (isActiveOnDate(emp, baseDate)) return true;
      return weekDates.some((dateStr) => {
        const dayRecords = attendance[dateStr] || [];
        return dayRecords.some(
          (r) => r.name === emp.name && r.checkIn && r.checkOut
        );
      });
    });

    let globalTotalDays = 0;
    let globalTotalMonto = 0;
    let depositoTotal = 0;
    let efectivoTotal = 0;

    const currentReviews = (appData.data && appData.data[currentLocationName]) ? (appData.data[currentLocationName].payrollReviews || {}) : {};

    const rows = activeEmps.map((emp, idx) => {
      const tarifa = parseFloat(emp.tarifaDiaria) || 0;
      let daysWorked = 0;
      let hasIssues = false;
      let hasPendingIssues = false;
      let totalDiscount = 0;

      const dayCells = weekDates.map(dateStr => {
        const dayRecords = attendance[dateStr] || [];
        const record = dayRecords.find(r => r.name === emp.name && r.checkIn && r.checkOut);

        let cellContent = '<span class="text-red-400">✗</span>';
        let bgClass = "";

        if (record) {
          daysWorked++;
          cellContent = '<span class="text-green-400">✓</span>';

          // Check issues
          const issues = checkAttendanceIssues(record, dateStr);
          if (issues) {
            hasIssues = true;
            const review = currentReviews[`${dateStr}_${emp.name}`];

            if (!review || review.status === 'pending') {
              hasPendingIssues = true;
              cellContent = '<span class="text-amber-400 font-bold cursor-help" title="Incidencia pendiente">!</span>';
            } else if (review.status === 'discounted') {
              totalDiscount += review.amount || 0;
              cellContent = '<span class="text-red-400 font-bold decoration-dotted underline" title="Descuento aplicado">!</span>';
            } else {
              // Approved
              cellContent = '<span class="text-blue-400 font-bold" title="Justificado">✓</span>';
            }
          }
        }
        return `<td class="px-2 py-2 text-center text-xs border-l border-slate-700/50 ${bgClass}">${cellContent}</td>`;
      }).join('');

      let monto = (daysWorked * tarifa) - totalDiscount;
      if (monto < 0) monto = 0;

      globalTotalDays += daysWorked;
      globalTotalMonto += monto;

      if (emp.modalidadPago === "Depósito en cuenta") {
        depositoTotal += monto;
      } else {
        efectivoTotal += monto;
      }

      const modalidadClass = emp.modalidadPago === "Depósito en cuenta" ? "text-emerald-400" : "text-amber-400";

      // Alert Icon Logic
      let alertIcon = "";
      // Pass weekDates as string to avoid quota issues or quoting hell
      const weekDatesStr = weekDates.join(",");

      // Collect notes from reviews for tooltip
      let notesText = "";
      weekDates.forEach(dateStr => {
        const review = currentReviews[`${dateStr}_${emp.name}`];
        if (review && review.note) {
          const [y, m, d] = dateStr.split('-');
          const date = new Date(y, m - 1, d);
          const dayLabel = date.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' });
          notesText += `${dayLabel}: ${review.note}\n`;
        }
      });

      if (hasPendingIssues) {
        alertIcon = `<button class="ml-2 text-amber-400 hover:text-amber-300 animate-pulse" onclick="openPayrollReviewModal('${emp.name}', '${weekDatesStr}')" title="Revisar incidencias pendientes${notesText ? '\n\nNotas:\n' + notesText : ''}">
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </button>`;
      } else if (hasIssues && !hasPendingIssues) {
        // Reviewed (Green/Blue check or Red exclamation if discounted)
        alertIcon = `<button class="ml-2 text-blue-400 hover:text-blue-300" onclick="openPayrollReviewModal('${emp.name}', '${weekDatesStr}')" title="Incidencias revisadas${notesText ? '\n\nNotas:\n' + notesText : ''}">
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </button>`;
      }

      return `
        <tr class="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
          <td class="px-3 py-2 text-slate-400 text-xs">${idx + 1}</td>
          <td class="px-3 py-2 font-medium text-white text-sm flex items-center">
            ${emp.name}
            ${alertIcon}
          </td>
          <td class="px-3 py-2 text-slate-400 text-xs">${emp.dni || '-'}</td>
          <td class="px-3 py-2 text-slate-400 text-xs hidden md:table-cell">${emp.procedencia || '-'}</td>
          <td class="px-3 py-2 text-slate-400 text-xs hidden md:table-cell">${emp.position || '-'}</td>
          <td class="px-3 py-2 text-center text-cyan-400 text-xs">S/ ${tarifa.toFixed(2)}</td>
          ${dayCells}
          <td class="px-3 py-2 text-center font-semibold text-cyan-400">${daysWorked}</td>
          <td class="px-3 py-2 text-center font-bold ${monto > 0 ? 'text-emerald-400' : 'text-slate-500'}">
            S/ ${monto.toFixed(2)}
            ${totalDiscount > 0 ? `<div class="text-[10px] text-red-400 font-normal">-${totalDiscount.toFixed(2)}</div>` : ''}
          </td>
          <td class="px-3 py-2 ${modalidadClass} text-xs">${emp.modalidadPago || '-'}</td>
          <td class="px-3 py-2 text-slate-400 text-xs hidden lg:table-cell">${emp.banco || '-'}</td>
          <td class="px-3 py-2 text-slate-500 text-[10px] hidden lg:table-cell">${emp.numeroCuenta || '-'}</td>
        </tr>
      `;
    });

    payrollTableBody.innerHTML = rows.join('');

    // Update summary
    if (payrollTotalEmployees) payrollTotalEmployees.textContent = activeEmps.length;
    if (payrollTotalDays) payrollTotalDays.textContent = globalTotalDays;
    if (payrollTotalDeposito) payrollTotalDeposito.textContent = `S/ ${depositoTotal.toFixed(2)}`;
    if (payrollTotalEfectivo) payrollTotalEfectivo.textContent = `S/ ${efectivoTotal.toFixed(2)}`;
    if (payrollFooterDays) payrollFooterDays.textContent = globalTotalDays;
    if (payrollFooterMonto) payrollFooterMonto.textContent = `S/ ${globalTotalMonto.toFixed(2)}`;
  };

  // Export Payroll to Excel
  const exportPayrollToExcel = () => {
    const baseDate = reportDateInput.value;
    if (!baseDate) {
      alert("Selecciona una fecha para exportar la planilla.");
      return;
    }

    const weekDates = getWeekDatesFromDate(baseDate).slice(0, 7);
    const { year: isoYear, week: isoWeek } = getISOWeekInfo(new Date(baseDate + "T00:00:00"));
    const weekStr = `${isoYear}-W${isoWeek.toString().padStart(2, "0")}`;
    // Check Active Employees or Employees with Attendance in this week
    const activeEmps = employees.filter((emp) => {
      if (isActiveOnDate(emp, baseDate)) return true;
      return weekDates.some((dateStr) => {
        const dayRecords = attendance[dateStr] || [];
        return dayRecords.some(
          (r) => r.name === emp.name && r.checkIn && r.checkOut
        );
      });
    });

    if (activeEmps.length === 0) {
      alert("No hay empleados activos para exportar.");
      return;
    }

    // Build CSV content
    let csv = "PLANILLA DE PAGO\n";
    csv += `Semana: ${weekStr}\n`;
    csv += `Ubicación: ${currentLocationName}\n\n`;
    csv += "Item,Nombres y Apellidos,DNI,Procedencia,Cargo,Tarifa Diaria,Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo,Total Días,Monto Total,Modalidad,Banco,Cuenta\n";

    let grandTotal = 0;
    activeEmps.forEach((emp, idx) => {
      const tarifa = emp.tarifaDiaria || 0;
      let daysWorked = 0;

      const dayMarks = weekDates.map(dateStr => {
        const dayRecords = attendance[dateStr] || [];
        const present = dayRecords.some(r => r.name === emp.name && r.checkIn && r.checkOut);
        if (present) daysWorked++;
        return present ? "X" : "";
      });

      const monto = daysWorked * tarifa;
      grandTotal += monto;

      const row = [
        idx + 1,
        `"${emp.name}"`,
        emp.dni || "",
        `"${emp.procedencia || ""}"`,
        `"${emp.position || ""}"`,
        tarifa.toFixed(2),
        ...dayMarks,
        daysWorked,
        monto.toFixed(2),
        `"${emp.modalidadPago || ""}"`,
        `"${emp.banco || ""}"`,
        `"${emp.numeroCuenta || ""}"`
      ];
      csv += row.join(",") + "\n";
    });

    csv += `\n,,,,,TOTAL GENERAL,,,,,,${activeEmps.reduce((sum, emp) => {
      let d = 0;
      weekDates.forEach(dateStr => {
        const dayRecords = attendance[dateStr] || [];
        if (dayRecords.some(r => r.name === emp.name && r.checkIn && r.checkOut)) d++;
      });
      return sum + d;
    }, 0)},${grandTotal.toFixed(2)},,,\n`;

    // Download CSV
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_${currentLocationName.replace(/[^a-zA-Z0-9]/g, "_")}_${weekStr}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 100);
  };

  // Export Payroll to PDF
  const exportPayrollToPDF = async () => {
    const baseDate = reportDateInput.value;
    if (!baseDate) {
      alert("Selecciona una fecha para exportar la planilla.");
      return;
    }

    const weekDates = getWeekDatesFromDate(baseDate).slice(0, 7);
    const { year: isoYear, week: isoWeek } = getISOWeekInfo(new Date(baseDate + "T00:00:00"));
    const weekStr = `${isoYear}-W${isoWeek.toString().padStart(2, "0")}`;
    const activeEmps = employees.filter((emp) => {
      if (isActiveOnDate(emp, baseDate)) return true;
      return weekDates.some((dateStr) => {
        const dayRecords = attendance[dateStr] || [];
        return dayRecords.some(
          (r) => r.name === emp.name && r.checkIn && r.checkOut
        );
      });
    });

    if (activeEmps.length === 0) {
      alert("No hay empleados activos para exportar.");
      return;
    }

    const jsPDFCtor = typeof window.jspdf.jsPDF === "function" ? window.jspdf.jsPDF : window.jspdf.default;
    if (!jsPDFCtor) {
      alert("jspdf no está disponible.");
      return;
    }

    const doc = new jsPDFCtor({
      unit: "pt",
      format: "a4",
      orientation: "landscape",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("PLANILLA DE PAGO", centerX, 40, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Ubicación: ${currentLocationName}`, centerX, 58, { align: "center" });
    doc.text(`Semana: ${weekStr}`, centerX, 74, { align: "center" });

    // Table
    const head = [["#", "Empleado", "DNI", "Procedencia", "Cargo", "Tarifa", "L", "M", "X", "J", "V", "S", "D", "Días", "Monto", "Modalidad", "Banco"]];
    const body = [];
    let grandTotal = 0;
    let grandDays = 0;

    activeEmps.forEach((emp, idx) => {
      const tarifa = emp.tarifaDiaria || 0;
      let daysWorked = 0;

      const dayMarks = weekDates.map(dateStr => {
        const dayRecords = attendance[dateStr] || [];
        const present = dayRecords.some(r => r.name === emp.name && r.checkIn && r.checkOut);
        if (present) daysWorked++;
        return present ? "✓" : "-";
      });

      const monto = daysWorked * tarifa;
      grandTotal += monto;
      grandDays += daysWorked;

      body.push([
        idx + 1,
        emp.name,
        emp.dni || "-",
        emp.procedencia || "-",
        emp.position || "-",
        `S/${tarifa.toFixed(0)}`,
        ...dayMarks,
        daysWorked,
        `S/${monto.toFixed(2)}`,
        emp.modalidadPago || "-",
        emp.banco || "-"
      ]);
    });

    // Total row
    body.push([
      { content: "TOTAL GENERAL", colSpan: 13, styles: { halign: "right", fontStyle: "bold" } },
      { content: grandDays, styles: { fontStyle: "bold" } },
      { content: `S/${grandTotal.toFixed(2)}`, styles: { fontStyle: "bold" } },
      "",
      ""
    ]);

    const applyAutoTable = (opts) => {
      if (doc.autoTable) {
        doc.autoTable({ ...opts });
      } else if (window.jspdf && window.jspdf.autoTable) {
        window.jspdf.autoTable(doc, { ...opts });
      }
    };

    applyAutoTable({
      head,
      body,
      startY: 90,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
        overflow: "linebreak",
      },
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      bodyStyles: { valign: "middle" },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { left: 30, right: 30 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 110 },
        2: { cellWidth: 55 },
        3: { cellWidth: 70 },
        4: { cellWidth: 70 },
        5: { cellWidth: 45 },
        6: { cellWidth: 22 },
        7: { cellWidth: 22 },
        8: { cellWidth: 22 },
        9: { cellWidth: 22 },
        10: { cellWidth: 22 },
        11: { cellWidth: 22 },
        12: { cellWidth: 22 },  // Domingo
        13: { cellWidth: 35 },  // Días
        14: { cellWidth: 60 },  // Monto
        15: { cellWidth: 70 },  // Modalidad
        16: { cellWidth: 50 },  // Banco
      }
    });

    doc.save(`Planilla_${currentLocationName.replace(/[^a-zA-Z0-9]/g, "_")}_${weekStr}.pdf`);
  };

  // Helper: calcular semana ISO para una fecha dada (año ISO y número de semana ISO)

  const getISOWeekInfo = (date) => {
    // Convertir a UTC para evitar problemas de zona horaria

    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    // Día de la semana (1..7) con Lunes=1, Domingo=7

    const dayNum = d.getUTCDay() === 0 ? 7 : d.getUTCDay();

    // Llevar al jueves de la semana actual (regla ISO)

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    // Año ISO

    const isoYear = d.getUTCFullYear();

    // Primer día del año ISO

    const yearStart = new Date(Date.UTC(isoYear, 0, 1));

    // Número de semana ISO

    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

    return { year: isoYear, week: weekNo };
  };

  const updateIsoWeekBadge = () => {
    if (!isoWeekBadgeEl) return;

    if (!reportDateInput.value) {
      isoWeekBadgeEl.textContent = "";
      return;
    }

    const d = new Date(reportDateInput.value + "T00:00:00");

    const { week } = getISOWeekInfo(d);

    isoWeekBadgeEl.textContent = `W-${week.toString().padStart(2, "0")}`;
  };

  const updateWeekRangeBadge = () => {
    if (!weekRangeBadgeEl) return;

    const dateStr = reportDateInput.value;

    if (!dateStr) {
      weekRangeBadgeEl.textContent = "";
      return;
    }

    const days = getWeekDatesFromDate(dateStr);

    if (!days.length) {
      weekRangeBadgeEl.textContent = "";
      return;
    }

    const toDM = (iso) => {
      const [y, m, d] = iso.split("-");
      return `${d}/${m}`;
    };

    weekRangeBadgeEl.textContent = `${toDM(days[0])} - ${toDM(days[5])}`;
  };

  reportDateInput.addEventListener("change", () => {
    updateExpectedHours();

    renderDailyReport();

    renderWeeklyReport();

    updateIsoWeekBadge();

    updateWeekRangeBadge();

    loadWeeklyNotes();

    renderEmployeeList();

    renderCustomDropdown();

    loadDailyTopic();

    renderPayroll(); // Update payroll table
  });

  // Configurar horas semanales

  setWeeklyHoursBtn.addEventListener("click", () => {
    const config = prompt(
      "Configurar horas por día de la semana:\n" +
      "Formato: Lun,Mar,Mié,Jue,Vie,Sáb,Dom (separado por comas)\n" +
      "Ejemplo: 9,9,9,9,9,5,0\n\n" +
      "Configuración actual: " +
      [
        weeklyHoursConfig[1],
        weeklyHoursConfig[2],
        weeklyHoursConfig[3],

        weeklyHoursConfig[4],
        weeklyHoursConfig[5],
        weeklyHoursConfig[6],
        weeklyHoursConfig[0],
      ].join(","),

      [
        weeklyHoursConfig[1],
        weeklyHoursConfig[2],
        weeklyHoursConfig[3],

        weeklyHoursConfig[4],
        weeklyHoursConfig[5],
        weeklyHoursConfig[6],
        weeklyHoursConfig[0],
      ].join(",")
    );

    if (config) {
      const hours = config
        .split(",")
        .map((h) => parseFloat(h.trim()) || 0);

      if (hours.length === 7) {
        weeklyHoursConfig[1] = hours[0]; // Lunes

        weeklyHoursConfig[2] = hours[1]; // Martes

        weeklyHoursConfig[3] = hours[2]; // Miércoles

        weeklyHoursConfig[4] = hours[3]; // Jueves

        weeklyHoursConfig[5] = hours[4]; // Viernes

        weeklyHoursConfig[6] = hours[5]; // Sábado

        weeklyHoursConfig[0] = hours[6]; // Domingo

        saveWeeklyHoursConfig();

        updateExpectedHours();

        renderDailyReport();

        renderWeeklyReport();

        alert("Configuración guardada correctamente");
      } else {
        alert(
          "Error: Debes ingresar exactamente 7 valores separados por comas"
        );
      }
    }
  });

  // Navegación rápida entre días

  const setReportDate = (d) => {
    const yyyy = d.getFullYear();

    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const dd = String(d.getDate()).padStart(2, "0");

    reportDateInput.value = `${yyyy}-${mm}-${dd}`;
    updateDateVisual(); // sync visual input
  };

  const shiftReportDate = (delta) => {
    const current = reportDateInput.value
      ? new Date(reportDateInput.value + "T00:00:00")
      : new Date();

    current.setDate(current.getDate() + delta);

    setReportDate(current);

    updateExpectedHours();

    renderDailyReport();

    renderWeeklyReport();

    updateIsoWeekBadge();

    renderEmployeeList();

    renderCustomDropdown();

    loadDailyTopic();
  };

  if (prevDayBtn)
    prevDayBtn.addEventListener("click", () => shiftReportDate(-1));

  if (nextDayBtn)
    nextDayBtn.addEventListener("click", () => shiftReportDate(1));

  // Sin selector de semana: el resumen semanal se sincroniza con la fecha diaria

  // --- Lógica del buscador/selector personalizado ---

  employeeSearchSelect.addEventListener("focus", () => {
    dropdownActiveIndex = 0;

    renderCustomDropdown();

    employeeDropdown.classList.remove("hidden");
  });

  employeeSearchSelect.addEventListener("input", () => {
    selectedEmployeeForAttendance = null;

    dropdownActiveIndex = 0;

    renderCustomDropdown();

    employeeDropdown.classList.remove("hidden");
  });

  // Navegación por teclado en el buscador del Paso 2

  employeeSearchSelect.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();

      if (employeeDropdown.classList.contains("hidden")) {
        dropdownActiveIndex = 0;

        renderCustomDropdown();

        employeeDropdown.classList.remove("hidden");

        return;
      }

      if (lastDropdownEmployees.length > 0) {
        dropdownActiveIndex = Math.min(
          dropdownActiveIndex + 1,
          lastDropdownEmployees.length - 1
        );

        updateDropdownHighlight();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      if (
        !employeeDropdown.classList.contains("hidden") &&
        lastDropdownEmployees.length > 0
      ) {
        dropdownActiveIndex = Math.max(dropdownActiveIndex - 1, 0);

        updateDropdownHighlight();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (
        !employeeDropdown.classList.contains("hidden") &&
        dropdownActiveIndex >= 0 &&
        dropdownActiveIndex < lastDropdownEmployees.length
      ) {
        const employee = lastDropdownEmployees[dropdownActiveIndex];

        selectedEmployeeForAttendance = employee;

        employeeSearchSelect.value = employee.name;

        employeeDropdown.classList.add("hidden");

        registerSelectedAttendance();
      } else if (selectedEmployeeForAttendance) {
        registerSelectedAttendance();
      }
    } else if (e.key === "Escape") {
      employeeDropdown.classList.add("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative")) {
      employeeDropdown.classList.add("hidden");
    }
  });

  // Guardar Tema del día (click/Enter/blur)

  if (saveDailyTopicBtn) {
    saveDailyTopicBtn.addEventListener("click", () => {
      saveDailyTopicValue();
      renderDailyReport();
    });
  }

  if (dailyTopicInput) {
    dailyTopicInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveDailyTopicValue();
        renderDailyReport();
        dailyTopicInput.blur();
      }
    });

    dailyTopicInput.addEventListener("blur", () => {
      saveDailyTopicValue();
      renderDailyReport();
    });
  }

  if (dailyTopicDurationInput) {
    dailyTopicDurationInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveDailyTopicValue();
        renderDailyReport();
        dailyTopicDurationInput.blur();
      }
    });

    dailyTopicDurationInput.addEventListener("blur", () => {
      saveDailyTopicValue();
      renderDailyReport();
    });

    dailyTopicDurationInput.addEventListener("change", () => {
      saveDailyTopicValue();
      renderDailyReport();
    });
  }

  // También permitir Enter en las horas para registrar rápido

  if (checkInTimeInput) {
    checkInTimeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        registerSelectedAttendance();
      }
    });

    // Recalcular hora de salida cuando cambia la hora de entrada

    checkInTimeInput.addEventListener("change", () => {
      if (reportDateInput.value) {
        const defaultCheckOut = getDefaultCheckOutTime(
          reportDateInput.value,
          checkInTimeInput.value
        );

        checkOutTimeInput.value = defaultCheckOut;
      }
    });
  }

  if (checkOutTimeInput) {
    checkOutTimeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        registerSelectedAttendance();
      }
    });
  }

  // --- LÓGICA DE EXPORTACIÓN ---

  const getReportData = () => {
    const date = reportDateInput.value;

    const dailyAttendance = attendance[date] || [];

    const activeEmps = date ? employeesForDate(date) : employees;

    const empByName = new Map(activeEmps.map((e) => [e.name, e]));

    const names = Array.from(
      new Set([
        ...activeEmps.map((e) => e.name),

        ...dailyAttendance.map((r) => r.name),
      ])
    );

    const tEntry = (dailyTopics || {})[date];

    const topic =
      tEntry && typeof tEntry === "object"
        ? tEntry.topic || ""
        : tEntry || "";

    const duration =
      tEntry &&
        typeof tEntry === "object" &&
        tEntry.duration != null &&
        tEntry.duration !== ""
        ? tEntry.duration
        : "";

    return names.map((name) => {
      const employee = empByName.get(name) || { dni: "", position: "" };

      const record = dailyAttendance.find((r) => r.name === name);

      if (record) {
        const { total, overtime } = calculateHours(
          record.checkIn,
          record.checkOut,
          date
        );

        return {
          Empleado: name,
          "DNI / CE": employee.dni,
          Cargo: employee.position,

          Entrada: record.checkIn,
          Salida: record.checkOut,
          "Hrs. Trabajadas": total,

          "Hrs. Extra": overtime,
          Estado: "Presente",
          Observaciones: record.observation || "",
          Tema: topic,
          "Duración (min)": duration,
        };
      }

      return {
        Empleado: name,
        "DNI / CE": employee.dni,
        Cargo: employee.position,

        Entrada: "-",
        Salida: "-",
        "Hrs. Trabajadas": "-",

        "Hrs. Extra": "-",
        Estado: "Ausente",
        Observaciones: "",
        Tema: topic,
        "Duración (min)": duration,
      };
    });
  };

  exportExcelBtn.addEventListener("click", () => {
    const data = getReportData();

    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");

    XLSX.writeFile(
      workbook,
      `Reporte_Asistencia_${reportDateInput.value}.xlsx`
    );
  });

  exportPdfBtn.addEventListener("click", async () => {
    // Exportar tablas detalladas por día de la semana (Lunes a Sábado) usando la semana de la fecha diaria

    if (!employees.length) {
      alert("No hay empleados para exportar.");
      return;
    }

    const baseDate = reportDateInput.value;

    if (!baseDate) {
      alert("Selecciona una fecha.");
      return;
    }

    const d = new Date(baseDate + "T00:00:00");

    const { year: isoYear, week: isoWeek } = getISOWeekInfo(d);

    const weekStr = `${isoYear}-W${isoWeek.toString().padStart(2, "0")}`;

    const jsPDFCtor =
      (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;

    if (!jsPDFCtor) {
      alert("No se pudo cargar jsPDF. Verifica la conexión.");
      return;
    }

    const doc = new jsPDFCtor({
      unit: "pt",
      format: "a4",
      orientation: "landscape",
      compress: true,
    });

    // Portada / encabezado

    const title = "Reporte de Asistencia Semanal";

    const sub = `Semana: ${weekStr}`;

    const pageWidthCover = doc.internal.pageSize.getWidth();

    const centerX = pageWidthCover / 2;

    doc.setFontSize(20);

    doc.text(title, centerX, 60, { align: "center" });

    doc.setFontSize(12);

    doc.setTextColor(100);

    doc.text(sub, centerX, 80, { align: "center" });

    // Rango de la semana (Lunes a Sábado)

    const _wd = getWeekDatesFromDate(baseDate);

    const _toDMY = (iso) => {
      const [y, m, d] = iso.split("-");
      return `${d}/${m}/${y}`;
    };

    const rangeText = `Del ${_toDMY(_wd[0])} al ${_toDMY(_wd[5])}`;

    doc.text(rangeText, centerX, 96, { align: "center" });

    const wrapWidth = pageWidthCover - 80; // 40pt margin each side

    // Variables para posicionar elementos de portada

    let coverYStart = 120;

    let coverNotesText = "";

    // Título de la sede/losa + Dirección (las notas se posponen para después de la tabla de eventos)

    if (typeof currentLocationName === "string" && currentLocationName) {
      let y = coverYStart;

      doc.text(`Sede: ${currentLocationName}`, 40, y);

      y += 20;

      const addr =
        appData.locationDetails &&
          appData.locationDetails[currentLocationName]
          ? appData.locationDetails[currentLocationName].address || ""
          : "";

      if (addr) {
        const addrLines = doc.splitTextToSize(
          `Dirección: ${addr}`,
          wrapWidth
        );

        doc.text(addrLines, 40, y);

        y += addrLines.length * 14;
      }

      coverYStart = y + 10;

      const notesMap =
        appData && appData.data && appData.data[currentLocationName]
          ? appData.data[currentLocationName].weeklyNotes || {}
          : {};

      coverNotesText = (notesMap[weekStr] || "").trim();
    }

    doc.setTextColor(0);

    const head = [
      [
        "Empleado",
        "DNI / CE",
        "Cargo",
        "Entrada",
        "Almuerzo",
        "Salida",
        "Hrs. Trabajadas",
        "Hrs. Extra",
        "Estado",
        "Observaciones",
      ],
    ];

    const baseTable = {
      theme: "grid",

      styles: {
        fontSize: 9,
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        overflow: "linebreak",
      },

      headStyles: { fillColor: [31, 41, 55], textColor: 255 },

      bodyStyles: { valign: "middle" },

      alternateRowStyles: { fillColor: [245, 247, 250] },

      margin: { left: 40, right: 40 },
    };

    const applyAutoTable = (opts) => {
      if (doc.autoTable) {
        try {
          doc.autoTable({ ...opts });
        } catch (e) {
          console.warn(e);
        }
      } else if (window.jspdf && window.jspdf.autoTable) {
        try {
          window.jspdf.autoTable(doc, { ...opts });
        } catch (e) {
          console.warn(e);
        }
      } else {
        throw new Error("jspdf-autotable no está disponible");
      }
    };

    // Tabla de eventos de la semana (Altas/Bajas/Reactivaciones) si existen

    const eventsMap =
      appData && appData.data && appData.data[currentLocationName]
        ? appData.data[currentLocationName].weeklyNotesLog || {}
        : {};

    const events = eventsMap[weekStr] || [];

    let afterCoverY = coverYStart;

    if (events.length > 0) {
      // Título para la tabla de registros generales

      doc.setFontSize(12);

      doc.text("Registros generales de la semana", 40, coverYStart);

      const eventHead = [["Fecha", "Evento", "Empleado", "DNI", "Cargo"]];

      const eventBody = events

        .sort((a, b) => a.date.localeCompare(b.date))

        .map((ev) => [
          (() => {
            const [y, m, d] = ev.date.split("-");
            return `${d}/${m}/${y}`;
          })(),

          ev.event || "",

          ev.name || "",

          ev.dni || "",

          ev.position || "",
        ]);

      applyAutoTable({
        head: eventHead,

        body: eventBody,

        startY: coverYStart + 16,

        ...baseTable,
      });

      afterCoverY =
        doc.lastAutoTable && doc.lastAutoTable.finalY
          ? doc.lastAutoTable.finalY + 12
          : coverYStart + 12;
    }

    // Se elimina la impresión de 'Notas generales' en portada a solicitud del usuario.

    const weekDates = getWeekDatesFromDate(baseDate);

    // Solo Lunes (index 0) a Sábado (index 5)

    const sixDays = weekDates.slice(0, 6);

    const dayNames = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const formatHoursHM = (hours) => {
      if (typeof hours !== "number" || isNaN(hours)) return "-";

      const sign = hours < 0 ? "-" : "";

      const totalMinutes = Math.round(Math.abs(hours) * 60);

      const h = Math.floor(totalMinutes / 60);

      const m = totalMinutes % 60;

      return `${sign}${h}:${String(m).padStart(2, "0")}`;
    };

    const buildDailyData = (date) => {
      const dailyAttendance = attendance[date] || [];

      let present = 0,
        absent = 0,
        totalHours = 0,
        totalOvertime = 0;

      // Map rápidos por nombre para acceso O(1)

      const presentMap = new Map(dailyAttendance.map((r) => [r.name, r]));

      // Separar presentes y ausentes con su cargo

      const presentRows = [];

      const absentRows = [];

      const activeEmps = employeesForDate(date);

      const activeSet = new Set(activeEmps.map((e) => e.name));

      const empByName = new Map(activeEmps.map((e) => [e.name, e]));

      // Primero, agregar presentes para activos

      activeEmps.forEach((employee) => {
        const rec = presentMap.get(employee.name);

        if (rec) {
          present++;

          const { total, overtime, lunchDeducted } = calculateHours(
            rec.checkIn,
            rec.checkOut,
            date
          );

          const lunchText = lunchDeducted ? "12:00 - 13:00" : "-";

          totalHours += typeof total === "number" ? total : 0;

          totalOvertime += typeof overtime === "number" ? overtime : 0;

          presentRows.push({
            cargo: employee.position,

            nombre: employee.name,

            row: [
              employee.name,
              employee.dni,
              employee.position,
              rec.checkIn,
              lunchText,
              rec.checkOut,
              formatHoursHM(total),
              formatHoursHM(overtime),
              "Presente",
              rec.observation && rec.observation.trim()
                ? rec.observation
                : "-",
            ],
          });
        } else {
          absent++;

          absentRows.push({
            cargo: employee.position,

            nombre: employee.name,

            row: [
              employee.name,
              employee.dni,
              employee.position,
              "-",
              "-",
              "-",
              "-",
              "-",
              "Ausente",
              "-",
            ],
          });
        }
      });

      // Además, si existen registros presentes de nombres que ya no están en la lista activa (p.ej. eliminados), incluirlos como presentes

      presentMap.forEach((rec, name) => {
        if (activeSet.has(name)) return; // ya incluido arriba

        // Buscar datos básicos si existen en el listado global histórico

        const allEmp = employees.find((e) => e.name === name) || {};

        const { total, overtime, lunchDeducted } = calculateHours(
          rec.checkIn,
          rec.checkOut,
          date
        );

        const lunchText = lunchDeducted ? "12:00 - 13:00" : "-";

        present++;

        totalHours += typeof total === "number" ? total : 0;

        totalOvertime += typeof overtime === "number" ? overtime : 0;

        presentRows.push({
          cargo: allEmp.position || "",

          nombre: name,

          row: [
            name,
            allEmp.dni || "",
            allEmp.position || "",
            rec.checkIn,
            lunchText,
            rec.checkOut,
            formatHoursHM(total),
            formatHoursHM(overtime),
            "Presente",
            rec.observation && rec.observation.trim()
              ? rec.observation
              : "-",
          ],
        });
      });

      // Agrupar por cargo y ordenar por nombre dentro de cada cargo

      const groupAndSort = (items) => {
        const byCargo = new Map();

        items.forEach((it) => {
          if (!byCargo.has(it.cargo)) byCargo.set(it.cargo, []);

          byCargo.get(it.cargo).push(it);
        });

        // Ordenar cargos alfabéticamente para consistencia

        const cargosOrdenados = Array.from(byCargo.keys()).sort((a, b) =>
          (a || "").localeCompare(b || "", "es", { sensitivity: "base" })
        );

        const rows = [];

        cargosOrdenados.forEach((cargo) => {
          const arr = byCargo.get(cargo).sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es", {
              sensitivity: "base",
            })
          );

          arr.forEach((it) => rows.push(it.row));
        });

        return rows;
      };

      const orderedPresent = groupAndSort(presentRows);

      const orderedAbsent = groupAndSort(absentRows); // ausentes al final

      const body = [...orderedPresent, ...orderedAbsent];

      return { body, present, absent, totalHours, totalOvertime };
    };

    // Preparar captura del 'Resumen Visual de la Semana' para añadirla al final

    let resumenImgData = null,
      resumenW = 0,
      resumenH = 0;

    const resumenEl = document.getElementById("resumen-visual-semanal");

    if (resumenEl && window.html2canvas) {
      try {
        // Aseguramos que los gráficos estén renderizados

        if (
          window.Chart &&
          typeof quickAttendanceChart !== "undefined" &&
          quickAttendanceChart
        ) {
          try {
            quickAttendanceChart.update("none");
          } catch (_) { }
        }

        // Llevar el bloque a la vista y esperar un instante para layout/paint

        try {
          resumenEl.scrollIntoView({ behavior: "auto", block: "center" });
        } catch (_) { }

        await new Promise((r) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setTimeout(r, 250))
          )
        );

        const canvas = await html2canvas(resumenEl, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.75);

        const pageWidth = doc.internal.pageSize.getWidth();

        const pageHeight = doc.internal.pageSize.getHeight();

        const marginX = 40,
          marginY = 50;

        const maxW = pageWidth - marginX * 2;

        const maxH = pageHeight - marginY * 2;

        let w = maxW;

        let h = canvas.height * (w / canvas.width);

        if (h > maxH) {
          h = maxH;

          w = canvas.width * (h / canvas.height);
        }

        resumenImgData = imgData;

        resumenW = w;

        resumenH = h;
      } catch (_) {
        /* no-op */
      }
    }

    // Pasar a nueva página para los detalles diarios

    doc.addPage();

    // Renderizar una página por cada día (una página por día)

    sixDays.forEach((date, idx) => {
      if (idx > 0) doc.addPage();

      const { body, present, absent, totalHours, totalOvertime } =
        buildDailyData(date);

      // Formatear fecha dd/mm/yyyy

      const [y, m, d] = date.split("-");

      const dateDMY = `${d}/${m}/${y}`;

      doc.setFontSize(14);

      doc.text(`${dayNames[idx]} - ${dateDMY}`, 40, 50);

      doc.setFontSize(12);

      doc.text(`Presentes: ${present}   Ausentes: ${absent}`, 40, 70);

      const rawTopic2 = (dailyTopics || {})[date];

      const topic =
        rawTopic2 && typeof rawTopic2 === "object"
          ? rawTopic2.topic || ""
          : rawTopic2 || "";

      const durText =
        rawTopic2 &&
          typeof rawTopic2 === "object" &&
          rawTopic2.duration != null &&
          rawTopic2.duration !== ""
          ? ` (${rawTopic2.duration} min)`
          : "";

      doc.text(`Tema: ${topic}${durText}`.trim(), 40, 95);

      // Se elimina la línea de totales de horas a pedido del usuario

      const tableStartY = 130;

      try {
        applyAutoTable({
          head,

          body,

          startY: tableStartY,

          ...baseTable,

          columnStyles: {
            0: { cellWidth: 160 },  // Empleado (mas ancho aun)
            1: { cellWidth: 60 },   // DNI
            2: { cellWidth: 80 },   // Cargo
            3: { cellWidth: 50 },   // Entrada
            4: { cellWidth: 65 },   // Almuerzo
            5: { cellWidth: 50 },   // Salida
            6: { cellWidth: 60 },   // Hrs Trabajadas
            7: { cellWidth: 60 },   // Hrs Extra
            8: { cellWidth: 60 },   // Estado
            9: { cellWidth: 115 },  // Observaciones
          },

          didParseCell: (data) => {
            if (data && data.cell && data.cell.raw === "-") {
              data.cell.styles.halign = "center";
            }
          },
        });
      } catch (e) {
        alert(e.message);
      }

    });

    // Añadir el 'Resumen Visual de la Semana' como la última página

    if (resumenImgData) {
      const marginX = 40,
        marginY = 50;

      doc.addPage();

      doc.setFontSize(14);

      doc.text("Resumen Visual de la Semana", marginX, marginY - 10);

      doc.addImage(
        resumenImgData,
        "JPEG",
        marginX,
        marginY,
        resumenW,
        resumenH,
        undefined,
        "FAST" // Compression
      );
    } else if (resumenEl) {
      // Fallback para asegurar presencia de la sección aun si la captura falla

      doc.addPage();

      doc.setFontSize(14);

      doc.text("Resumen Visual de la Semana", 40, 50);

      doc.setFontSize(11);

      doc.setTextColor(120);

      doc.text(
        "No se pudo capturar el resumen visual automáticamente. Por favor verifique la vista en la aplicación.",
        40,
        70
      );

      doc.setTextColor(0);
    }

    const safeLoc = (currentLocationName || "Sede").replace(
      /[^a-zA-Z0-9_-]+/g,
      "_"
    );

    doc.save(`Reporte_Asistencia_${safeLoc}_Semana_${weekStr}.pdf`);
  });

  // --- LÓGICA DEL SELECTOR DE SEDE ---

  const switchLocation = (newIndex) => {
    appData.currentLocationIndex = newIndex;

    currentLocationName = locations[newIndex];

    // Cargar datos de la nueva sede

    loadLocationData();

    // Actualizar UI

    currentLocationNameEl.textContent = currentLocationName;

    if (currentLocationAddressEl) {
      const addr =
        appData.locationDetails &&
          appData.locationDetails[currentLocationName]
          ? appData.locationDetails[currentLocationName].address || ""
          : "";

      currentLocationAddressEl.textContent = addr;
    }

    renderAllReports();

    renderPayroll(); // Update payroll table when switching locations

    renderEmployeeList();

    renderCustomDropdown();

    loadDailyTopic();

    renderLocationPanelList(); // Actualizar el panel

    updateIsoWeekBadge();

    updateWeekRangeBadge();

    loadWeeklyNotes();

    saveData();
  };

  const renderLocationPanelList = () => {
    if (!locationPanelList) return;

    locationPanelList.innerHTML = "";

    const enabledLocs = getEnabledLocations();

    enabledLocs.forEach((loc, idx) => {
      const realIdx = appData.locations.indexOf(loc);

      const item = document.createElement("div");

      const addr =
        appData.locationDetails && appData.locationDetails[loc]
          ? appData.locationDetails[loc].address
          : "";

      item.className = `p-2 rounded-md cursor-pointer hover:bg-slate-700 ${realIdx === appData.currentLocationIndex
        ? "bg-cyan-600 text-white font-semibold"
        : ""
        }`;

      item.innerHTML = `

                <div class="text-sm">${loc}</div>

                ${addr
          ? `<div class="text-xs text-slate-400">${addr}</div>`
          : ""
        }

            `;

      item.addEventListener("click", () => {
        switchLocation(realIdx);

        if (locationPanel) locationPanel.classList.add("hidden");
      });

      locationPanelList.appendChild(item);
    });
  };

  // Renderizar panel de gestión de losas (Más Opciones)

  const renderLocationToggleList = () => {
    if (!locationToggleList) return;

    locationToggleList.innerHTML = "";

    if (!appData.disabledLocations) appData.disabledLocations = [];

    (appData.locations || []).forEach((loc) => {
      const isEnabled = !appData.disabledLocations.includes(loc);

      const addr =
        appData.locationDetails && appData.locationDetails[loc]
          ? appData.locationDetails[loc].address
          : "";

      const item = document.createElement("div");

      item.className =
        "flex items-center justify-between p-3 bg-slate-800 rounded-md border border-slate-600";

      item.innerHTML = `

                <div class="flex-1">

                    <div class="text-sm font-medium ${isEnabled ? "text-slate-200" : "text-slate-500"
        }">${loc}</div>

                    ${addr
          ? `<div class="text-xs text-slate-400">${addr}</div>`
          : ""
        }

                </div>

                <label class="relative inline-flex items-center cursor-pointer">

                    <input type="checkbox" ${isEnabled ? "checked" : ""
        } class="sr-only peer" data-location="${loc}">

                    <div class="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>

                </label>

            `;

      const checkbox = item.querySelector('input[type="checkbox"]');

      checkbox.addEventListener("change", (e) => {
        toggleLocationEnabled(loc, e.target.checked);
      });

      locationToggleList.appendChild(item);
    });
  };

  // Obtener losas habilitadas

  const getEnabledLocations = () => {
    if (!appData.disabledLocations) appData.disabledLocations = [];

    return (appData.locations || []).filter(
      (loc) => !appData.disabledLocations.includes(loc)
    );
  };

  // Habilitar/deshabilitar losa

  const toggleLocationEnabled = (locName, enabled) => {
    if (!appData.disabledLocations) appData.disabledLocations = [];

    if (enabled) {
      // Habilitar: remover de la lista de deshabilitadas

      appData.disabledLocations = appData.disabledLocations.filter(
        (l) => l !== locName
      );
    } else {
      // Deshabilitar: agregar a la lista

      if (!appData.disabledLocations.includes(locName)) {
        appData.disabledLocations.push(locName);
      }

      // Si la losa actual se deshabilita, cambiar a la primera habilitada

      if (currentLocationName === locName) {
        const enabledLocs = getEnabledLocations();

        if (enabledLocs.length > 0) {
          const firstEnabledIdx = appData.locations.indexOf(
            enabledLocs[0]
          );

          switchLocation(firstEnabledIdx);
        } else {
          alert("Debe haber al menos una losa habilitada.");

          appData.disabledLocations = appData.disabledLocations.filter(
            (l) => l !== locName
          );

          renderLocationToggleList();

          return;
        }
      }
    }

    saveData();

    renderLocationToggleList();

    renderLocationPanelList();
  };

  const loadLocationData = () => {
    // Autocorrección si falta la sede en datos persistidos

    if (!appData.data[currentLocationName]) {
      appData.data[currentLocationName] = {
        employees: [],

        attendance: {},

        weeklyHoursConfig: { 0: 0, 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 5 },

        dailyTopics: {},

        weeklyNotes: {},

        weeklyNotesLog: {},
      };

      saveData();
    }

    const data = appData.data[currentLocationName];

    employees = data.employees;

    attendance = data.attendance;

    weeklyHoursConfig = data.weeklyHoursConfig;

    dailyTopics = data.dailyTopics || {};

    if (!data.dailyTopics) {
      data.dailyTopics = dailyTopics;
      saveData();
    }

    weeklyNotes = data.weeklyNotes || {};

    if (!data.weeklyNotes) {
      data.weeklyNotes = weeklyNotes;
      saveData();
    }

    weeklyNotesLog = data.weeklyNotesLog || {};

    if (!data.weeklyNotesLog) {
      data.weeklyNotesLog = weeklyNotesLog;
      saveData();
    }
  };

  // --- FUNCIONES PARA DATOS DE MUESTRA ---

  // Función para generar datos de muestra (disponible globalmente)
  // --- INICIALIZACIÓN ---

  const initialize = async () => {
    const buildEmptyAppData = () => {
      const baseLocations = Array.isArray(locations)
        ? [...locations]
        : [];

      const blank = {
        locations: baseLocations,
        currentLocationIndex: 0,
        data: {},
        locationDetails: {},
        disabledLocations: [],
      };

      baseLocations.forEach((loc) => {
        blank.data[loc] = {
          employees: [],
          attendance: {},
          weeklyHoursConfig: {
            0: 0,
            1: 9,
            2: 9,
            3: 9,
            4: 9,
            5: 9,
            6: 5,
          },
          dailyTopics: {},
          weeklyNotes: {},
          weeklyNotesLog: {},
        };

        blank.locationDetails[loc] = { address: "" };
      });

      return blank;
    };

    await storage.init();

    let loadedData = null;
    let needsPersist = false;

    try {
      loadedData = await storage.load();
    } catch (error) {
      console.error("No se pudo cargar datos almacenados:", error);
    }

    if (!loadedData) {
      // Migración desde claves antiguas de localStorage si existen
      const oldEmployees = localStorage.getItem("employees");
      const oldAttendance = localStorage.getItem("attendance");
      const oldConfig = localStorage.getItem("weeklyHoursConfig");

      if (oldEmployees || oldAttendance || oldConfig) {
        const draft = buildEmptyAppData();
        draft.data[draft.locations[0]].employees =
          JSON.parse(oldEmployees) || [];
        draft.data[draft.locations[0]].attendance =
          JSON.parse(oldAttendance) || {};
        if (oldConfig) {
          draft.data[draft.locations[0]].weeklyHoursConfig =
            JSON.parse(oldConfig);
        }

        try {
          localStorage.removeItem("employees");
          localStorage.removeItem("attendance");
          localStorage.removeItem("weeklyHoursConfig");
        } catch { }

        loadedData = draft;
        needsPersist = true;
      }
    }

    if (loadedData) {
      loadedData = migrateImportedData(loadedData);
    }

    const demo = window.DemoData || null;

    // En el despliegue público (o con ?demo=reset) se refresca la demo cuando
    // cambia la versión del dataset, aunque ya hubiera datos guardados.
    if (loadedData && demo && demo.needsReseed()) {
      loadedData = null;
    }

    if (!loadedData || !validateAppData(loadedData)) {
      const mode = demo ? demo.decideInitialData() : "ask";

      if (mode === "demo") {
        // Demo pública: se siembra en silencio, sin preguntar nada.
        loadedData = demo.build();
        demo.markSeeded();
      } else if (mode === "empty") {
        loadedData = buildEmptyAppData();
      } else {
        // Uso real: se mantiene la pregunta de siempre.
        const useSampleData = confirm("📋 Sistema inicializado por primera vez.\n\n" +
          "¿Deseas cargar datos de muestra realistas para probar el sistema?\n\n" +
          "• 3 losas deportivas con su personal\n" +
          "• ~7 semanas de registros de asistencia\n" +
          "• Charlas SSOMA diarias y notas semanales\n" +
          "• Planilla semanal con incidencias revisadas\n\n" +
          "Selecciona Cancelar para iniciar con el sistema vacío.");

        if (useSampleData && demo) {
          loadedData = demo.build();
          demo.markSeeded();
        } else {
          loadedData = buildEmptyAppData();
        }
      }

      needsPersist = true;
    }

    appData = loadedData;

    if (needsPersist) {
      await saveData();
    }

    // Asegurar estructura de sedes y de status por empleado

    ensureLocationsConsistency();

    migrateEmployeesStructure();

    // 2. Configurar el estado inicial

    const initialIndex = appData.currentLocationIndex || 0;

    // Sincronizar variable local y select

    locations = appData.locations;

    currentLocationName = locations[initialIndex];

    currentLocationNameEl.textContent = currentLocationName;

    if (currentLocationAddressEl) {
      const addr =
        appData.locationDetails &&
          appData.locationDetails[currentLocationName]
          ? appData.locationDetails[currentLocationName].address || ""
          : "";

      currentLocationAddressEl.textContent = addr;
    }

    loadLocationData();

    renderLocationPanelList();

    // 3. Configurar listeners del selector de sede (solo losas habilitadas)

    prevLocationBtn.addEventListener("click", () => {
      const enabledLocs = getEnabledLocations();

      if (enabledLocs.length === 0) return;

      const currentIdx = enabledLocs.indexOf(currentLocationName);

      let newIdx = currentIdx - 1;

      if (newIdx < 0) newIdx = enabledLocs.length - 1;

      const newLocName = enabledLocs[newIdx];

      const realIdx = appData.locations.indexOf(newLocName);

      switchLocation(realIdx);
    });

    nextLocationBtn.addEventListener("click", () => {
      const enabledLocs = getEnabledLocations();

      if (enabledLocs.length === 0) return;

      const currentIdx = enabledLocs.indexOf(currentLocationName);

      let newIdx = currentIdx + 1;

      if (newIdx >= enabledLocs.length) newIdx = 0;

      const newLocName = enabledLocs[newIdx];

      const realIdx = appData.locations.indexOf(newLocName);

      switchLocation(realIdx);
    });

    // Abrir/cerrar panel de sedes

    if (locationSwitcherMain && locationPanel) {
      locationSwitcherMain.addEventListener("click", (e) => {
        // Evitar que los botones de flecha abran el panel

        if (e.target.closest("button")) return;

        locationPanel.classList.toggle("hidden");
      });
    }

    // Cerrar panel si se hace clic fuera

    document.addEventListener("click", (e) => {
      if (locationPanel && !locationPanel.classList.contains("hidden")) {
        if (
          !e.target.closest("#location-switcher-main") &&
          !e.target.closest("#location-panel")
        ) {
          locationPanel.classList.add("hidden");
        }
      }
    });

    // Alta rápida de nueva sede

    if (addLocationToggle && addLocationInline) {
      addLocationToggle.addEventListener("click", () => {
        addLocationInline.classList.toggle("hidden");

        if (!addLocationInline.classList.contains("hidden")) {
          newLocationNameInput.value = "";

          newLocationAddressInput.value = "";

          newLocationNameInput.focus();
        }
      });
    }

    if (cancelNewLocationBtn && addLocationInline) {
      cancelNewLocationBtn.addEventListener("click", () => {
        addLocationInline.classList.add("hidden");
      });
    }

    if (saveNewLocationBtn) {
      saveNewLocationBtn.addEventListener("click", () => {
        const name = (newLocationNameInput.value || "").trim();

        const address = (newLocationAddressInput.value || "").trim();

        if (!name) {
          alert("Ingresa el nombre corto de la losa.");
          return;
        }

        if (!appData.locations) appData.locations = [];

        if (appData.locations.includes(name)) {
          alert("Ya existe una losa con ese nombre.");
          return;
        }

        // Crear estructuras

        appData.locations.push(name);

        locations = appData.locations;

        if (!appData.data) appData.data = {};

        appData.data[name] = {
          employees: [],

          attendance: {},

          weeklyHoursConfig: { 0: 0, 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 5 },

          dailyTopics: {},

          weeklyNotes: {},
        };

        if (!appData.locationDetails) appData.locationDetails = {};

        appData.locationDetails[name] = { address };

        appData.currentLocationIndex = appData.locations.length - 1;

        // Actualizar UI

        renderLocationPanelList();

        switchLocation(appData.currentLocationIndex);

        addLocationInline.classList.add("hidden");

        saveData();
      });
    }

    // Inicializar fecha diaria

    const today = new Date();

    reportDateInput.value = today.toISOString().split("T")[0];
    updateDateVisual(); // Sync on init

    updateExpectedHours();

    // Actualizar insignia de semana y rango junto a la fecha

    updateIsoWeekBadge();

    updateWeekRangeBadge();

    loadWeeklyNotes();

    // Valores por defecto de Hora de entrada/salida

    checkInTimeInput.value = "08:00";

    // Calcular hora de salida según el día de la semana configurado

    const defaultCheckOut = getDefaultCheckOutTime(
      reportDateInput.value,
      "08:00"
    );

    checkOutTimeInput.value = defaultCheckOut;

    // Cargar tema del día inicial

    loadDailyTopic();

    renderEmployeeList();

    renderCustomDropdown();

    renderAllReports();

    renderPayroll(); // Initial payroll render

    renderLocationToggleList(); // Renderizar panel de gestión de losas

    setupDailySort();

    await refreshStorageStatus();

    // Payroll export handlers
    if (exportPayrollExcelBtn) {
      exportPayrollExcelBtn.addEventListener("click", () => {
        exportPayrollToExcel();
      });
    }

    if (exportPayrollPdfBtn) {
      exportPayrollPdfBtn.addEventListener("click", () => {
        exportPayrollToPDF();
      });
    }

    // Aviso flotante cuando se está navegando sobre datos de demostración
    if (window.DemoData) {
      try {
        window.DemoData.mountBanner();
      } catch (e) {
        console.warn("No se pudo mostrar el aviso de demo:", e);
      }
    }
  };

  initialize();
});

