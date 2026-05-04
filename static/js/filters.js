// filters.js - Управление состоянием фильтров
import { applyFilters, resetFilters } from './api.js';

export const activeFilters = {
    direction: null,
    technique: null,
    year: null,
    yearFrom: null,
    yearTo: null,
    century: null,
    author: null
};

export function setFilter(key, value) {
    activeFilters[key] = value;
}

export function setMultipleFilters(filters) {
    Object.keys(filters).forEach(key => {
        if (key in activeFilters) {
            activeFilters[key] = filters[key];
        }
    });
}

export function removeFilter(key) {
    activeFilters[key] = null;
}

export function clearAllFilters() {
    Object.keys(activeFilters).forEach(key => {
        activeFilters[key] = null;
    });
    resetFilters();
}

export function getActiveFilters() {
    const active = {};
    Object.keys(activeFilters).forEach(key => {
        if (activeFilters[key] !== null && 
            activeFilters[key] !== undefined && 
            activeFilters[key] !== '') {
            active[key] = activeFilters[key];
        }
    });
    return active;
}

export function getActiveFiltersCount() {
    return Object.keys(getActiveFilters()).length;
}

export function applyActiveFilters(lang = 'ru') {
    return applyFilters(activeFilters, lang);
}