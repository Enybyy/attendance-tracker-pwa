/**
 * demo-data.js — Datos de demostración realistas para el despliegue público.
 *
 * Objetivo: que cualquier persona que abra el enlace vea el sistema "lleno"
 * (3 sedes, personal, ~6 semanas de asistencia, charlas SSOMA, planilla con
 * incidencias) sin tener que cargar nada a mano.
 *
 * Todo se genera con un PRNG sembrado => el mismo dataset para todos y
 * reproducible entre recargas. Las fechas son relativas a "hoy".
 *
 * API pública: window.DemoData
 *   .decideInitialData()  -> "demo" | "empty" | "ask"
 *   .build()              -> objeto appData completo
 *   .markSeeded()         -> registra que la demo ya fue sembrada
 *   .mountBanner()        -> inyecta el distintivo flotante de modo demo
 */
(function () {
  "use strict";

  // Sube este valor cuando cambies el dataset: los visitantes que ya tengan
  // la demo anterior guardada recibirán la nueva automáticamente.
  const DEMO_SEED_VERSION = "2026-09-21.2";

  const LS_SEED_KEY = "demoSeedVersion";
  const LS_OPTOUT_KEY = "demoOptOut";

  const WEEKS_BACK = 6; // semanas de historial previas a la semana en curso

  const DEMO_HOST_PATTERNS = [
    /\.github\.io$/i,
    /\.pages\.dev$/i,
    /\.netlify\.app$/i,
    /\.vercel\.app$/i,
  ];

  // --- Utilidades -----------------------------------------------------------

  const makeRandom = (seed) => {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  };

  const toYMD = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const hhmm = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const pick = (list, rnd) =>
    list[Math.min(list.length - 1, Math.floor(rnd() * list.length))];

  const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const mondayOf = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  };

  const mondayWeeksAgo = (today, weeks) => {
    const d = mondayOf(today);
    d.setDate(d.getDate() - weeks * 7);
    return toYMD(d);
  };

  // Fechas laborables (lunes a sábado) desde hace WEEKS_BACK semanas hasta hoy.
  const buildWorkDates = (today) => {
    const cursor = mondayOf(today);
    cursor.setDate(cursor.getDate() - WEEKS_BACK * 7);

    const dates = [];
    while (cursor <= today) {
      if (cursor.getDay() !== 0) dates.push(toYMD(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  };

  const isoWeekKey = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);

    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const firstDayNr = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);

    const week =
      1 + Math.round((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
  };

  // Códigos y formatos de cuenta plausibles (datos ficticios).
  const BANK_CODES = {
    BCP: "002",
    BBVA: "011",
    Interbank: "003",
    Scotiabank: "009",
    BanBif: "038",
  };

  const BANK_PREFIX = {
    BCP: "191",
    BBVA: "0011",
    Interbank: "898",
    Scotiabank: "009",
    BanBif: "038",
  };

  const accountFor = (banco, dni) =>
    `${BANK_PREFIX[banco] || "000"}-${dni}-0-${String(
      Number(dni) % 97
    ).padStart(2, "0")}`;

  const cciFor = (banco, dni) => {
    const code = BANK_CODES[banco] || "000";
    const agencia = String(100 + (Number(dni) % 800));
    const cuenta = (dni + dni).slice(0, 12);
    const control = String(Number(dni) % 97).padStart(2, "0");
    return code + agencia + cuenta + control;
  };

  // --- Catálogos ------------------------------------------------------------

  const PROC = {
    consorcio: "Consorcio Constructor Lima Sur",
    sindicato: "Sindicato de Construcción Civil",
    muni: "Municipalidad Distrital",
    local: "Mano de obra local (AA.HH.)",
    indep: "Contratista independiente",
  };

  const CHARLAS = [
    "Uso correcto del EPP en trabajos de vaciado de concreto",
    "Orden y limpieza en el frente de trabajo (metodología 5S)",
    "Riesgos ergonómicos: manipulación manual de cargas",
    "Trabajos en altura: inspección de arnés y línea de vida",
    "Prevención de cortes con herramientas manuales",
    "Señalización y delimitación de áreas de trabajo",
    "Manejo seguro de mezcladora y vibrador de concreto",
    "Hidratación y protección solar durante la jornada",
    "Riesgo eléctrico: extensiones y tableros en obra",
    "Reporte de actos y condiciones subestándar",
    "Primeros auxilios: atención inicial de heridas",
    "Plan de respuesta ante sismos y puntos de reunión",
    "Armado y arriostre seguro de andamios",
    "Prevención de caídas al mismo nivel",
    "Manipulación de cemento: prevención de dermatitis",
    "Inspección de herramientas antes del uso",
    "Control de polvo y uso de respirador en corte de ladrillo",
    "Bloqueo y etiquetado de equipos (LOTO)",
    "Izaje manual seguro de encofrados",
    "Conducta ante emergencias médicas en obra",
  ];

  const AUSENCIAS = [
    "Falta justificada — descanso médico (certificado presentado)",
    "Permiso por trámite personal autorizado por residencia",
    "Falta injustificada — no reportó a obra",
    "Permiso por cita en EsSalud",
    "Falta justificada — emergencia familiar",
    "Descanso médico por lumbalgia",
  ];

  const OBSERVACIONES = [
    "Tardanza justificada — bloqueo vial en la avenida de acceso",
    "Se retiró antes con autorización del residente de obra",
    "Horas extra por vaciado de concreto",
    "Apoyó en otra sede durante la mañana",
    "Se retiró por malestar estomacal, reportado a SSOMA",
    "Reemplazó al vigía durante el turno",
    "Charla de seguridad extendida por inspección municipal",
  ];

  const NOTAS_SEMANA = [
    "Avance de trazo y nivelación del terreno. Se coordinó con la Municipalidad el cierre parcial de la vía de acceso los martes y jueves. Pendiente: reposición de 4 arneses observados en la inspección del lunes.",
    "Semana de excavación y compactación de la sub-base. Se reforzó la señalización perimetral tras observación de SSOMA. Dos trabajadores completaron la inducción de seguridad.",
    "Vaciado de la losa de concreto en dos paños. Se reforzó el turno de vaciado con personal adicional. Sin incidentes reportados; se registraron tardanzas por congestión vehicular.",
    "Curado de losa y armado de estructuras metálicas del cerco perimétrico. Se entregó bloqueador solar y agua a todo el personal por altas temperaturas.",
    "Instalación de postes de iluminación y cableado subterráneo. Se aplicó procedimiento LOTO durante las pruebas eléctricas. Un trabajador cesó por término de contrato.",
    "Pintura de líneas de juego y colocación de tableros de básquet. Inspección conjunta con la supervisión municipal: 2 observaciones menores levantadas el mismo día.",
    "Acabados finales, limpieza de obra y entrega parcial del frente. Se preparó el expediente fotográfico y el registro de charlas para la valorización del mes.",
  ];

  // --- Plantillas de personal por sede --------------------------------------
  // n=nombre, d=DNI, p=cargo, src=procedencia, t=tarifa diaria (S/),
  // b=banco (null => pago en efectivo), rel=asistencia, punct=puntualidad,
  // ot=propensión a horas extra. startWeeksAgo/endWeeksAgo => alta/baja.

  const ROSTER_1 = [
    { n: "Víctor Hugo Ccahuana Quispe", d: "41258903", p: "Maestro de Obra", src: PROC.consorcio, t: 180, b: "BCP", rel: 0.99, punct: 0.97, ot: 0.35 },
    { n: "Gladys Marleni Huamán Ticona", d: "43870215", p: "Prevencionista SSOMA", src: PROC.consorcio, t: 165, b: "Interbank", rel: 0.98, punct: 0.98, ot: 0.15 },
    { n: "Elmer Santiago Paucar Ríos", d: "42019874", p: "Operario Albañil", src: PROC.sindicato, t: 128, b: null, rel: 0.94, punct: 0.86, ot: 0.3 },
    { n: "Rosa Amelia Ccopa Mamani", d: "45612380", p: "Operario Fierrero", src: PROC.sindicato, t: 125, b: null, rel: 0.92, punct: 0.8, ot: 0.25 },
    { n: "Juan Carlos Rodríguez Peralta", d: "40987321", p: "Operador de Equipo Liviano", src: PROC.consorcio, t: 140, b: "BBVA", rel: 0.96, punct: 0.9, ot: 0.4 },
    { n: "Miguel Ángel Soto Navarro", d: "46234517", p: "Oficial Carpintero Encofrador", src: PROC.sindicato, t: 102, b: null, rel: 0.9, punct: 0.78, ot: 0.22 },
    { n: "Luis Fernando Flores Mamani", d: "47890123", p: "Oficial Gasfitero", src: PROC.indep, t: 98, b: "Scotiabank", rel: 0.93, punct: 0.85, ot: 0.18 },
    { n: "Carlos Alberto Mendoza Silva", d: "42345678", p: "Operario Electricista", src: PROC.consorcio, t: 132, b: "BBVA", rel: 0.95, punct: 0.92, ot: 0.28 },
    { n: "Ana María Ramos Gutiérrez", d: "46123456", p: "Peón", src: PROC.local, t: 82, b: null, rel: 0.88, punct: 0.72, ot: 0.12 },
    { n: "Jorge Luis Torres Vega", d: "43456789", p: "Operario Soldador", src: PROC.sindicato, t: 135, b: null, rel: 0.91, punct: 0.83, ot: 0.45 },
    { n: "Carmen Luz Ortiz Ramírez", d: "44987654", p: "Almacenera", src: PROC.consorcio, t: 95, b: "BCP", rel: 0.97, punct: 0.95, ot: 0.1 },
    { n: "Fredy Nolberto Apaza Chino", d: "44561209", p: "Vigía de Obra", src: PROC.local, t: 80, b: null, rel: 0.89, punct: 0.7, ot: 0.08 },
    { n: "Sandra Verónica Llanos Bautista", d: "47712384", p: "Topógrafa", src: PROC.indep, t: 150, b: "Interbank", rel: 0.96, punct: 0.94, ot: 0.2, startWeeksAgo: 3 },
    { n: "Percy Ronald Ñaupa Sulca", d: "41903772", p: "Peón", src: PROC.sindicato, t: 82, b: null, rel: 0.82, punct: 0.65, ot: 0.1, endWeeksAgo: 2 },
  ];

  const ROSTER_2 = [
    { n: "Alfredo Benito Chuquillanqui Rojas", d: "40218756", p: "Maestro de Obra", src: PROC.consorcio, t: 175, b: "BCP", rel: 0.98, punct: 0.96, ot: 0.3 },
    { n: "Julia Patricia Guerrero Mendoza", d: "47890124", p: "Prevencionista SSOMA", src: PROC.consorcio, t: 160, b: "Interbank", rel: 0.97, punct: 0.97, ot: 0.12 },
    { n: "Pedro Miguel Ávila Castro", d: "47123456", p: "Operador de Mixer", src: PROC.consorcio, t: 145, b: "BCP", rel: 0.95, punct: 0.88, ot: 0.42 },
    { n: "Rosa Isabel Chávez Lozano", d: "45678902", p: "Operario Pintor", src: PROC.sindicato, t: 118, b: "Scotiabank", rel: 0.93, punct: 0.84, ot: 0.2 },
    { n: "Nicanor Teodoro Ríos Casaverde", d: "42667180", p: "Operario Albañil", src: PROC.sindicato, t: 128, b: null, rel: 0.91, punct: 0.79, ot: 0.33 },
    { n: "Fernando David Ríos Salazar", d: "44567890", p: "Oficial Electricista", src: PROC.indep, t: 100, b: null, rel: 0.9, punct: 0.81, ot: 0.24 },
    { n: "Yesenia Milagros Cárdenas Pinto", d: "46781203", p: "Almacenera", src: PROC.muni, t: 92, b: "BanBif", rel: 0.96, punct: 0.93, ot: 0.08 },
    { n: "Wilfredo Justo Ayala Huanca", d: "43128907", p: "Peón", src: PROC.local, t: 80, b: null, rel: 0.86, punct: 0.68, ot: 0.1 },
    { n: "Marco Antonio Ibarra Sánchez", d: "45019233", p: "Oficial Carpintero Encofrador", src: PROC.sindicato, t: 104, b: null, rel: 0.92, punct: 0.82, ot: 0.26 },
    { n: "Delia Fortunata Quispe Aroni", d: "48221076", p: "Peón", src: PROC.local, t: 80, b: null, rel: 0.87, punct: 0.74, ot: 0.09 },
    { n: "Héctor Raúl Zegarra Montoya", d: "41556742", p: "Vigía de Obra", src: PROC.muni, t: 85, b: "BanBif", rel: 0.94, punct: 0.9, ot: 0.06, startWeeksAgo: 4 },
  ];

  const ROSTER_3 = [
    { n: "Segundo Eleodoro Vásquez Chávez", d: "40773915", p: "Maestro de Obra", src: PROC.consorcio, t: 172, b: "BBVA", rel: 0.97, punct: 0.95, ot: 0.28 },
    { n: "Milagros Beatriz Salcedo Rivas", d: "46902184", p: "Prevencionista SSOMA", src: PROC.consorcio, t: 158, b: "BCP", rel: 0.98, punct: 0.96, ot: 0.14 },
    { n: "Ricardo Eusebio Tapia Condori", d: "42880361", p: "Operario Fierrero", src: PROC.sindicato, t: 126, b: null, rel: 0.92, punct: 0.83, ot: 0.31 },
    { n: "Nancy Rocío Espinoza Valdez", d: "45330728", p: "Operario Albañil", src: PROC.sindicato, t: 128, b: "Scotiabank", rel: 0.94, punct: 0.87, ot: 0.27 },
    { n: "Édgar Wilfredo Ramos Pacheco", d: "43671542", p: "Oficial Gasfitero", src: PROC.indep, t: 98, b: null, rel: 0.89, punct: 0.76, ot: 0.19 },
    { n: "Lucía Esperanza Bravo Núñez", d: "47455610", p: "Almacenera", src: PROC.muni, t: 90, b: "Interbank", rel: 0.96, punct: 0.94, ot: 0.07 },
    { n: "Máximo Godofredo Aliaga Peña", d: "41029488", p: "Peón", src: PROC.local, t: 78, b: null, rel: 0.85, punct: 0.67, ot: 0.11 },
    { n: "Diana Carolina Muñoz Estrada", d: "48104437", p: "Peón", src: PROC.local, t: 78, b: null, rel: 0.88, punct: 0.73, ot: 0.1 },
    { n: "Jean Pierre Castillo Arroyo", d: "46557301", p: "Operario Soldador", src: PROC.sindicato, t: 134, b: "BBVA", rel: 0.93, punct: 0.86, ot: 0.4 },
  ];

  const SEDES = [
    {
      name: 'Losa Deportiva "La Bombonera"',
      address: "Av. Los Próceres 1450 — San Juan de Lurigancho, Lima",
      roster: ROSTER_1,
      seed: 20260921,
    },
    {
      name: 'Losa Deportiva "Santa Rosa"',
      address: "Jr. Las Gardenias 320, Urb. El Retablo — Comas, Lima",
      roster: ROSTER_2,
      seed: 77310254,
    },
    {
      name: 'Losa Deportiva "Villa El Sol"',
      address: "Av. Micaela Bastidas 880 — Ate Vitarte, Lima",
      roster: ROSTER_3,
      seed: 51884920,
    },
  ];

  // --- Generación -----------------------------------------------------------

  const STANDARD_ENTRY_MIN = 8 * 60;
  const TOLERANCE_MIN = 15;

  // Réplica de la validación de planilla de la app, para poder pre-resolver
  // las incidencias de semanas anteriores.
  const hasIssues = (rec, dateStr) => {
    if (!rec || !rec.checkIn || !rec.checkOut) return false;

    const isSat = new Date(dateStr + "T00:00:00").getDay() === 6;
    const expected = isSat ? 5 : 9;

    const [hIn, mIn] = rec.checkIn.split(":").map(Number);
    const [hOut, mOut] = rec.checkOut.split(":").map(Number);
    const inMin = hIn * 60 + mIn;
    const outMin = hOut * 60 + mOut;

    if (inMin > STANDARD_ENTRY_MIN + TOLERANCE_MIN) return true;
    if (outMin - inMin < expected * 60 - 10) return true;
    return false;
  };

  const isActiveOn = (emp, dateStr) => {
    let state = false;
    for (const ev of emp.statusEvents) {
      if (ev.date <= dateStr) state = !!ev.active;
      else break;
    }
    return state;
  };

  const buildEmployees = (roster, today) =>
    roster.map((r) => {
      const statusEvents = [];

      if (r.startWeeksAgo != null) {
        statusEvents.push({ date: "0001-01-01", active: false });
        statusEvents.push({
          date: mondayWeeksAgo(today, r.startWeeksAgo),
          active: true,
        });
      } else {
        statusEvents.push({ date: "0001-01-01", active: true });
      }

      if (r.endWeeksAgo != null) {
        statusEvents.push({
          date: mondayWeeksAgo(today, r.endWeeksAgo),
          active: false,
        });
      }

      return {
        name: r.n,
        dni: r.d,
        position: r.p,
        procedencia: r.src,
        tarifaDiaria: r.t,
        modalidadPago: r.b ? "Depósito en cuenta" : "Efectivo",
        banco: r.b || "",
        numeroCuenta: r.b ? accountFor(r.b, r.d) : "",
        cci: r.b ? cciFor(r.b, r.d) : "",
        statusEvents,
      };
    });

  const buildAttendance = (employees, roster, dates, rnd) => {
    const byName = {};
    roster.forEach((r) => {
      byName[r.n] = r;
    });

    const attendance = {};

    dates.forEach((dateStr) => {
      const isSat = new Date(dateStr + "T00:00:00").getDay() === 6;
      const records = [];

      employees.forEach((emp) => {
        if (!isActiveOn(emp, dateStr)) return;
        const perfil = byName[emp.name];

        // ¿Asistió?
        if (rnd() > perfil.rel) {
          if (rnd() < 0.55) {
            records.push({
              name: emp.name,
              checkIn: "",
              checkOut: "",
              observation: pick(AUSENCIAS, rnd),
              observationOnly: true,
            });
          }
          return;
        }

        // Hora de entrada
        let inMin = STANDARD_ENTRY_MIN;
        if (rnd() > perfil.punct) {
          inMin += 18 + Math.floor(rnd() * 35); // 08:18 – 08:52 => tardanza
        } else {
          inMin += Math.floor(rnd() * 13) - 6; // 07:54 – 08:06
        }

        // Hora de salida. La app descuenta el almuerzo 12:00–13:00 de lunes a
        // viernes; el sábado es media jornada de 5 h sin descuento.
        let outMin;
        if (isSat) {
          outMin = 13 * 60 + Math.floor(rnd() * 8);
          if (rnd() < 0.18) outMin = 13 * 60 + 30 + Math.floor(rnd() * 25);
        } else {
          outMin = 18 * 60 + Math.floor(rnd() * 8);
          if (rnd() < perfil.ot) {
            outMin = 18 * 60 + 40 + Math.floor(rnd() * 80); // 18:40 – 19:59
          } else if (rnd() < 0.06) {
            outMin = 16 * 60 + 30 + Math.floor(rnd() * 30); // salida temprana
          }
        }

        const rec = {
          name: emp.name,
          checkIn: hhmm(inMin),
          checkOut: hhmm(outMin),
          observation: "",
        };

        if (rnd() < 0.07) rec.observation = pick(OBSERVACIONES, rnd);

        records.push(rec);
      });

      attendance[dateStr] = records;
    });

    return attendance;
  };

  const buildDailyTopics = (dates, rnd, offset) => {
    const topics = {};
    dates.forEach((dateStr, i) => {
      const isSat = new Date(dateStr + "T00:00:00").getDay() === 6;
      topics[dateStr] = {
        topic: CHARLAS[(i + offset) % CHARLAS.length],
        duration: isSat ? 5 : pick([5, 10, 10, 15], rnd),
      };
    });
    return topics;
  };

  const buildWeeklyNotes = (dates, offset) => {
    const notes = {};
    const weeks = [];

    dates.forEach((d) => {
      const wk = isoWeekKey(d);
      if (!weeks.includes(wk)) weeks.push(wk);
    });

    weeks.forEach((wk, i) => {
      notes[wk] = NOTAS_SEMANA[(i + offset) % NOTAS_SEMANA.length];
    });

    return notes;
  };

  const buildWeeklyLog = (roster, employees, today) => {
    const log = {};

    const push = (dateStr, event, emp) => {
      const wk = isoWeekKey(dateStr);
      if (!log[wk]) log[wk] = [];
      log[wk].push({
        date: dateStr,
        event,
        name: emp.name,
        dni: emp.dni,
        position: emp.position,
      });
    };

    roster.forEach((r, i) => {
      const emp = employees[i];
      if (r.startWeeksAgo != null) {
        push(mondayWeeksAgo(today, r.startWeeksAgo), "Nuevo personal", emp);
      }
      if (r.endWeeksAgo != null) {
        push(mondayWeeksAgo(today, r.endWeeksAgo), "Baja", emp);
      }
    });

    return log;
  };

  // Las incidencias de semanas pasadas ya vienen revisadas (justificadas o con
  // descuento); las de la semana en curso quedan pendientes para que se vea el
  // flujo de revisión de planilla.
  const buildPayrollReviews = (employees, attendance, dates, rnd, today) => {
    const currentMonday = mondayWeeksAgo(today, 0);
    const reviews = {};

    const tarifaByName = {};
    employees.forEach((e) => {
      tarifaByName[e.name] = e.tarifaDiaria || 0;
    });

    const NOTAS_OK = [
      "Justificado por el residente de obra.",
      "Tardanza por bloqueo vial, verificada con el vigía.",
      "Permiso autorizado previamente por SSOMA.",
      "Compensó las horas el mismo día.",
    ];

    dates.forEach((dateStr) => {
      if (dateStr >= currentMonday) return; // semana en curso => pendiente

      (attendance[dateStr] || []).forEach((rec) => {
        if (!hasIssues(rec, dateStr)) return;

        const key = `${dateStr}_${rec.name}`;

        if (rnd() < 0.65) {
          reviews[key] = {
            status: "approved",
            amount: 0,
            note: pick(NOTAS_OK, rnd),
          };
        } else {
          const tarifa = tarifaByName[rec.name] || 100;
          reviews[key] = {
            status: "discounted",
            amount: Math.round(tarifa * pick([0.125, 0.25, 0.5], rnd)),
            note: "Descuento aplicado por incidencia no justificada.",
          };
        }
      });
    });

    return reviews;
  };

  const build = () => {
    const today = startOfToday();
    const dates = buildWorkDates(today);

    const appData = {
      locations: SEDES.map((s) => s.name),
      currentLocationIndex: 0,
      data: {},
      locationDetails: {},
      disabledLocations: [],
    };

    SEDES.forEach((sede, idx) => {
      const rnd = makeRandom(sede.seed);
      const employees = buildEmployees(sede.roster, today);
      const attendance = buildAttendance(employees, sede.roster, dates, rnd);

      appData.data[sede.name] = {
        employees,
        attendance,
        weeklyHoursConfig: { 0: 0, 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 5 },
        dailyTopics: buildDailyTopics(dates, rnd, idx * 5),
        weeklyNotes: buildWeeklyNotes(dates, idx * 2),
        weeklyNotesLog: buildWeeklyLog(sede.roster, employees, today),
        payrollReviews: buildPayrollReviews(
          employees,
          attendance,
          dates,
          rnd,
          today
        ),
      };

      appData.locationDetails[sede.name] = { address: sede.address };
    });

    return appData;
  };

  // --- Modo demo ------------------------------------------------------------

  const readParam = () => {
    try {
      return (
        new URLSearchParams(window.location.search).get("demo") || ""
      ).toLowerCase();
    } catch {
      return "";
    }
  };

  const lsGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };

  const lsSet = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };

  const lsDel = (k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  };

  const isDemoHost = () =>
    DEMO_HOST_PATTERNS.some((re) => re.test(window.location.hostname));

  /**
   * Decide con qué arrancar cuando no hay datos guardados.
   * "demo"  -> sembrar datos de muestra en silencio
   * "empty" -> arrancar vacío sin preguntar
   * "ask"   -> comportamiento original (preguntar al usuario)
   */
  const decideInitialData = () => {
    const param = readParam();

    if (param === "0" || param === "off" || param === "no") return "empty";
    if (param === "1" || param === "on" || param === "reset") return "demo";

    if (lsGet(LS_OPTOUT_KEY) === "1") return "empty";
    if (isDemoHost()) return "demo";

    return "ask";
  };

  /** ¿Re-sembrar aunque ya existan datos? (versión nueva o ?demo=reset) */
  const needsReseed = () => {
    if (readParam() === "reset") return true;
    if (lsGet(LS_OPTOUT_KEY) === "1") return false;
    if (!isDemoHost()) return false;

    const seeded = lsGet(LS_SEED_KEY);
    return !!seeded && seeded !== DEMO_SEED_VERSION;
  };

  const markSeeded = () => {
    lsSet(LS_SEED_KEY, DEMO_SEED_VERSION);
    lsDel(LS_OPTOUT_KEY);
  };

  const isDemoActive = () => lsGet(LS_SEED_KEY) === DEMO_SEED_VERSION;

  const wipeAndReload = async (optOut) => {
    try {
      window.appData = null;
      if (window.storage && typeof window.storage.clear === "function") {
        await window.storage.clear();
      }
    } catch (e) {
      console.warn("No se pudo limpiar el almacenamiento:", e);
    }

    lsDel(LS_SEED_KEY);
    if (optOut) lsSet(LS_OPTOUT_KEY, "1");
    else lsDel(LS_OPTOUT_KEY);

    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    window.location.replace(url.toString());
  };

  // --- Distintivo flotante --------------------------------------------------

  const mountBanner = () => {
    if (!isDemoActive()) return;
    if (document.getElementById("demo-mode-badge")) return;

    const box = document.createElement("div");
    box.id = "demo-mode-badge";
    box.setAttribute("role", "status");
    box.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:9999",
      "max-width:min(92vw,330px)",
      "padding:12px 14px",
      "border-radius:14px",
      "border:1px solid rgba(251,191,36,.35)",
      "background:rgba(15,23,42,.94)",
      "backdrop-filter:blur(8px)",
      "box-shadow:0 12px 30px rgba(0,0,0,.45)",
      "font-family:system-ui,-apple-system,'Segoe UI',sans-serif",
      "color:#e2e8f0",
      "font-size:12px",
      "line-height:1.45",
    ].join(";");

    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
      '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fbbf24;box-shadow:0 0 8px #fbbf24"></span>' +
      '<strong style="color:#fbbf24;letter-spacing:.04em;font-size:11px">MODO DEMOSTRACIÓN</strong>' +
      '<button type="button" id="demo-badge-close" aria-label="Ocultar aviso" ' +
      'style="margin-left:auto;background:none;border:0;color:#64748b;cursor:pointer;font-size:16px;line-height:1;padding:0 2px">&times;</button>' +
      "</div>" +
      '<p style="margin:0 0 10px;color:#94a3b8">Estás viendo <strong style="color:#cbd5e1">datos ficticios</strong>: 3 sedes, ~7 semanas de asistencia, charlas SSOMA y planilla semanal. Todo se guarda solo en tu navegador, así que puedes editar lo que quieras.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" id="demo-badge-reset" style="flex:1 1 auto;padding:7px 10px;border-radius:9px;border:1px solid rgba(34,211,238,.4);background:rgba(34,211,238,.12);color:#67e8f9;font-size:11.5px;font-weight:600;cursor:pointer">Reiniciar demo</button>' +
      '<button type="button" id="demo-badge-empty" style="flex:1 1 auto;padding:7px 10px;border-radius:9px;border:1px solid rgba(148,163,184,.35);background:rgba(148,163,184,.1);color:#cbd5e1;font-size:11.5px;font-weight:600;cursor:pointer">Empezar vacío</button>' +
      "</div>";

    document.body.appendChild(box);

    box.querySelector("#demo-badge-close").addEventListener("click", () => {
      box.remove();
    });

    box.querySelector("#demo-badge-reset").addEventListener("click", () => {
      const ok = confirm(
        "Se restaurarán los datos de muestra originales.\n\n" +
          "Se perderán los cambios que hayas hecho en esta demo. ¿Continuar?"
      );
      if (ok) wipeAndReload(false);
    });

    box.querySelector("#demo-badge-empty").addEventListener("click", () => {
      const ok = confirm(
        "Se borrarán los datos de muestra y el sistema arrancará vacío.\n\n¿Continuar?"
      );
      if (ok) wipeAndReload(true);
    });
  };

  window.DemoData = {
    VERSION: DEMO_SEED_VERSION,
    build,
    decideInitialData,
    needsReseed,
    markSeeded,
    isDemoActive,
    mountBanner,
  };
})();
