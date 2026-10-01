export const today = () => toYMD(new Date());
export const toYMD = (date) => `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00');
  return Number.isFinite(date.getTime()) && toYMD(date) === value;
}
export function shiftDate(value, days) {
  if (!validDate(value)) throw new Error('Fecha inválida.');
  const date = new Date(value + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return toYMD(date);
}
export const dayOfWeek = (value) => new Date(value + 'T12:00:00').getDay();
export function weekDates(value) {
  const monday = shiftDate(value, -((dayOfWeek(value) + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
}
export function isoWeek(value) {
  const thursday = shiftDate(value, 3 - ((dayOfWeek(value) + 6) % 7));
  const year = Number(thursday.slice(0, 4));
  const jan4 = `${year}-01-04`;
  const firstThursday = shiftDate(jan4, 3 - ((dayOfWeek(jan4) + 6) % 7));
  const week = Math.round((Date.parse(thursday + 'T12:00Z') - Date.parse(firstThursday + 'T12:00Z')) / 604800000) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}
export const dateLabel = (value, options = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(value + 'T12:00:00').toLocaleDateString('es-PE', options);
export const validTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const clockMinutes = (value) => validTime(value) ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : null;
export const timeFromMinutes = (value) => `${String(Math.floor(value / 60) % 24).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const hoursLabel = (minutes = 0) => `${Math.floor(minutes / 60)} h ${String(Math.round(minutes % 60)).padStart(2, '0')}`;
export const money = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
export const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
