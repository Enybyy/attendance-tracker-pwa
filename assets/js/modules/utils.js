/**
 * utils.js - Utility functions used across modules
 */

/**
 * Convert Date to YYYY-MM-DD string
 */
export const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY
 */
export const toDMY = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
};

/**
 * Download a file with given content
 */
export const downloadFile = (filename, content, type = "application/json") => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.remove();
    }, 100);
};

/**
 * Get ISO week info from a Date
 */
export const getISOWeekInfo = (date) => {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return { year: d.getFullYear(), week };
};

/**
 * Get week dates (Mon-Sun) from a date string
 */
export const getWeekDatesFromDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const dayOfWeek = d.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);
        dates.push(toYMD(current));
    }
    return dates;
};

/**
 * Get week key string from date
 */
export const getWeekKeyFromDateStr = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    const { year, week } = getISOWeekInfo(d);
    return `${year}-W${String(week).padStart(2, "0")}`;
};

/**
 * Format hours as H:MM
 */
export const formatHoursHM = (hours) => {
    if (typeof hours !== "number" || isNaN(hours)) return "-";
    const sign = hours < 0 ? "-" : "";
    const totalMinutes = Math.round(Math.abs(hours) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${sign}${h}:${String(m).padStart(2, "0")}`;
};

/**
 * Normalize topic entry to object format
 */
export const normalizeTopicEntry = (entry) => {
    if (!entry) return { topic: "", duration: null };
    if (typeof entry === "string") return { topic: entry, duration: null };
    return {
        topic: entry.topic || "",
        duration: entry.duration != null ? entry.duration : null,
    };
};
