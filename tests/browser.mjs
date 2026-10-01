import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ExcelJS from 'exceljs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4174';
const server = process.env.BASE_URL ? null : spawn(process.execPath, ['scripts/server.mjs'], { cwd: root, env: { ...process.env, PORT: '4174' }, stdio: 'ignore', windowsHide: true });
await mkdir(path.join(root, 'test-results'), { recursive: true });
for (let attempt = 0; attempt < 30; attempt++) {
  try { if ((await fetch(baseURL)).ok) break; } catch {}
  await new Promise(resolve => setTimeout(resolve, 200));
}
const channel = process.env.BROWSER_CHANNEL || 'chrome';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/Lima', acceptDownloads: true });
const page = await context.newPage();
await page.clock.setFixedTime(new Date('2026-10-01T15:00:00Z'));
const errors = [], messages = [];
page.on('pageerror', error => errors.push(error.message));
page.on('dialog', async dialog => { messages.push(dialog.message()); await dialog.accept(); });
try {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#payrollTableBody')?.children.length > 0);
  assert.match(await page.locator('h1').textContent(), /Registro de Asistencia/);
  await page.screenshot({ path: path.join(root, 'test-results', 'original-style.png'), fullPage: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(messages, []);
  console.log('PASS: original interface loads with demo data and payroll, without errors.');
  await page.locator('#demo-badge-empty').click();
  await page.waitForFunction(() => document.querySelector('#payrollTotalEmployees')?.textContent === '0');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#payrollTotalEmployees').textContent(),'0');
  const emptyData = await page.evaluate(() => window.storage.load());
  assert.equal(emptyData.mode,'work');
  for (const site of emptyData.locations) assert.equal(emptyData.data[site].employees.length,0);
  console.log('PASS: explicit empty reset persists after reload without automatic reseeding.');
  await page.locator('#loadSampleDataBtn').evaluate(button => button.click());
  await page.waitForFunction(() => document.querySelector('#payrollTotalEmployees')?.textContent !== '0');
  await page.evaluate(() => window.storage.queue);
  messages.length = 0;
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload({waitUntil:'networkidle'});
  await context.setOffline(true);
  await page.reload({waitUntil:'load'});
  await page.waitForFunction(() => document.querySelector('#payrollTableBody')?.children.length > 0);
  const [offlineXlsx] = await Promise.all([page.waitForEvent('download'), page.locator('#exportPayrollExcelBtn').click()]);
  assert.match(offlineXlsx.suggestedFilename(),/\.xlsx$/);
  const [offlinePDF] = await Promise.all([page.waitForEvent('download'), page.locator('#exportPayrollPdfBtn').click()]);
  assert.match(offlinePDF.suggestedFilename(),/\.pdf$/);
  await context.setOffline(false);
  assert.deepEqual(errors,[]);
  console.log('PASS: cold offline reload and both payroll exports after the first online preparation.');
  const fixtureContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/Lima', acceptDownloads: true });
  const employee = { id: 'p1', name: "Ana O'Neil", dni: '00000001', position: 'Operario', tarifaDiaria: 100, statusEvents: [{date:'2026-09-28',active:true}] };
  const fixture = { locations:['Sede de prueba'], currentLocationIndex:0, data:{'Sede de prueba':{
    employees:[employee],
    attendance:{
      '2026-09-28':[{name:employee.name,checkIn:'08:30',checkOut:'18:00',observation:'Conservar nota',dailyRate:100}],
      '2026-09-29':[{name:employee.name,checkIn:'08:00',checkOut:'18:00',dailyRate:100}],
      '2026-09-30':[{name:employee.name,checkIn:'',checkOut:'',observation:'Permiso sin marcación',observationOnly:true}],
    },
    weeklyHoursConfig:{0:0,1:9,2:9,3:9,4:9,5:9,6:5},
    payrollReviews:{["2026-09-28_"+employee.name]:{status:'discounted',amount:20,note:'Descuento revisado'}}
  }}};
  await fixtureContext.addInitScript(data => {
    if (!localStorage.getItem('browser-fixture-seeded')) {
      localStorage.setItem('appData', JSON.stringify(data));
      localStorage.setItem('demoSeedVersion', 'older-demo-version');
      localStorage.setItem('browser-fixture-seeded', '1');
    }
  }, fixture);
  const ui = await fixtureContext.newPage();
  await ui.clock.setFixedTime(new Date('2026-10-01T15:00:00Z'));
  ui.on('pageerror', error => errors.push(error.message));
  ui.on('dialog', dialog => dialog.accept());
  const saved = () => ui.evaluate(async () => { await window.storage.queue; return window.storage.load(); });
  const date = async value => { await ui.locator('#reportDate').fill(value); await ui.locator('#reportDate').dispatchEvent('change'); };
  await ui.goto(baseURL, {waitUntil:'networkidle'});
  await ui.waitForFunction(() => document.querySelector('#payrollFooterMonto')?.textContent.includes('180.00'));
  assert.equal((await saved()).locations[0],'Sede de prueba'); // No reseed on an older demo version.
  await date('2026-09-28');
  await ui.locator('[data-payroll-review]').first().click();
  assert.equal(await ui.locator('#reviewList input[type=number]').inputValue(),'20.00');
  await ui.locator('#closePayrollReviewModal').click();
  const [xlsx] = await Promise.all([ui.waitForEvent('download'), ui.locator('#exportPayrollExcelBtn').click()]);
  await xlsx.saveAs(path.join(root,'test-results','planilla.xlsx'));
  const book = new ExcelJS.Workbook();
  await book.xlsx.readFile(path.join(root,'test-results','planilla.xlsx'));
  assert.equal(book.worksheets[0].getCell('O5').value,80); // Only Monday at this cutoff.
  assert.equal(book.worksheets[0].getCell('N5').value,20);
  assert.equal(book.worksheets[0].getCell('B5').value,'00000001');
  const [pdf] = await Promise.all([ui.waitForEvent('download'), ui.locator('#exportPayrollPdfBtn').click()]);
  await pdf.saveAs(path.join(root,'test-results','planilla.pdf'));
  const [attendancePDF] = await Promise.all([ui.waitForEvent('download'), ui.locator('#exportPdfBtn').click()]);
  await attendancePDF.saveAs(path.join(root,'test-results','asistencia.pdf'));
  await ui.locator('[data-action=edit-attendance]').first().click();
  await ui.locator('#editCheckOutTime').fill('19:00');
  await ui.locator('#saveEditAttendance').click();
  let data = await saved();
  assert.equal(data.data['Sede de prueba'].attendance['2026-09-28'][0].observation,'Conservar nota');
  assert.equal(data.data['Sede de prueba'].payrollReviews["2026-09-28_"+employee.name],undefined);
  // Rename and change current tariff without repricing existing attendance.
  await ui.locator('#employeeList [data-action=edit]').first().click();
  await ui.locator('#editEmployeeName').fill("Ana O'Neil actualizada");
  await ui.locator('#editEmployeeTarifa').fill('200');
  await ui.locator('#saveEditEmployee').click();
  data = await saved();
  assert.equal(data.data['Sede de prueba'].attendance['2026-09-29'][0].dailyRate,100);
  await date('2026-09-30');
  await ui.locator('#addAllAttendanceBtn').click();
  data = await saved();
  assert.equal(data.data['Sede de prueba'].attendance['2026-09-30'].length,1);
  assert.equal(data.data['Sede de prueba'].attendance['2026-09-30'][0].checkIn,'');
  const beforeImport = JSON.stringify(await saved());
  await ui.locator('#importJsonInput').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"locations":["__proto__"],"data":{}}')});
  await ui.waitForTimeout(100);
  assert.equal(JSON.stringify(await saved()),beforeImport);
  // A draft movement is discarded when the original modal is cancelled.
  await ui.locator('#manageWeeklyLogBtn').click();
  await ui.locator('#addWeeklyLogEntryBtn').click();
  await ui.locator('#weeklyLogTableBody [data-field=name]').fill('Draft only');
  await ui.locator('#closeWeeklyLogModal').click();
  assert.equal(JSON.stringify(await saved()),beforeImport);
  // A successful local fallback must take priority over stale IndexedDB on reload.
  await ui.evaluate(async () => {
    window.storage.putValue = async () => { throw new Error('Database unavailable'); };
    const data = await window.storage.load();
    data.locationDetails['Sede de prueba'].address = 'Fallback persisted';
    await window.storage.save(data);
  });
  await ui.reload({waitUntil:'networkidle'});
  assert.equal((await saved()).locationDetails['Sede de prueba'].address,'Fallback persisted');
  // Corrupted JSON is retained instead of overwritten by demo initialization.
  const corruptContext = await browser.newContext();
  await corruptContext.addInitScript(() => localStorage.setItem('appData','{invalid json'));
  const corruptPage = await corruptContext.newPage();
  await corruptPage.clock.setFixedTime(new Date('2026-10-01T15:00:00Z'));
  let loadError = '';
  corruptPage.on('dialog', dialog => { loadError=dialog.message(); return dialog.accept(); });
  await corruptPage.goto(baseURL,{waitUntil:'networkidle'});
  assert.match(loadError,/No se pudieron cargar/);
  assert.equal(await corruptPage.evaluate(() => localStorage.getItem('appData')),'{invalid json');
  const [rawBackup] = await Promise.all([corruptPage.waitForEvent('download'), corruptPage.locator('#exportJsonBtn').evaluate(button => button.click())]);
  assert.equal(rawBackup.suggestedFilename(),'respaldo_para_revision.json');
  await corruptPage.locator('#importJsonInput').setInputFiles({name:'recovery.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
  await corruptPage.waitForFunction(() => document.querySelector('#payrollFooterMonto')?.textContent.includes('180.00'));
  assert.equal(await corruptPage.evaluate(async () => (await window.storage.load()).locations[0]),'Sede de prueba');
  await corruptContext.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: shared XLSX/PDF payroll, apostrophe names, preserved observations/rates, invalidated reviews, bulk duplicates and fallback persistence.');
  await fixtureContext.close();
} finally {
  await browser.close(); server?.kill();
}
