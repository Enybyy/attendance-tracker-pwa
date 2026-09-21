/**
 * config.js - Application configuration and constants
 */
export const DEFAULT_LOCATIONS = [
    'Losa Deportiva "La Bombonera"',
    'Losa Deportiva "Santa Rosa"',
];

export const DEFAULT_WEEKLY_HOURS = {
    0: 0,  // Domingo
    1: 9,  // Lunes
    2: 9,  // Martes
    3: 9,  // Miércoles
    4: 9,  // Jueves
    5: 9,  // Viernes
    6: 5,  // Sábado
};

export const TIME_PATTERN = /^\d{2}:\d{2}$/;

export const isValidTime = (value) => TIME_PATTERN.test(value);

export const isCompleteAttendanceRecord = (record) => {
    return (
        record &&
        isValidTime(record.checkIn) &&
        isValidTime(record.checkOut)
    );
};

export const createEmptyLocationData = () => ({
    employees: [],
    attendance: {},
    weeklyHoursConfig: { ...DEFAULT_WEEKLY_HOURS },
    dailyTopics: {},
    weeklyNotes: {},
    weeklyNotesLog: {},
});

export const createEmptyAppData = (locations = DEFAULT_LOCATIONS) => {
    const blank = {
        locations: [...locations],
        currentLocationIndex: 0,
        data: {},
        locationDetails: {},
        disabledLocations: [],
    };

    locations.forEach((loc) => {
        blank.data[loc] = createEmptyLocationData();
        blank.locationDetails[loc] = { address: "" };
    });

    return blank;
};
