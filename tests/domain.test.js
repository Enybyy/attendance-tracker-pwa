import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyApp, emptyLocation, normalizeAppData, validateEmployee, validateSchedule } from '../assets/js/modules/data-model.js';
import { calculateHours, defaultCheckOut, dailyRows, weeklyReport, setActive, activeOn, suggestedDiscount, daySummary } from '../assets/js/modules/domain.js';
import { isoWeek, validDate, validTime, weekDates } from '../assets/js/modules/dates.js';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { normalizeLegacy, legacyPayroll, legacyHours, legacyIssues } from '../assets/js/modules/legacy-logic.js';

const date = '2026-09-30';
function fixture() {
  const app = emptyApp(), location = app.data['Sede principal'];
  location.employees.push({ id: 'person-1', name: 'Persona de prueba', dni: '00000001', position: 'Operario', tarifaDiaria: 100, procedencia: '', modalidadPago: 'Efectivo', banco: '', numeroCuenta: '', cci: '', statusEvents: [{ date: '2026-09-28', active: true }] });
  return { app, location, employee: location.employees[0] };
}
test('validates actual calendar dates, leap years and clock ranges', () => {
  assert.equal(validDate('2026-02-30'), false); assert.equal(validDate('2024-02-29'), true); assert.equal(validDate('0001-01-01'), true);
  for (const value of ['24:00', '08:60', '99:99', '8:00']) assert.equal(validTime(value), false);
  assert.equal(validTime('23:59'), true);
});
test('ISO week handles year boundaries', () => {
  assert.equal(isoWeek('2021-01-01'), '2020-W53'); assert.equal(isoWeek('2025-12-29'), '2026-W01');
  assert.deepEqual(weekDates('2026-09-30'), ['2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-03','2026-10-04']);
});
for (const [start, end, day, minutes, lunch, overtime] of [
  ['08:00','18:00',date,540,60,0], ['08:00','13:00','2026-10-03',300,0,0],
  ['12:30','18:00',date,300,30,0], ['08:00','12:30',date,240,30,0],
  ['22:00','06:00',date,480,0,0], ['13:00','20:00',date,420,0,0],
  ['08:00','19:00',date,600,60,60], ['08:00','10:00','2026-10-04',120,0,120],
]) test(`hours: ${start}–${end} on ${day}`, () => {
  const result = calculateHours(start, end, day, emptyLocation());
  assert.equal(result.minutes, minutes); assert.equal(result.lunch, lunch); assert.equal(result.overtime, overtime);
});
test('incomplete and equal-time records have no payable hours', () => {
  for (const [start,end] of [['08:00',''],['08:00','08:00'],['99:00','18:00']]) assert.equal(calculateHours(start,end,date,emptyLocation()).complete, false);
});
test('default exit accounts for the actual lunch overlap and overnight work', () => {
  const loc = emptyLocation();
  assert.equal(defaultCheckOut(loc,date,'08:00'),'18:00');
  assert.equal(defaultCheckOut(loc,date,'13:00'),'22:00');
  assert.equal(defaultCheckOut(loc,date,'22:00'),'07:00');
  assert.equal(defaultCheckOut(loc,'2026-10-03','08:00'),'13:00');
});
test('custom expected hours and break days are shared by all calculations', () => {
  const loc = emptyLocation(); loc.weeklyHoursConfig[3]=7; loc.schedule.lunchDays=[];
  assert.equal(calculateHours('08:00','16:00',date,loc).overtime,60);
});
test('effective hires and terminations preserve past activity', () => {
  const { employee } = fixture();
  setActive(employee,date,false); setActive(employee,'2026-10-02',true);
  assert.equal(activeOn(employee,'2026-09-27'),false); assert.equal(activeOn(employee,'2026-09-29'),true);
  assert.equal(activeOn(employee,date),false); assert.equal(activeOn(employee,'2026-10-02'),true);
});
test('absence observations and open shifts do not count as completed attendance', () => {
  const {location}=fixture();
  location.attendance[date]=[{employeeId:'person-1',type:'absence',checkIn:'',checkOut:'',observation:'Permiso',dailyRate:100}];
  assert.equal(daySummary(dailyRows(location,date,date)).present,0);
  location.attendance[date][0]={employeeId:'person-1',type:'attendance',checkIn:'08:00',checkOut:'',dailyRate:100};
  assert.equal(dailyRows(location,date,date)[0].status,'progress');
  assert.equal(weeklyReport(location,date,date).totals.net,0);
});
test('current unregistered day is pending; past day absent; rest day not absent', () => {
  const { location }=fixture();
  assert.equal(dailyRows(location,date,date)[0].status,'pending');
  assert.equal(dailyRows(location,'2026-09-29',date)[0].status,'absent');
  assert.equal(dailyRows(location,'2026-10-04','2026-10-05')[0].status,'rest');
});
test('payroll discounts use integer cents and never exceed the paid day', () => {
  const { location }=fixture();
  location.attendance[date]=[{employeeId:'person-1',type:'attendance',checkIn:'08:30',checkOut:'17:00',dailyRate:100}];
  location.payrollReviews[date+'_person-1']={status:'discounted',amount:150,note:'Prueba'};
  const report=weeklyReport(location,date,date);
  assert.equal(report.totals.gross,100); assert.equal(report.totals.discount,100); assert.equal(report.totals.net,0);
});
test('discount suggestion does not double-count lateness and missing hours', () => {
  const {location}=fixture();
  location.attendance[date]=[{employeeId:'person-1',type:'attendance',checkIn:'09:00',checkOut:'18:00',dailyRate:100}];
  assert.equal(suggestedDiscount(dailyRows(location,date,date)[0],location),11.11);
});
test('renaming or changing current rate leaves historic attendance/pay intact', () => {
  const {location,employee}=fixture();
  location.attendance[date]=[{employeeId:employee.id,type:'attendance',checkIn:'08:00',checkOut:'18:00',dailyRate:100}];
  employee.name='Nombre nuevo'; employee.tarifaDiaria=200;
  assert.equal(weeklyReport(location,date,date).totals.net,100);
  assert.equal(dailyRows(location,date,date)[0].employee.name,'Nombre nuevo');
});
test('reviewed absence is paid once and does not get deducted twice', () => {
  const {location}=fixture();
  location.attendance[date]=[{employeeId:'person-1',type:'absence',checkIn:'',checkOut:'',dailyRate:100}];
  location.payrollReviews[date+'_person-1']={status:'approved',amount:0,note:'Permiso pagado'};
  assert.equal(weeklyReport(location,date,date).totals.net,100);
  location.payrollReviews[date+'_person-1']={status:'discounted',amount:100,note:'Sin pago'};
  assert.equal(weeklyReport(location,date,date).totals.net,0);
});
test('future dates are excluded from weekly totals', () => {
  const {location}=fixture();
  location.attendance['2026-10-02']=[{employeeId:'person-1',type:'attendance',checkIn:'08:00',checkOut:'18:00',dailyRate:100}];
  assert.equal(weeklyReport(location,'2026-10-03',date).totals.net,0);
});
test('duplicate documents are rejected but duplicate names can have distinct IDs', () => {
  const {location,employee}=fixture();
  assert.throws(()=>validateEmployee(employee,location.employees),/documento/);
  assert.doesNotThrow(()=>validateEmployee({...employee,dni:'00000002'},location.employees));
});
test('legacy backups migrate names, status history and reviews to stable IDs', () => {
  const legacy={locations:['Antigua'],data:{Antigua:{employees:[{name:'Persona antigua',dni:'00000001',position:'Operario',tarifaDiaria:100,statusHistory:[{date:'2026-01-01',active:true}]}],attendance:{[date]:[{name:'Persona antigua',checkIn:'08:30',checkOut:'18:00',observation:'Nota antigua'},{name:'Persona antigua',checkIn:'',checkOut:'',observation:'Otra nota'}]},payrollReviews:{[date+'_Persona antigua']:{status:'discounted',amount:10,note:'Motivo'}}}}};
  const migrated=normalizeAppData(legacy), location=migrated.data.Antigua, id=location.employees[0].id;
  assert.equal(location.attendance[date].length,1); assert.match(location.attendance[date][0].observation,/Nota antigua/);
  assert.equal(location.payrollReviews[date+'_'+id].amount,10);
  assert.equal(weeklyReport(location,date,date).totals.net,90);
});
test('single-site legacy data is not copied into multiple sites', () => {
  const {location}=fixture();
  assert.equal(normalizeAppData(location).locations.length,1);
});
test('invalid imports are rejected before replacement', () => {
  const {app,location}=fixture();
  assert.throws(()=>normalizeAppData({locations:['__proto__'],data:{}}));
  location.attendance[date]=[{employeeId:'person-1',checkIn:'24:00',checkOut:'18:00'}];
  assert.throws(()=>normalizeAppData(app),/Horario/);
  assert.throws(()=>validateSchedule({0:-1},emptyLocation().schedule));
});
test('generated demo is deterministic, complete and schema-valid', () => {
  const sandbox = { window: {}, URLSearchParams, localStorage: { getItem: () => null }, console };
  vm.runInNewContext(readFileSync(new URL('../assets/js/demo-data.js', import.meta.url), 'utf8'), sandbox);
  const a=JSON.parse(JSON.stringify(sandbox.window.DemoData.build())),b=JSON.parse(JSON.stringify(sandbox.window.DemoData.build()));
  assert.deepEqual(a,b); assert.equal(a.locations.length,3);
  assert.equal(a.locations.reduce((sum,name)=>sum+a.data[name].employees.length,0),34);
  assert.doesNotThrow(()=>normalizeAppData(a));
  assert.equal(a.mode,'demo');
});
test('legacy contract keeps records, observations, stable identities and reviewed discounts', () => {
  const {app,location}=fixture();
  location.attendance[date]=[{employeeId:'person-1',checkIn:'08:30',checkOut:'18:00',dailyRate:100,observation:'Permiso'}];
  location.payrollReviews[date+'_person-1']={status:'discounted',amount:20,note:'Revisión',dailyRate:100};
  const legacy=normalizeLegacy(app);
  const site=legacy.data['Sede principal'];
  assert.equal(site.attendance[date][0].name,'Persona de prueba');
  assert.equal(site.attendance[date][0].observation,'Permiso');
  const row=legacyPayroll(legacy,'Sede principal',date).payroll[0];
  assert.equal(row.net,80); assert.equal(row.discount,20);
  assert.equal(normalizeLegacy(legacy).data['Sede principal'].employees[0].id,'person-1');
});
test('legacy reports use actual net hours, schedule and overnight rules', () => {
  const hours={0:0,1:9,2:9,3:9,4:9,5:9,6:5};
  assert.equal(legacyHours('08:00','18:00',date,hours).total,9);
  assert.equal(legacyHours('12:30','18:00',date,hours).total,5);
  assert.equal(legacyIssues({checkIn:'22:00',checkOut:'08:00'},date,hours),null);
  assert.match(legacyIssues({checkIn:'08:00',checkOut:'17:00'},date,hours)[0],/insuficientes/);
});
