import { normalizeAppData } from './data-model.js';
import { calculateHours, defaultCheckOut, weeklyReport, DEFAULT_SCHEDULE, DEFAULT_HOURS } from './domain.js';
import { validDate, validTime, today, roundMoney } from './dates.js';

export { validDate, validTime, today, roundMoney };

// Keep the original name-based UI contract while assigning stable identities
// and validating legacy backups before they replace saved data.
export function normalizeLegacy(raw) {
  const normalized = normalizeAppData(structuredClone(raw));
  for (const site of normalized.locations) {
    const location = normalized.data[site];
    const names = new Set();
    for (const employee of location.employees) {
      if (names.has(employee.name.toLocaleLowerCase('es'))) throw new Error('Hay nombres repetidos en esta sede. Identifica a cada persona con un nombre distinto antes de importar.');
      names.add(employee.name.toLocaleLowerCase('es'));
    }
    const byId = new Map(location.employees.map(employee => [employee.id, employee]));
    for (const records of Object.values(location.attendance)) {
      for (const record of records) {
        record.name = byId.get(record.employeeId).name;
        if (record.type === 'absence') record.observationOnly = true;
      }
    }
    const reviews = {};
    for (const [key, review] of Object.entries(location.payrollReviews)) {
      const employee = byId.get(key.slice(11));
      reviews[key.slice(0, 11) + employee.name] = review;
    }
    location.payrollReviews = reviews;
  }
  // The legacy application writes review keys by name; mark its schema accordingly.
  normalized.schemaVersion = 1;
  return normalized;
}

export function calculationLocation(hours, schedule = DEFAULT_SCHEDULE) {
  return { weeklyHoursConfig: hours || DEFAULT_HOURS, schedule };
}
export function legacyHours(start, end, date, hours, schedule) {
  const result = calculateHours(start, end, date, calculationLocation(hours, schedule));
  return { total: result.minutes / 60, overtime: result.overtime / 60, lunchDeducted: result.lunch > 0, lunchMinutes: result.lunch };
}
export function legacyCheckOut(date, start, hours, schedule) {
  return defaultCheckOut(calculationLocation(hours, schedule), date, start);
}
export function legacyIssues(record, date, hours, schedule = DEFAULT_SCHEDULE) {
  if (!record || !validTime(record.checkIn) || !validTime(record.checkOut) || record.checkIn === record.checkOut) return null;
  const expected = Number(hours?.[new Date(date + 'T12:00:00').getDay()] ?? 9);
  if (!expected) return null;
  const result = legacyHours(record.checkIn, record.checkOut, date, hours, schedule);
  const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const issues = [];
  if (record.checkOut > record.checkIn && minutes(record.checkIn) > minutes(schedule.start) + schedule.tolerance) issues.push('Llegada tarde (' + record.checkIn + ')');
  if (Math.round(result.total * 60) < Math.round(expected * 60) - 10) issues.push('Horas insuficientes (' + result.total.toFixed(1) + 'h)');
  return issues.length ? issues : null;
}
export function legacyPayroll(data, site, date) {
  const location = normalizeAppData(data).data[site];
  // The original review dialog covers worked shifts, not paid absence approvals.
  for (const [key] of Object.entries(location.payrollReviews)) {
    const record = location.attendance[key.slice(0, 10)]?.find(item => item.employeeId === key.slice(11));
    if (!record?.checkIn || !record?.checkOut) delete location.payrollReviews[key];
  }
  return weeklyReport(location, date);
}
