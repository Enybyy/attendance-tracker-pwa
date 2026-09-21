/**
 * locations.js - Location management utilities
 */

/**
 * Get list of enabled (not disabled) locations
 */
export const getEnabledLocations = (appData) => {
    if (!appData.disabledLocations) appData.disabledLocations = [];
    return (appData.locations || []).filter(
        (loc) => !appData.disabledLocations.includes(loc)
    );
};

/**
 * Toggle location enabled/disabled status
 */
export const toggleLocationEnabled = (appData, locName, enabled, currentLocationName, switchLocationFn, saveDataFn) => {
    if (!appData.disabledLocations) appData.disabledLocations = [];

    if (enabled) {
        // Enable: remove from disabled list
        appData.disabledLocations = appData.disabledLocations.filter(
            (l) => l !== locName
        );
    } else {
        // Disable: add to disabled list
        if (!appData.disabledLocations.includes(locName)) {
            appData.disabledLocations.push(locName);
        }

        // If current location is being disabled, switch to first enabled
        if (currentLocationName === locName) {
            const enabledLocs = getEnabledLocations(appData);
            if (enabledLocs.length > 0) {
                const firstEnabledIdx = appData.locations.indexOf(enabledLocs[0]);
                if (switchLocationFn) switchLocationFn(firstEnabledIdx);
            } else {
                alert("Debe haber al menos una losa habilitada.");
                appData.disabledLocations = appData.disabledLocations.filter(
                    (l) => l !== locName
                );
                return false;
            }
        }
    }

    if (saveDataFn) saveDataFn();
    return true;
};

/**
 * Get location details (address, etc)
 */
export const getLocationDetails = (appData, locName) => {
    if (!appData.locationDetails) appData.locationDetails = {};
    return appData.locationDetails[locName] || { address: "" };
};

/**
 * Set location details
 */
export const setLocationDetails = (appData, locName, details) => {
    if (!appData.locationDetails) appData.locationDetails = {};
    appData.locationDetails[locName] = { ...details };
};

/**
 * Add new location
 */
export const addLocation = (appData, name, address = "") => {
    if (!name || appData.locations.includes(name)) {
        return false;
    }

    appData.locations.push(name);

    appData.data[name] = {
        employees: [],
        attendance: {},
        weeklyHoursConfig: { 0: 0, 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 5 },
        dailyTopics: {},
        weeklyNotes: {},
        weeklyNotesLog: {},
    };

    if (!appData.locationDetails) appData.locationDetails = {};
    appData.locationDetails[name] = { address };

    return true;
};

/**
 * Update location name and/or address
 */
export const updateLocation = (appData, oldName, newName, newAddress) => {
    const idx = appData.locations.indexOf(oldName);
    if (idx === -1) return false;

    // If name changed
    if (newName && newName !== oldName) {
        // Check if new name already exists
        if (appData.locations.includes(newName)) return false;

        appData.locations[idx] = newName;
        appData.data[newName] = appData.data[oldName];
        delete appData.data[oldName];

        if (appData.locationDetails) {
            appData.locationDetails[newName] = appData.locationDetails[oldName] || { address: "" };
            delete appData.locationDetails[oldName];
        }

        // Update disabled list if present
        if (appData.disabledLocations) {
            const disIdx = appData.disabledLocations.indexOf(oldName);
            if (disIdx !== -1) {
                appData.disabledLocations[disIdx] = newName;
            }
        }
    }

    // Update address
    const finalName = newName || oldName;
    if (!appData.locationDetails) appData.locationDetails = {};
    if (!appData.locationDetails[finalName]) appData.locationDetails[finalName] = {};
    appData.locationDetails[finalName].address = newAddress || "";

    return true;
};
