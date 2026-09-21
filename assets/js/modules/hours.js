/**
 * hours.js - Hours calculation logic
 */
import { isValidTime } from './config.js';

/**
 * Calculate worked hours, overtime, and lunch deduction
 */
export const calculateHours = (start, end, dateStr, getExpectedHoursForDate) => {
    if (!isValidTime(start) || !isValidTime(end)) {
        return {
            total: 0,
            overtime: 0,
            lunchDeducted: false,
            lunchMinutes: 0,
        };
    }

    const startTime = new Date(`1970-01-01T${start}:00`);
    let endTime = new Date(`1970-01-01T${end}:00`);
    let diffHrs = (endTime - startTime) / (1000 * 60 * 60);

    // Handle midnight crossing
    const crossesMidnight = diffHrs < 0;
    if (crossesMidnight) {
        endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
        diffHrs = (endTime - startTime) / (1000 * 60 * 60);
    }

    // Lunch deduction (12:00 - 13:00)
    let lunchMinutes = 0;
    let lunchDeducted = false;

    if (diffHrs > 5) {
        const lunchStart = new Date("1970-01-01T12:00:00");
        const lunchEnd = new Date("1970-01-01T13:00:00");

        const overlapStart = Math.max(startTime.getTime(), lunchStart.getTime());
        const overlapEnd = Math.min(endTime.getTime(), lunchEnd.getTime());
        const overlap = Math.max(0, overlapEnd - overlapStart);

        lunchMinutes = overlap / (1000 * 60);
        lunchDeducted = lunchMinutes > 0;
    }

    const totalHours = parseFloat(
        ((diffHrs * 60 - lunchMinutes) / 60).toFixed(2)
    );

    const standardHours = dateStr && getExpectedHoursForDate
        ? getExpectedHoursForDate(dateStr)
        : 9;

    const overtime = Math.max(
        0,
        parseFloat((totalHours - standardHours).toFixed(2))
    );

    return { total: totalHours, overtime, lunchDeducted, lunchMinutes };
};
