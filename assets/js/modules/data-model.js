import { validDate, validTime, roundMoney } from './dates.js';
import { DEFAULT_HOURS, DEFAULT_SCHEDULE } from './domain.js';

export const SCHEMA_VERSION = 2;
const fail = (message) => { throw new Error(message); };
const dictionary = (value, label) => value && typeof value === 'object' && !Array.isArray(value) ? value : fail(`${label}: se esperaba un objeto.`);
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
export function validateLocationName(value) {
  const name = text(value, 80);
  if (name.length < 2 || ['__proto__', 'constructor', 'prototype'].includes(name.toLowerCase())) fail('El nombre de la sede no es válido.');
  return name;
}
export function validateEmployee(fields, employees, excludeId = '') {
  const name = text(fields.name, 100), dni = text(fields.dni, 15), position = text(fields.position, 80);
  if (name.length < 2 || !/^[a-zA-Z0-9-]{6,15}$/.test(dni) || position.length < 2) fail('Completa nombre, documento (6–15 caracteres) y cargo.');
  if (employees.some((employee) => employee.id !== excludeId && employee.dni.toLowerCase() === dni.toLowerCase())) fail('Ese documento ya está registrado en esta sede.');
  const tarifaDiaria = roundMoney(Number(fields.tarifaDiaria || 0));
  if (!Number.isFinite(tarifaDiaria) || tarifaDiaria < 0 || tarifaDiaria > 100000) fail('La tarifa debe estar entre S/ 0 y S/ 100 000.');
  return {
    name, dni, position, tarifaDiaria, procedencia: text(fields.procedencia, 100),
    modalidadPago: fields.modalidadPago === 'Depósito en cuenta' ? 'Depósito en cuenta' : 'Efectivo',
    banco: text(fields.banco, 60), numeroCuenta: text(fields.numeroCuenta, 40), cci: text(fields.cci, 40),
  };
}
export function emptyLocation() {
  return { employees: [], attendance: {}, weeklyHoursConfig: { ...DEFAULT_HOURS }, schedule: { ...DEFAULT_SCHEDULE, lunchDays: [...DEFAULT_SCHEDULE.lunchDays] }, dailyTopics: {}, weeklyNotes: {}, weeklyNotesLog: {}, payrollReviews: {} };
}
export function emptyApp() {
  return { schemaVersion: SCHEMA_VERSION, mode: 'work', locations: ['Sede principal'], currentLocationIndex: 0, disabledLocations: [], locationDetails: { 'Sede principal': { address: '' } }, data: { 'Sede principal': emptyLocation() } };
}
export function validateSchedule(hours, schedule) {
  const config = {};
  for (let day = 0; day < 7; day++) {
    const amount = Number(hours[day] ?? DEFAULT_HOURS[day]);
    if (!Number.isFinite(amount) || amount < 0 || amount > 16 || amount * 60 % 1) fail('Las jornadas deben estar entre 0 y 16 horas, en minutos completos.');
    config[day] = amount;
  }
  if (!validTime(schedule.start) || !validTime(schedule.lunchStart) || !validTime(schedule.lunchEnd) || schedule.lunchEnd <= schedule.lunchStart) fail('Revisa los horarios de entrada y pausa.');
  const tolerance = Number(schedule.tolerance);
  if (!Number.isInteger(tolerance) || tolerance < 0 || tolerance > 120) fail('La tolerancia debe estar entre 0 y 120 minutos.');
  const lunchDays = schedule.lunchDays;
  if (!Array.isArray(lunchDays) || lunchDays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) fail('Los días de pausa no son válidos.');
  return { weeklyHoursConfig: config, schedule: { start: schedule.start, tolerance, lunchStart: schedule.lunchStart, lunchEnd: schedule.lunchEnd, lunchDays: [...new Set(lunchDays)] } };
}
export function normalizeAppData(raw) {
  dictionary(raw, 'Respaldo');
  if (raw.schemaVersion > SCHEMA_VERSION) fail('Este respaldo usa una versión más reciente de la aplicación.');
  // Earlier single-site backups are imported once, rather than duplicated across sites.
  if (!raw.locations && (raw.employees || raw.attendance)) {
    raw = { locations: ['Sede importada'], data: { 'Sede importada': raw }, locationDetails: {}, mode: 'work' };
  }
  if (!Array.isArray(raw.locations) || !raw.locations.length || raw.locations.length > 100) fail('El respaldo debe contener entre 1 y 100 sedes.');
  dictionary(raw.data, 'Datos de sedes');
  if (raw.disabledLocations !== undefined && !Array.isArray(raw.disabledLocations)) fail('Lista de sedes archivadas inválida.');
  if (raw.demoDate && !validDate(raw.demoDate)) fail('Fecha de demostración inválida.');
  const result = { schemaVersion: SCHEMA_VERSION, mode: raw.mode === 'demo' ? 'demo' : 'work', demoDate: raw.demoDate || null, locations: [], currentLocationIndex: 0, disabledLocations: [], locationDetails: {}, data: {} };
  const names = new Set();
  raw.locations.forEach((rawName, siteIndex) => {
    const name = validateLocationName(rawName);
    if (names.has(name.toLowerCase())) fail('Hay sedes duplicadas en el respaldo.');
    names.add(name.toLowerCase()); result.locations.push(name);
    const source = dictionary(raw.data[rawName], `Sede ${name}`);
    const target = emptyLocation();
    const schedule = { ...DEFAULT_SCHEDULE, ...(source.schedule || {}) };
    Object.assign(target, validateSchedule(source.weeklyHoursConfig || DEFAULT_HOURS, schedule));
    if (source.employees === undefined && raw.schemaVersion !== SCHEMA_VERSION) source.employees = [];
    if (!Array.isArray(source.employees) || source.employees.length > 10000) fail(`${name}: lista de personal inválida.`);
    const ids = new Set(), documents = new Set();
    target.employees = source.employees.map((employee, index) => {
      dictionary(employee, 'Empleado');
      const id = text(employee.id || `legacy-${siteIndex}-${index}`, 100);
      if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) fail('Identificador de empleado inválido o duplicado.');
      ids.add(id);
      const fields = validateEmployee({ ...employee, position: employee.position || 'Sin cargo' }, [], id);
      if (documents.has(fields.dni.toLowerCase())) fail('Hay documentos de identidad duplicados.');
      documents.add(fields.dni.toLowerCase());
      let events = employee.statusEvents || employee.statusHistory;
      if (!Array.isArray(events) || !events.length) events = [{ date: employee.addedDate || '0001-01-01', active: true }, ...(employee.removedDate ? [{ date: employee.removedDate, active: false }] : [])];
      const dedup = new Map();
      for (const event of events) {
        if (!validDate(event.date) || typeof event.active !== 'boolean') fail('Historial de altas y bajas inválido.');
        dedup.set(event.date, { date: event.date, active: event.active });
      }
      return { ...fields, id, statusEvents: [...dedup.values()].sort((a, b) => a.date.localeCompare(b.date)) };
    });
    for (const [date, records] of Object.entries(dictionary(source.attendance || {}, 'Asistencias'))) {
      if (!validDate(date) || !Array.isArray(records)) fail('Fecha o lista de asistencia inválida.');
      const merged = new Map();
      for (const record of records) {
        dictionary(record, 'Registro de asistencia');
        let employee = record.employeeId ? target.employees.find((item) => item.id === record.employeeId) : null;
        if (!employee) {
          const matches = target.employees.filter((item) => item.name === record.name);
          if (matches.length > 1) fail('Hay registros antiguos con nombres ambiguos. Identifica a la persona antes de importar.');
          employee = matches[0];
        }
        if (!employee) {
          if (!text(record.name)) fail('El registro no identifica a un empleado.');
          employee = { id: `legacy-orphan-${siteIndex}-${target.employees.length}`, name: text(record.name, 100), dni: `ARCH-${target.employees.length}`.padEnd(6, '0'), position: 'Personal archivado', tarifaDiaria: 0, procedencia: '', modalidadPago: 'Efectivo', banco: '', numeroCuenta: '', cci: '', statusEvents: [{ date: '0001-01-01', active: false }] };
          target.employees.push(employee);
        }
        const checkIn = text(record.checkIn, 5), checkOut = text(record.checkOut, 5);
        if ((checkIn && !validTime(checkIn)) || (checkOut && !validTime(checkOut)) || (checkIn && checkIn === checkOut)) fail(`Horario inválido en ${date} para ${employee.name}.`);
        const dailyRate = roundMoney(Number(record.dailyRate ?? employee.tarifaDiaria));
        if (!Number.isFinite(dailyRate) || dailyRate < 0 || dailyRate > 100000) fail('Tarifa de registro inválida.');
        const normalized = { employeeId: employee.id, type: record.type === 'absence' || (!checkIn && !checkOut) ? 'absence' : 'attendance', checkIn, checkOut, observation: text(record.observation, 500), dailyRate };
        if (normalized.type === 'absence' && (checkIn || checkOut)) fail('Una ausencia no puede contener horas de asistencia.');
        const previous = merged.get(employee.id);
        if (previous) {
          if (raw.schemaVersion === SCHEMA_VERSION) fail('Hay dos registros para la misma persona y fecha.');
          const preferred = checkIn && checkOut ? normalized : previous;
          preferred.observation = [...new Set([previous.observation, normalized.observation].filter(Boolean))].join(' / ');
          merged.set(employee.id, preferred);
        } else merged.set(employee.id, normalized);
      }
      target.attendance[date] = [...merged.values()];
    }
    for (const [date, entry] of Object.entries(dictionary(source.dailyTopics || {}, 'Charlas'))) {
      if (!validDate(date)) fail('Fecha de charla inválida.');
      const duration = Number(typeof entry === 'object' ? entry?.duration || 0 : 0);
      if (!Number.isFinite(duration) || duration < 0 || duration > 480) fail('Duración de charla inválida.');
      target.dailyTopics[date] = { topic: text(typeof entry === 'string' ? entry : entry?.topic, 300), duration };
    }
    for (const [week, note] of Object.entries(dictionary(source.weeklyNotes || {}, 'Notas semanales'))) {
      if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(week)) fail('Semana de notas inválida.');
      target.weeklyNotes[week] = text(note, 5000);
    }
    for (const [week, entries] of Object.entries(dictionary(source.weeklyNotesLog || {}, 'Movimientos'))) {
      if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(week)) fail('Semana de movimientos inválida.');
      if (!Array.isArray(entries)) fail('Lista de movimientos inválida.');
      target.weeklyNotesLog[week] = entries.map((entry) => {
        if (!validDate(entry.date)) fail('Fecha de movimiento inválida.');
        return { date: entry.date, event: text(entry.event || entry.type, 80), name: text(entry.name, 100), dni: text(entry.dni, 15), position: text(entry.position, 80) };
      });
    }
    for (const [key, review] of Object.entries(dictionary(source.payrollReviews || {}, 'Revisiones'))) {
      const date = key.slice(0, 10), identity = key.slice(11);
      if (!validDate(date) || key[10] !== '_') fail('Fecha de revisión inválida.');
      const employee = target.employees.find((item) => item.id === identity) || target.employees.find((item) => item.name === identity);
      if (!employee) continue;
      if (!['approved', 'discounted', 'pending'].includes(review.status)) fail('Estado de revisión inválido.');
      const amount = roundMoney(Number(review.amount || 0));
      if (!Number.isFinite(amount) || amount < 0 || amount > 100000) fail('Descuento inválido.');
      const dailyRate = roundMoney(Number(review.dailyRate ?? employee.tarifaDiaria));
      if (!Number.isFinite(dailyRate) || dailyRate < 0 || dailyRate > 100000) fail('Tarifa de revisión inválida.');
      target.payrollReviews[`${date}_${employee.id}`] = { status: review.status, amount: review.status === 'discounted' ? amount : 0, note: text(review.note, 500), dailyRate };
    }
    result.data[name] = target;
    result.locationDetails[name] = { address: text(raw.locationDetails?.[rawName]?.address, 200) };
    if ((raw.disabledLocations || []).includes(rawName)) result.disabledLocations.push(name);
  });
  if (result.disabledLocations.length === result.locations.length) fail('Debe haber al menos una sede habilitada.');
  const requested = result.locations[Number(raw.currentLocationIndex) || 0];
  result.currentLocationIndex = result.locations.indexOf(requested && !result.disabledLocations.includes(requested) ? requested : result.locations.find((name) => !result.disabledLocations.includes(name)));
  return result;
}
