/**
 * charts.js - Chart.js integration for visual reports
 */

/**
 * Create or update the weekly attendance bar chart
 */
export const createAttendanceChart = (
    ctx,
    existingChart,
    labels,
    presentData,
    absentData
) => {
    if (!window.Chart) {
        console.warn("Chart.js not available");
        return null;
    }

    if (existingChart) {
        existingChart.data.labels = labels;
        existingChart.data.datasets[0].data = presentData;
        existingChart.data.datasets[1].data = absentData;
        existingChart.update();
        return existingChart;
    }

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Presentes",
                    data: presentData,
                    backgroundColor: "rgba(34, 197, 94, 0.8)",
                    borderColor: "rgba(34, 197, 94, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Ausentes",
                    data: absentData,
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                    borderColor: "rgba(239, 68, 68, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: { color: "#e2e8f0" },
                },
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(148, 163, 184, 0.1)" },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#94a3b8", stepSize: 1 },
                    grid: { color: "rgba(148, 163, 184, 0.1)" },
                },
            },
        },
    });
};

/**
 * Generate weekly metrics HTML
 */
export const generateWeeklyMetricsHTML = (stats) => {
    const { avgAttendance, complianceRate, totalHours, totalOvertime } = stats;

    return `
    <div class="bg-cyan-900/30 p-3 rounded border-l-4 border-cyan-500">
      <div class="text-lg font-bold text-cyan-400">${avgAttendance}%</div>
      <div class="text-xs text-slate-300">Asistencia promedio</div>
    </div>

    <div class="bg-green-900/30 p-3 rounded border-l-4 border-green-500">
      <div class="text-lg font-bold text-green-400">${complianceRate}%</div>
      <div class="text-xs text-slate-300">Cumplimiento horario</div>
    </div>

    <div class="bg-purple-900/30 p-3 rounded border-l-4 border-purple-500">
      <div class="text-lg font-bold text-purple-400">${totalHours.toFixed(1)}h</div>
      <div class="text-xs text-slate-300">Horas trabajadas</div>
    </div>

    <div class="bg-amber-900/30 p-3 rounded border-l-4 border-amber-500">
      <div class="text-lg font-bold text-amber-400">${totalOvertime.toFixed(1)}h</div>
      <div class="text-xs text-slate-300">Horas extra</div>
    </div>
  `;
};

/**
 * Generate top employees list HTML
 */
export const generateTopListHTML = (items, emptyMessage = "Sin datos") => {
    if (!items || items.length === 0) {
        return `<p class="text-xs text-slate-500 italic">${emptyMessage}</p>`;
    }

    return items
        .slice(0, 5)
        .map(
            (item) => `
      <div class="flex justify-between items-center text-sm">
        <span class="text-slate-200 truncate max-w-[150px]">${item.name}</span>
        <span class="font-bold ${item.valueClass || 'text-slate-400'}">${item.value}</span>
      </div>
    `
        )
        .join("");
};
