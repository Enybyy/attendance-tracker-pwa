/**
 * pdf-export.js - PDF Export functionality with jsPDF
 */
import { formatHoursHM, toDMY, getISOWeekInfo, getWeekDatesFromDate } from './utils.js';
import { isCompleteAttendanceRecord } from './config.js';

/**
 * Apply autoTable with compatibility for different jspdf versions
 */
export const applyAutoTable = (doc, opts) => {
    if (doc.autoTable) {
        try {
            doc.autoTable({ ...opts });
        } catch (e) {
            console.warn(e);
        }
    } else if (window.jspdf && window.jspdf.autoTable) {
        try {
            window.jspdf.autoTable(doc, { ...opts });
        } catch (e) {
            console.warn(e);
        }
    } else {
        throw new Error("jspdf-autotable no está disponible");
    }
};

/**
 * Get base table configuration for PDF
 */
export const getBaseTableConfig = () => ({
    theme: "grid",
    styles: {
        fontSize: 8,
        cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
        overflow: "linebreak",
    },
    headStyles: { fillColor: [31, 41, 55], textColor: 255 },
    bodyStyles: { valign: "middle" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 40, right: 40 },
});

/**
 * Get column styles for daily attendance table (optimized widths)
 */
export const getDailyTableColumnStyles = () => ({
    0: { cellWidth: 160 },  // Empleado (wider)
    1: { cellWidth: 60 },   // DNI
    2: { cellWidth: 80 },   // Cargo
    3: { cellWidth: 50 },   // Entrada
    4: { cellWidth: 65 },   // Almuerzo
    5: { cellWidth: 50 },   // Salida
    6: { cellWidth: 60 },   // Hrs Trabajadas
    7: { cellWidth: 60 },   // Hrs Extra
    8: { cellWidth: 60 },   // Estado
    9: { cellWidth: 115 },  // Observaciones
});

/**
 * Get table headers for daily attendance
 */
export const getDailyTableHeaders = () => [
    [
        "Empleado",
        "DNI / CE",
        "Cargo",
        "Entrada",
        "Almuerzo",
        "Salida",
        "Hrs. Trabajadas",
        "Hrs. Extra",
        "Estado",
        "Observaciones",
    ],
];

/**
 * Day names for PDF reports
 */
export const DAY_NAMES = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];

/**
 * Build daily attendance data for PDF export
 */
export const buildDailyDataForPDF = (
    date,
    attendance,
    employees,
    employeesForDate,
    calculateHours
) => {
    const dailyAttendance = attendance[date] || [];
    let present = 0,
        absent = 0,
        totalHours = 0,
        totalOvertime = 0;

    const presentMap = new Map(dailyAttendance.map((r) => [r.name, r]));
    const presentRows = [];
    const absentRows = [];

    const activeEmps = employeesForDate(date);
    const activeSet = new Set(activeEmps.map((e) => e.name));
    const empByName = new Map(activeEmps.map((e) => [e.name, e]));

    // Process active employees
    activeEmps.forEach((employee) => {
        const rec = presentMap.get(employee.name);

        if (rec) {
            present++;
            const { total, overtime, lunchDeducted } = calculateHours(
                rec.checkIn,
                rec.checkOut,
                date
            );

            const lunchText = lunchDeducted ? "12:00 - 13:00" : "-";
            totalHours += typeof total === "number" ? total : 0;
            totalOvertime += typeof overtime === "number" ? overtime : 0;

            presentRows.push({
                cargo: employee.position,
                nombre: employee.name,
                row: [
                    employee.name,
                    employee.dni,
                    employee.position,
                    rec.checkIn,
                    lunchText,
                    rec.checkOut,
                    formatHoursHM(total),
                    formatHoursHM(overtime),
                    "Presente",
                    rec.observation && rec.observation.trim() ? rec.observation : "-",
                ],
            });
        } else {
            absent++;
            absentRows.push({
                cargo: employee.position,
                nombre: employee.name,
                row: [
                    employee.name,
                    employee.dni,
                    employee.position,
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "Ausente",
                    "-",
                ],
            });
        }
    });

    // Include records for employees not in active list
    presentMap.forEach((rec, name) => {
        if (activeSet.has(name)) return;

        const allEmp = employees.find((e) => e.name === name) || {};
        const { total, overtime, lunchDeducted } = calculateHours(
            rec.checkIn,
            rec.checkOut,
            date
        );

        const lunchText = lunchDeducted ? "12:00 - 13:00" : "-";
        present++;
        totalHours += typeof total === "number" ? total : 0;
        totalOvertime += typeof overtime === "number" ? overtime : 0;

        presentRows.push({
            cargo: allEmp.position || "",
            nombre: name,
            row: [
                name,
                allEmp.dni || "",
                allEmp.position || "",
                rec.checkIn,
                lunchText,
                rec.checkOut,
                formatHoursHM(total),
                formatHoursHM(overtime),
                "Presente",
                rec.observation && rec.observation.trim() ? rec.observation : "-",
            ],
        });
    });

    // Group and sort by cargo
    const groupAndSort = (items) => {
        const byCargo = new Map();
        items.forEach((it) => {
            if (!byCargo.has(it.cargo)) byCargo.set(it.cargo, []);
            byCargo.get(it.cargo).push(it);
        });

        const cargosOrdenados = Array.from(byCargo.keys()).sort((a, b) =>
            (a || "").localeCompare(b || "", "es", { sensitivity: "base" })
        );

        const rows = [];
        cargosOrdenados.forEach((cargo) => {
            const arr = byCargo.get(cargo).sort((a, b) =>
                a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
            );
            arr.forEach((it) => rows.push(it.row));
        });

        return rows;
    };

    const orderedPresent = groupAndSort(presentRows);
    const orderedAbsent = groupAndSort(absentRows);
    const body = [...orderedPresent, ...orderedAbsent];

    return { body, present, absent, totalHours, totalOvertime };
};
