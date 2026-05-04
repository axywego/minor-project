import { initFuseSearch } from './search.js';

export let paintings = [];
export let filteredPaintings = [];

export async function loadPaintings() {
    try {
        const res = await fetch('/api/paintings');
        paintings = await res.json();
        filteredPaintings = [...paintings]; // По умолчанию показываем все
        initFuseSearch(paintings);
    }
    catch (e) {
        console.error('Ошибка загрузки картин:', e);
    }
}

export async function fetchPainting(id) {
    const res = await fetch(`/api/painting/${id}`);
    return await res.json();
}

export async function fetchStats(range) {
    const res = await fetch(`/api/stats?range=${range}`);
    return await res.json();
}

export async function fetchReviews(paintingId) {
    const res = await fetch(`/api/reviews/${paintingId}`);
    const data = await res.json();
    return data;
}

export async function addReview(paintingId, reviewData) {
    const res = await fetch(`/api/reviews/${paintingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
    });
    return await res.json();
}

export async function likeReview(reviewId) {
    const res = await fetch(`/api/reviews/like/${reviewId}`, {
        method: 'POST'
    });
    return await res.json();
}

// --- Админ: картины ---
export async function createPainting(data) {
    const res = await fetch('/api/admin/paintings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function updatePainting(id, data) {
    const res = await fetch(`/api/admin/paintings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function deletePainting(id) {
    const res = await fetch(`/api/admin/paintings/${id}`, {
        method: 'DELETE'
    });
    return await res.json();
}

// --- Админ: отзывы ---
export async function fetchAllReviews() {
    const res = await fetch('/api/admin/reviews');
    return await res.json();
}

export async function approveReview(reviewId) {
    const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST'
    });
    return await res.json();
}

export async function rejectReview(reviewId) {
    const res = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST'
    });
    return await res.json();
}

// Получение уникальных значений для фильтров
export function getFilterOptions() {
    if (!paintings.length) return null;

    // Собираем уникальные направления
    const directions = [...new Set(paintings.map(p => {
        return p.art_direction_ru || p.art_direction_en || p.art_direction_de;
    }))].filter(Boolean).sort();

    // Собираем уникальные техники
    const techniques = [...new Set(paintings.map(p => {
        return p.drawing_technique_ru || p.drawing_technique_en || p.drawing_technique_de;
    }))].filter(Boolean).sort();

    // Собираем года и вычисляем века
    const years = [...new Set(paintings.map(p => p.year))].filter(Boolean).sort((a, b) => b - a);
    const centuries = [...new Set(years.map(y => Math.ceil(y / 100)))].sort();

    // Минимальный и максимальный год
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    return {
        directions,
        techniques,
        years,
        centuries,
        minYear,
        maxYear
    };
}

// Функция фильтрации с учетом текущего языка
export function applyFilters(filters = {}, lang = 'ru') {
    let filtered = [...paintings];
    const activeFilters = {};

    // Собираем только активные фильтры
    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            activeFilters[key] = filters[key];
        }
    });

    // Если нет активных фильтров, возвращаем все картины
    if (Object.keys(activeFilters).length === 0) {
        filteredPaintings = [...paintings];
        return filteredPaintings;
    }

    // Фильтр по направлению искусства
    if (activeFilters.direction) {
        filtered = filtered.filter(p => {
            const directions = [
                p.art_direction_ru,
                p.art_direction_en,
                p.art_direction_de
            ];
            return directions.includes(activeFilters.direction);
        });
    }

    // Фильтр по технике
    if (activeFilters.technique) {
        filtered = filtered.filter(p => {
            const techniques = [
                p.drawing_technique_ru,
                p.drawing_technique_en,
                p.drawing_technique_de
            ];
            return techniques.includes(activeFilters.technique);
        });
    }

    // Фильтр по году (диапазон)
    if (activeFilters.yearFrom || activeFilters.yearTo) {
        const from = activeFilters.yearFrom || 0;
        const to = activeFilters.yearTo || 9999;
        filtered = filtered.filter(p => {
            return p.year >= from && p.year <= to;
        });
    }

    // Фильтр по веку
    if (activeFilters.century) {
        const startYear = (activeFilters.century - 1) * 100 + 1;
        const endYear = activeFilters.century * 100;
        filtered = filtered.filter(p => {
            return p.year >= startYear && p.year <= endYear;
        });
    }

    // Фильтр по конкретному году
    if (activeFilters.year) {
        filtered = filtered.filter(p => p.year === parseInt(activeFilters.year));
    }

    // Фильтр по автору
    if (activeFilters.author) {
        const authorLower = activeFilters.author.toLowerCase();
        filtered = filtered.filter(p => {
            const authors = [
                p.author_ru,
                p.author_en,
                p.author_de
            ].filter(Boolean);

            return authors.some(a => a.toLowerCase().includes(authorLower));
        });
    }

    filteredPaintings = filtered;
    return filteredPaintings;
}

// Получение всех уникальных авторов
export function getAuthors() {
    if (!paintings.length) return [];

    const authorsSet = new Set();
    paintings.forEach(p => {
        if (p.author_ru) authorsSet.add(p.author_ru);
        if (p.author_en) authorsSet.add(p.author_en);
        if (p.author_de) authorsSet.add(p.author_de);
    });

    return [...authorsSet].sort();
}

// Сброс фильтров
export function resetFilters() {
    filteredPaintings = [...paintings];
    return filteredPaintings;
}

// Получение статистики по отфильтрованным картинам
export function getFilteredStats() {
    const filtered = filteredPaintings.length;
    const total = paintings.length;

    return {
        filtered,
        total,
        hasFilters: filtered !== total,
        percentOfTotal: total > 0 ? Math.round((filtered / total) * 100) : 0
    };
}

// добавить в конец файла перед экспортами
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
}