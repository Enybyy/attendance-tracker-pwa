<div align="center">

# Attendance Tracker PWA

### Daily attendance and weekly records by worksite.

Personnel records, incident review and payroll estimates with Excel and PDF reports. A browser application for construction supervisors and occupational health, safety and environmental teams, with data stored on the device.

<a href="https://enybyy.github.io/attendance-tracker-pwa/"><img src="docs/media/demo.svg" width="360" alt="Open demo"></a>

<p><a href="https://github.com/Enybyy"><img src="docs/media/github.svg" width="112" alt="Eliud Rojas Mendoza on GitHub"></a>
<a href="https://www.linkedin.com/in/eliud-rojas-mendoza-414652212/"><img src="docs/media/linkedin.svg" width="112" alt="Eliud Rojas Mendoza on LinkedIn"></a>
<a href="https://www.upwork.com/freelancers/~01471ca462b236e8e5"><img src="docs/media/upwork.svg" width="112" alt="Eliud Rojas Mendoza on Upwork"></a></p>

[![Attendance Tracker PWA in use](docs/screenshots/asistencia.png)](https://enybyy.github.io/attendance-tracker-pwa/)

*Actual application screenshot. Workers, IDs, accounts and amounts in the demo are fictional.*

[About](#about-the-project) · [Workflow](#everyday-workflow) · [Technology](#built-with) · [Run locally](#local-use)

</div>


## About the project

Attendance Tracker follows the daily personnel routine across construction worksites. Each site brings together working hours, field observations and safety briefings, keeping a history that supervisors can review throughout the week.

The workflow follows the working day: choose a site, record attendance and review what happened. At closing, those same records feed the weekly summary and payroll estimate, so reports can be prepared without transcribing the information again.

## Everyday workflow

| Inside the application | Detail |
| --- | --- |
| Personnel by site | Each worksite keeps its workers, attendance records and personnel movements. |
| Working hours | Check-in and check-out times are calculated by the minute, accounting for breaks and configured expected hours. |
| Weekly summary | Attendance, absences, overtime and missing hours appear together for review. |
| Payroll estimates | Records retain historical daily rates; incidents and deductions remain tied to their review. |
| Working documents | Attendance and payroll estimates export to Excel and PDF for review and sharing. |
| Work in the field | After initial online preparation, the application can continue offline on the same device. |

## Explore the system

The [public demo](https://enybyy.github.io/attendance-tracker-pwa/) starts with **3 worksites and 34 fictional workers**, plus sample history covering the full workflow. The interface is in Spanish; the steps below retain its button labels.

1. Switch worksites with the header arrows and select a report date.
2. Review attendance, working hours and observations for the day.
3. Continue to the weekly summary and payroll estimate; open an incident to review how it is handled.
4. Export a report. Use **Reiniciar demo** (Reset demo) to restore examples or **Empezar vacío** (Start empty) to enter your own records.

> Each browser keeps its own data. Changes do not affect other visitors. Resetting the demo replaces that browser's records; export a backup first if you need to keep them.

### Weekly summary: attendance, overtime and missing hours

The chart brings together daily attendance and absences. The lists help locate workers with incidents and review differences in recorded hours during the week.

![Weekly attendance summary with fictional records](docs/screenshots/resumen-semanal.png)

### Payroll estimate: recorded days, rates and payment methods

The estimate groups worked days and amounts by employee. Supervisors can review working-time incidents, record justified deductions and separate totals by payment method.

![Weekly payroll estimate with fictional records](docs/screenshots/planilla.png)

Reports use the selected cutoff date. Overtime is shown for review and does not automatically add payment. This is an operational record, not a replacement for a statutory payroll system.

## Reports ready to share

These files were exported directly from the application using fictional demo data. They use **October 1, 2026** as the cutoff, within the September 28–October 4 week. Records after the cutoff are excluded from the payroll calculation.

| Document | Editable Excel | PDF for review and printing |
| --- | --- | --- |
| Attendance | [Download daily report](docs/reports/asistencia-demo.xlsx?raw=true) | [View weekly report](docs/reports/asistencia-demo.pdf) |
| Payroll estimate | [Download spreadsheet](docs/reports/planilla-demo.xlsx?raw=true) | [View report](docs/reports/planilla-demo.pdf) |

### Exported payroll PDF

![Full page of the payroll PDF exported by the application](docs/screenshots/reporte-planilla.png)

[Open the original PDF](docs/reports/planilla-demo.pdf) · [Download the matching Excel file](docs/reports/planilla-demo.xlsx?raw=true)

## Built with

The JavaScript interface connects attendance rules, local persistence and document generation. Backup validation and shared calculations keep the displayed payroll estimate consistent with its exports.

| Area | Technology |
| --- | --- |
| Interface | HTML, Tailwind CSS and custom CSS |
| Business rules | JavaScript ES modules |
| Charts | Chart.js |
| Documents | SheetJS for XLSX; jsPDF, AutoTable and html2canvas for PDF |
| Data | IndexedDB with a local storage fallback |
| Installation and offline use | PWA manifest and Service Worker |
| Demo | GitHub Pages |
| Verification | Node.js rule tests and Playwright browser tests |

## Local use

<details>
<summary><strong>Run on your computer and run tests</strong></summary>

Node.js is required. Opening the application through the local server needs no build or dependency installation:

```bash
git clone https://github.com/Enybyy/attendance-tracker-pwa.git
cd attendance-tracker-pwa
npm start
```

Open **http://127.0.0.1:4173**. Use HTTP instead of opening `index.html` directly, because the app loads ES modules and a Service Worker.

Development checks:

```bash
npm ci
npm test
npm run test:e2e
```

Browser tests use installed Google Chrome. Alternatively, run `npx playwright install chromium` and set `BROWSER_CHANNEL=chromium` when running the tests.

</details>

<details>
<summary><strong>Data, backups and application scope</strong></summary>

- No backend, user accounts or cross-device synchronization. Clearing browser data can also remove records.
- JSON backups support export and validated restoration. Optional folder linking depends on File System Access API support, primarily in Chrome and Edge.
- Offline use requires an initial online load to prepare the app and its libraries. PWA installation depends on the browser and device.
- Deactivating personnel preserves earlier records. Employees with attendance history cannot simply be deleted along with that history.
- Examples and screenshots are illustrative, not company figures or measured business results.

</details>

---

<div align="center">

**Eliud Rojas Mendoza · Enybyy**

<p><a href="https://github.com/Enybyy"><img src="docs/media/github.svg" width="112" alt="Eliud Rojas Mendoza on GitHub"></a>
<a href="https://www.linkedin.com/in/eliud-rojas-mendoza-414652212/"><img src="docs/media/linkedin.svg" width="112" alt="Eliud Rojas Mendoza on LinkedIn"></a>
<a href="https://www.upwork.com/freelancers/~01471ca462b236e8e5"><img src="docs/media/upwork.svg" width="112" alt="Eliud Rojas Mendoza on Upwork"></a></p>

[MIT License](LICENSE)

</div>
