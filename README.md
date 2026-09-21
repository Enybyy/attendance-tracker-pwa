# 📋 Attendance Tracker PWA

> **Multi-site workforce attendance management system** built for the construction & civil works industry — zero dependencies, fully offline-capable, installable as a native app.

**[🚀 Live Demo](https://enybyy.github.io/attendance-tracker-pwa)**

---

## Overview

A **Progressive Web App** designed for SSOMA (Occupational Safety, Health and Environment) departments to manage workforce attendance across multiple construction sites. The system handles daily check-in/check-out logging, weekly payroll summaries, SSOMA safety talk records, and PDF/Excel reporting — all running entirely in the browser with no backend required.

Built to replace paper-based attendance registers used on active construction projects (sports courts, civil infrastructure), this tool was developed for real-world field use where internet connectivity may be intermittent.

---

## ✨ Features

### Core
- **Multi-site management** — switch between multiple worksites (losas/sedes) from a single interface
- **Daily attendance register** — log employee check-in / check-out times with observations
- **Automatic hour calculation** — computes worked hours, overtime, and applies automatic 1-hour lunch deduction (12:00–13:00) on weekdays
- **Employee roster management** — add, edit, deactivate, and track personnel per site with full profile data (DNI, position, bank details, daily rate)
- **Status event log** — records hiring and termination dates per employee per week

### Payroll & Finance
- **Weekly payroll review** — flag attendance incidents (late arrivals, early departures, absences) and mark them as approved or discounted
- **Discount tracking** — record partial or full-day deductions per incident
- **Per-site salary summaries** — weekly earnings calculations based on daily rates and worked hours

### SSOMA Compliance
- **Daily safety talk log** — record topic and duration of the daily SSOMA briefing (charla de seguridad)
- **Weekly field notes** — free-text area for site supervisors to document weekly observations
- **Weekly personnel movement log** — automatic tracking of new hires and terminations per ISO week

### Reports & Export
- **PDF export** — daily attendance report with full table (name, DNI, position, hours, overtime, status, observations)
- **Excel export** — weekly attendance data in spreadsheet format via SheetJS
- **JSON backup/restore** — full data export and import for portability and disaster recovery
- **Visual charts** — weekly bar chart of present vs. absent employees (Chart.js)

### PWA / Offline
- **Service Worker** — full offline support via cache-first strategy
- **Installable** — add to home screen on Android/iOS as a standalone app
- **Local persistence** — data stored in IndexedDB (via custom abstraction) or a user-linked filesystem folder via the File System Access API
- **No backend required** — 100% client-side, zero server costs

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5 |
| Styling | Tailwind CSS (CDN) + custom CSS |
| Logic | Vanilla JavaScript (ES Modules) |
| Charts | Chart.js |
| PDF export | jsPDF + jsPDF-AutoTable |
| Excel export | SheetJS (xlsx) |
| Storage | IndexedDB + File System Access API |
| Offline | Service Worker (Cache API) |
| Distribution | GitHub Pages |

**No frameworks. No build tools. No npm install.** Open `index.html` and it works.

---

## 📁 Project Structure

```
attendance-tracker-pwa/
├── index.html                  # Single-page application shell
├── sw.js                       # Service Worker (offline caching)
├── manifest.json               # PWA manifest
├── storage-simple.js           # Storage abstraction (IndexedDB / filesystem)
├── assets/
│   ├── css/
│   │   └── app.css             # Custom styles and animations
│   └── js/
│       ├── app.js              # Main application controller (~6500 lines)
│       ├── demo-data.js        # Seeded demo dataset generator (PRNG-based)
│       └── modules/
│           ├── charts.js       # Chart.js wrappers
│           ├── config.js       # Business rules and validation logic
│           ├── employees.js    # Employee CRUD utilities
│           ├── hours.js        # Hour calculation engine
│           ├── index.js        # Module barrel
│           ├── locations.js    # Multi-site management utilities
│           ├── pdf-export.js   # PDF generation logic
│           ├── reports.js      # Report data builders
│           ├── ui.js           # DOM rendering utilities
│           └── utils.js        # Date, time, and format helpers
```

---

## 🚀 Getting Started

### Option 1 — Open directly (no setup)
```bash
# Clone the repository
git clone https://github.com/Enybyy/attendance-tracker-pwa.git

# Open in browser
open index.html
```
No server needed — works by opening the file directly.

### Option 2 — Serve locally (recommended for Service Worker)
```bash
# Using Python
python -m http.server 8080

# Or using Node.js
npx serve .
```
Then open `http://localhost:8080`.

### Demo mode
The app loads a realistic seeded dataset automatically on first launch (3 construction sites, 34 workers, ~7 weeks of attendance history). To start with an empty system, append `?demo=off` to the URL.

---

## 📸 Screenshots

> Live demo available at **[enybyy.github.io/attendance-tracker-pwa](https://enybyy.github.io/attendance-tracker-pwa)**

| View | Description |
|---|---|
| Main dashboard | Daily attendance table with check-in/out controls |
| Location switcher | Multi-site selector with inline add/edit |
| Weekly payroll | Incident review panel with approve/discount actions |
| PDF report | Auto-generated daily attendance sheet |
| Employee roster | Full profile cards with status history |
| SSOMA log | Safety talk and weekly field notes |

---

## 🏗 Business Logic Highlights

- **ISO week numbering** — all weekly views and payroll cycles follow ISO 8601
- **Lunch deduction rule** — automatically deducted if the work window crosses 12:00–13:00 on Mon–Fri; not applied on Saturdays (half-day)
- **Overtime detection** — calculated beyond the configured expected hours per day of week
- **Incident flagging** — an attendance record is flagged if check-in is more than 15 minutes late or total hours are below the daily threshold
- **Employee lifecycle** — `statusEvents` array tracks active/inactive states over time, so historical data remains accurate after a termination
- **PRNG dataset seeder** — demo data uses a seeded pseudo-random number generator to produce the same dataset on every device and reload

---

## 🔧 Configuration

Weekly expected hours per day of week are configurable per site:

```js
weeklyHoursConfig: {
  0: 0,  // Sunday (no work)
  1: 9,  // Monday
  2: 9,  // Tuesday
  3: 9,  // Wednesday
  4: 9,  // Thursday
  5: 9,  // Friday
  6: 5   // Saturday (half day)
}
```

---

## 📦 Data Model

All data is serialized as a single JSON object (`appData`) with the following top-level shape:

```js
{
  locations: ["Site A", "Site B"],        // Ordered list of site names
  currentLocationIndex: 0,
  disabledLocations: [],
  locationDetails: { "Site A": { address: "..." } },
  data: {
    "Site A": {
      employees: [ /* Employee objects */ ],
      attendance: { "YYYY-MM-DD": [ /* AttendanceRecord[] */ ] },
      weeklyHoursConfig: { /* day -> hours */ },
      dailyTopics: { "YYYY-MM-DD": { topic, duration } },
      weeklyNotes: { "YYYY-Www": "..." },
      weeklyNotesLog: { "YYYY-Www": [ /* events */ ] },
      payrollReviews: { "YYYY-MM-DD_Name": { status, amount, note } }
    }
  }
}
```

---

## 🌐 Deployment

The app is deployed to **GitHub Pages** directly from the `main` branch. No build step required.

To deploy your own instance:
1. Fork the repository
2. Go to **Settings → Pages → Source: Deploy from branch → `main` / `root`**
3. Your instance will be live at `https://<username>.github.io/attendance-tracker-pwa`

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  <sub>Built with vanilla JavaScript · No frameworks · No build tools · Fully offline</sub>
</div>
