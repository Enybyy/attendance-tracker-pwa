import { today, dayOfWeek, weekDates, clockMinutes, validTime, timeFromMinutes, roundMoney } from './dates.js';

export const DEFAULT_HOURS = { 0: 0, 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 5 };
export const DEFAULT_SCHEDULE = { start: '08:00', tolerance: 15, lunchStart: '12:00', lunchEnd: '13:00', lunchDays: [1, 2, 3, 4, 5] };
export const expectedMinutes = (location, date) => Math.round(Number(location.weeklyHoursConfig[dayOfWeek(date)] ?? 0) * 60);
export function activeOn(employee, date) {
  let active = false;
  for (const event of employee.statusEvents) {
    if (event.date > date) break;
    active = event.active;
  }
  return active;
}
export function setActive(employee, date, active) {
  employee.statusEvents = employee.statusEvents.filter((event) => event.date !== date);
  employee.statusEvents.push({ date, active });
  employee.statusEvents.sort((a, b) => a.date.localeCompare(b.date));
}
export function calculateHours(checkIn, checkOut, date, location) {
  if (!validTime(checkIn) || !validTime(checkOut)) return { minutes: 0, overtime: 0, lunch: 0, overnight: false, complete: false };
  const start = clockMinutes(checkIn);
  let end = clockMinutes(checkOut);
  const overnight = end < start;
  if (overnight) end += 1440;
  const schedule = location.schedule || DEFAULT_SCHEDULE;
  const lunch = !overnight && schedule.lunchDays.includes(dayOfWeek(date))
    ? Math.max(0, Math.min(end, clockMinutes(schedule.lunchEnd)) - Math.max(start, clockMinutes(schedule.lunchStart))) : 0;
  const minutes = Math.max(0, end - start - lunch);
  return { minutes, overtime: Math.max(0, minutes - expectedMinutes(location, date)), lunch, overnight, complete: end > start };
}
export function defaultCheckOut(location, date, checkIn = location.schedule.start) {
  const start = clockMinutes(checkIn);
  if (start === null) return '';
  const expected = expectedMinutes(location, date);
  if (!expected) return '';
  // Find the shortest shift that reaches the configured net minutes.
  for (let duration = expected; duration < 1440; duration++) {
    const end = timeFromMinutes(start + duration);
    if (calculateHours(checkIn, end, date, location).minutes >= expected) return end;
  }
  return '';
}
export const reviewKey = (date, id) => `${date}_${id}`;
export const recordFor = (location, date, id) => (location.attendance[date] || []).find((record) => record.employeeId === id);
export function dailyRows(location, date, referenceToday = today()) {
  return location.employees.filter((employee) => activeOn(employee, date) || recordFor(location, date, employee.id)).map((employee) => {
    const record = recordFor(location, date, employee.id);
    const hours = calculateHours(record?.checkIn, record?.checkOut, date, location);
    let status = 'pending';
    if (record?.type === 'absence') status = 'absent';
    else if (hours.complete) status = 'present';
    else if (record?.checkIn || record?.checkOut) status = 'progress';
    else if (!expectedMinutes(location, date)) status = 'rest';
    else if (date < referenceToday) status = 'absent';
    const row = { employee, record, date, status, ...hours };
    row.issues = issuesFor(row, location);
    row.review = location.payrollReviews[reviewKey(date, employee.id)] || { status: 'pending', amount: 0, note: '' };
    return row;
  });
}
export function issuesFor(row, location) {
  if (row.status === 'absent') return ['Ausencia'];
  if (row.status === 'progress') return ['Marcación incompleta'];
  if (row.status !== 'present') return [];
  const issues = [];
  const expected = expectedMinutes(location, row.date);
  const schedule = location.schedule || DEFAULT_SCHEDULE;
  if (expected && !row.overnight && clockMinutes(row.record.checkIn) > clockMinutes(schedule.start) + schedule.tolerance) issues.push('Tardanza');
  if (expected && row.minutes < expected - 10) issues.push('Jornada incompleta');
  return issues;
}
export function suggestedDiscount(row, location) {
  if (row.status !== 'present') return 0;
  const expected = expectedMinutes(location, row.date);
  if (!expected) return 0;
  const missing = Math.max(0, expected - row.minutes);
  const late = Math.max(0, clockMinutes(row.record.checkIn) - clockMinutes(location.schedule.start) - location.schedule.tolerance);
  const rate = row.record.dailyRate ?? row.employee.tarifaDiaria;
  return roundMoney(Math.min(rate, rate * Math.max(missing, late) / expected));
}
export function daySummary(rows) {
  return rows.reduce((result, row) => {
    result[row.status]++;
    result.minutes += row.minutes;
    result.overtime += row.overtime;
    result.incidents += row.issues.length > 0 ? 1 : 0;
    return result;
  }, { present: 0, absent: 0, pending: 0, progress: 0, rest: 0, minutes: 0, overtime: 0, incidents: 0 });
}
export function weeklyReport(location, referenceDate, referenceToday = today()) {
  const dates = weekDates(referenceDate);
  const cutoff = referenceDate < referenceToday ? referenceDate : referenceToday;
  const days = dates.map((date) => ({ date, rows: date <= cutoff ? dailyRows(location, date, referenceToday) : [], summary: daySummary(date <= cutoff ? dailyRows(location, date, referenceToday) : []) }));
  const employees = location.employees.filter((employee) => days.some((day) => day.date <= cutoff && (activeOn(employee, day.date) || recordFor(location, day.date, employee.id))));
  const payroll = employees.map((employee) => {
    let cents = 0, discountCents = 0, daysWorked = 0, paidDays = 0, pending = 0, minutes = 0, overtime = 0;
    const entries = days.map((day) => {
      const row = day.rows.find((item) => item.employee.id === employee.id);
      if (!row) return { date: day.date, mark: '—', rate: 0, discount: 0, net: 0 };
      const hasIssue = row.issues.length > 0;
      if (hasIssue && row.review.status === 'pending') pending++;
      const rate = roundMoney(row.record?.dailyRate ?? row.review.dailyRate ?? employee.tarifaDiaria);
      const payable = row.status === 'present' || (row.status === 'absent' && row.review.status === 'approved');
      const discount = payable && row.status === 'present' && hasIssue && row.review.status === 'discounted'
        ? Math.min(rate, roundMoney(row.review.amount)) : 0;
      if (row.status === 'present') daysWorked++;
      if (payable) paidDays++;
      if (payable) cents += Math.round(rate * 100);
      discountCents += Math.round(discount * 100);
      minutes += row.minutes; overtime += row.overtime;
      const mark = row.status === 'present' ? (hasIssue && row.review.status === 'pending' ? '!' : 'P') :
        row.status === 'absent' ? (row.review.status === 'approved' ? 'J' : 'A') : row.status === 'progress' ? 'E' : '—';
      return { ...row, mark, rate, discount, net: payable ? roundMoney(rate - discount) : 0 };
    });
    return { employee, entries, daysWorked, paidDays, pending, minutes, overtime, gross: cents / 100, discount: discountCents / 100, net: (cents - discountCents) / 100 };
  });
  const totals = payroll.reduce((sum, row) => {
    sum.daysWorked += row.daysWorked; sum.paidDays += row.paidDays;
    sum.gross += Math.round(row.gross * 100); sum.discount += Math.round(row.discount * 100);
    sum.net += Math.round(row.net * 100); sum.pending += row.pending;
    sum[row.employee.modalidadPago === 'Depósito en cuenta' ? 'bank' : 'cash'] += Math.round(row.net * 100);
    return sum;
  }, { daysWorked: 0, paidDays: 0, gross: 0, discount: 0, net: 0, bank: 0, cash: 0, pending: 0 });
  for (const key of ['gross', 'discount', 'net', 'bank', 'cash']) totals[key] /= 100;
  return { dates, cutoff, days, payroll, totals };
}
