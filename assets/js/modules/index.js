/**
 * modules/index.js - Main entry point for all modules
 * 
 * This file re-exports all modules for convenience.
 * Import from this file to get access to all functionality.
 */

// Configuration and constants
export * from './config.js';

// Utility functions
export * from './utils.js';

// Hours calculation
export * from './hours.js';

// Employee management
export * from './employees.js';

// Location management  
export * from './locations.js';

// Report building
export * from './reports.js';

// PDF Export
export * from './pdf-export.js';

// Charts
export * from './charts.js';

// UI helpers
export * from './ui.js';
