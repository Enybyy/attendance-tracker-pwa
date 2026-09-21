/**
 * employees.js - Employee management utilities
 */
import { toYMD } from './utils.js';

/**
 * Normalize status events for an employee
 */
export const normalizeStatusEvents = (emp) => {
    if (!emp) return [];

    // If employee has statusHistory array, use it
    if (Array.isArray(emp.statusHistory) && emp.statusHistory.length > 0) {
        return emp.statusHistory.map((ev) => ({
            date: ev.date,
            active: !!ev.active,
        })).sort((a, b) => a.date.localeCompare(b.date));
    }

    // Legacy: addedDate + removedDate
    const events = [];

    if (emp.addedDate) {
        events.push({ date: emp.addedDate, active: true });
    } else {
        // Default to active from ancient date
        events.push({ date: "2000-01-01", active: true });
    }

    if (emp.removedDate) {
        events.push({ date: emp.removedDate, active: false });
    }

    return events.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Check if employee is active on a given date
 */
export const isActiveOnDate = (emp, dateStr) => {
    const events = normalizeStatusEvents(emp);
    if (events.length === 0) return true;

    let active = false;
    for (const ev of events) {
        if (ev.date <= dateStr) {
            active = ev.active;
        } else {
            break;
        }
    }
    return active;
};

/**
 * Set employee active status from a specific date
 */
export const setEmployeeActiveFromDate = (emp, dateStr, active) => {
    if (!emp.statusHistory) {
        emp.statusHistory = normalizeStatusEvents(emp);
    }

    // Remove any event on the same date
    emp.statusHistory = emp.statusHistory.filter((ev) => ev.date !== dateStr);
    emp.statusHistory.push({ date: dateStr, active });
    emp.statusHistory.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get employees active for a specific date
 */
export const employeesForDate = (employees, dateStr) => {
    return employees.filter((emp) => isActiveOnDate(emp, dateStr));
};
