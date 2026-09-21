/**
 * reports.js - Report building utilities
 */
import { normalizeTopicEntry, toDMY, getISOWeekInfo, getWeekDatesFromDate } from './utils.js';
import { isCompleteAttendanceRecord } from './config.js';

/**
 * List all dates from attendance and topics maps
 */
export const listAllDates = (attendanceMap, topicsMap = {}) => {
    const dates = new Set(Object.keys(attendanceMap || {}));
    Object.keys(topicsMap).forEach((d) => dates.add(d));
    return Array.from(dates).sort();
};

/**
 * Build daily report data for a location
 */
export const buildDailyForLocation = (
    locName,
    locData,
    isCompleteRecord,
    normalizeTopicFn
) => {
    const allDates = listAllDates(
        locData.attendance,
        locData.dailyTopics
    );

    const dailyArr = [];

    allDates.forEach((dateStr) => {
        const records = locData.attendance[dateStr] || [];
        const employees = locData.employees || [];

        let present = 0;
        let absent = 0;
        let totalHours = 0;
        let totalOvertime = 0;

        const names = new Set();

        records.forEach((r) => {
            if (isCompleteRecord(r)) {
                present++;
                names.add(r.name);
            }
        });

        employees.forEach((e) => {
            if (!names.has(e.name)) {
                absent++;
            }
        });

        const topicEntry = normalizeTopicFn(locData.dailyTopics?.[dateStr]);

        dailyArr.push({
            date: dateStr,
            dayOfWeek: new Date(dateStr + "T00:00:00").toLocaleDateString("es", {
                weekday: "long",
            }),
            present,
            absent,
            totalHours,
            totalOvertime,
            topic: topicEntry.topic,
            topicDuration: topicEntry.duration,
        });
    });

    return dailyArr;
};

/**
 * Build weekly aggregated data for a location
 */
export const buildWeeklyForLocation = (
    locName,
    locData,
    getISOWeekInfoFn
) => {
    const weekKey = (dateStr) => {
        const d = new Date(dateStr + "T00:00:00");
        const { year, week } = getISOWeekInfoFn(d);
        return `${year}-W${String(week).padStart(2, "0")}`;
    };

    const weeklyMap = new Map();
    const allDates = listAllDates(locData.attendance, locData.dailyTopics);

    allDates.forEach((dateStr) => {
        const wk = weekKey(dateStr);
        if (!weeklyMap.has(wk)) {
            weeklyMap.set(wk, {
                weekKey: wk,
                days: [],
                totalPresent: 0,
                totalAbsent: 0,
            });
        }

        const w = weeklyMap.get(wk);
        const records = locData.attendance[dateStr] || [];
        const employees = locData.employees || [];

        let present = 0;
        const names = new Set();

        records.forEach((r) => {
            if (r.checkIn && r.checkOut) {
                present++;
                names.add(r.name);
            }
        });

        const absent = Math.max(0, employees.length - present);

        w.totalPresent += present;
        w.totalAbsent += absent;
        w.days.push(dateStr);
    });

    return Array.from(weeklyMap.values()).sort((a, b) =>
        a.weekKey.localeCompare(b.weekKey)
    );
};

/**
 * Build full exportable report
 */
export const buildFullReport = (appData, buildDailyFn, buildWeeklyFn) => {
    const stamped = new Date();

    const report = {
        version: 1,
        generatedAtISO: stamped.toISOString(),
        locations: appData.locations.slice(),
        currentLocationIndex: appData.currentLocationIndex,
        byLocation: {},
    };

    appData.locations.forEach((locName) => {
        const locData = appData.data[locName] || {
            employees: [],
            attendance: {},
            weeklyHoursConfig: {},
            dailyTopics: {},
            weeklyNotes: {},
            weeklyNotesLog: {},
        };

        const employeesCopy = JSON.parse(JSON.stringify(locData.employees));
        const attendanceCopy = JSON.parse(JSON.stringify(locData.attendance));

        const topicsCopy = {};
        Object.keys(locData.dailyTopics || {}).forEach((d) => {
            topicsCopy[d] = normalizeTopicEntry(locData.dailyTopics[d]);
        });

        const daily = buildDailyFn(locName, locData);
        const weekly = buildWeeklyFn(locName, locData);

        report.byLocation[locName] = {
            employees: employeesCopy,
            attendance: attendanceCopy,
            weeklyHoursConfig: { ...locData.weeklyHoursConfig },
            topics: topicsCopy,
            weeklyNotes: { ...(locData.weeklyNotes || {}) },
            weeklyNotesLog: { ...(locData.weeklyNotesLog || {}) },
            computed: {
                daily,
                weekly,
            },
        };
    });

    return report;
};
