const translations = {
    ru: {
        'nav.home': 'Главная',
        'nav.stats': 'Статистика',
        'footer.contacts': 'Контакты',
        'footer.contacts.address': "📍 ул. Искусств, 15, Москва",
        'footer.hours': 'Режим работы',
        'footer.weekdays': 'Пн-Пт: 10:00 - 20:00',
        'footer.holidays': 'Сб-Вс: 11:00 - 22:00',
        'hero.title': 'Национальная Галерея Искусств',
        'hero.subtitle': 'Откройте для себя мир прекрасного в нашей коллекции шедевров мировой живописи',
        'hero.num_of_paintings': "Картин",
        'hero.num_of_painters': "Художников",
        'hero.num_of_halls': "Залов",
        'section.collection': 'Коллекция',
        'section.map': 'Карта галереи',
        'section.map.help': 'Нажмите на точку, чтобы открыть картину',
        'section.stats': 'Статистика посещений',
        'stats.total': 'Всего посещений',
        'stats.unique': 'Уникальных посетителей',
        'stats.popular': 'Популярные картины',
        'stats.chart': 'Активность по времени',
        'btn.view': 'Смотреть',
        'btn.back': '← Назад',
        'btn.favorite': 'Добавить в избранное',
        'search.placeholder': 'Поиск по названию картины и/или автору',
        'facts.interesting_facts': 'Интересные факты',
        'details.year_of_creation': "Год создания:",
        'details.drawing_technique': "Техника:",
        'details.dimensions': 'Размеры:',
        'details.art_direction': "Направление:",
        'centimeters': "см",
        'search_failed': "Ничего не найдено по запросу"
    },
    en: {
        'nav.home': 'Home',
        'nav.stats': 'Statistics',
        'footer.contacts': 'Contacts',
        'footer.contacts.address': "📍 15 Iskusstv Street, Moscow",
        'footer.hours': 'Opening Hours',
        'footer.weekdays': 'Mon-Fri: 10:00 - 20:00',
        'footer.holidays': 'Sat-Sun: 11:00 - 22:00',
        'hero.title': 'National Art Gallery',
        'hero.subtitle': 'Discover the world of beauty in our collection of world painting masterpieces',
        'hero.num_of_paintings': "Paintings",
        'hero.num_of_painters': "Painters",
        'hero.num_of_halls': "Halls",
        'section.collection': 'Collection',
        'section.map': 'Gallery Map',
        'section.map.help': 'Click on point to open the painting',
        'section.stats': 'Visit Statistics',
        'stats.total': 'Total Visits',
        'stats.unique': 'Unique Visitors',
        'stats.popular': 'Popular Paintings',
        'stats.chart': 'Activity by Time',
        'btn.view': 'View',
        'btn.back': '← Back',
        'btn.favorite': 'Add to Favorites',
        'search.placeholder': 'Search by painting name and/or author',
        'facts.interesting_facts': 'Interesting facts',
        'details.year_of_creation': "Year of creation:",
        'details.drawing_technique': "Drawing technique:",
        'details.dimensions': 'Dimensions:',
        'details.art_direction': "Art direction:",
        'centimeters': "sm",
        'search_failed': "Nothing found for your request"
    }
};

let currentLang = 'ru';
let paintings = [];
let carouselInterval = null;
let currentSlide = 0;
const PAINTINGS_PER_PAGE = 4;
const CAROUSEL_DELAY = 10000;
let searchTimeout = null;
let searchResults = [];
let selectedResultIndex = -1;

document.addEventListener('DOMContentLoaded', async () => {
    await loadPaintings();
    setupLiveSearch();
    router('home');
});

function setupLiveSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                hideSearchDropdown();
                searchResults = [];
            }
        }, 250);
    });

    input.addEventListener('keydown', (e) => {
        if (searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedResultIndex = Math.min(selectedResultIndex + 1, searchResults.length - 1);
            updateDropdownSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
            updateDropdownSelection();
        } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
            e.preventDefault();
            const painting = searchResults[selectedResultIndex].item;
            router('painting', painting.id);
            hideSearchDropdown();
            input.value = '';
        } else if (e.key === 'Escape') {
            hideSearchDropdown();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            hideSearchDropdown();
        }
    });

    const closeHandler = (e) => {
        if (!e.target.closest('.search-box')) {
            hideSearchDropdown();
        }
    };
}

function performSearch(query) {
    if (!fuse) {
        console.warn('⚠️ Fuse не инициализирован');
        return;
    }

    const results = fuse.search(query);
    searchResults = results.slice(0, 8);
    selectedResultIndex = -1;

    renderSearchDropdown(query, searchResults);
    console.log('🔍 dropdown элемент:', document.getElementById('search-dropdown'), '| количество .search-box:', document.querySelectorAll('.search-box').length);
}

function renderSearchDropdown(query, results) {
    const searchBox = document.querySelector('.search-box');
    if (!searchBox) return;

    let dropdown = document.getElementById('search-dropdown');

    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.className = 'search-dropdown';
        searchBox.appendChild(dropdown);
    }

    if (results.length === 0) {
        dropdown.innerHTML = `
            <div class="search-item empty" data-i18n="search_failed">
                😔 ${translations[currentLang]['search_failed']} <strong>${escapeHtml(query)}</strong>
            </div>
        `;
    } else {
        dropdown.innerHTML = results.map((result, idx) => {
            const p = result.item;
            const title = currentLang === 'ru' ? p.title_ru : p.title_en;
            const author = currentLang === 'ru' ? p.author_ru : p.author_en;

            const highlightedTitle = highlightFuseMatches(title, result.matches, 'title');
            const highlightedAuthor = highlightFuseMatches(author, result.matches, 'author');

            return `
                <div class="search-item ${idx === selectedResultIndex ? 'selected' : ''}" 
                     data-index="${idx}"
                     onclick="selectSearchResult(${p.id})">
                    <div class="search-result-main">
                        <span class="search-title">${highlightedTitle}</span>
                        <span class="search-author">— ${highlightedAuthor}</span>
                    </div>
                    <div class="search-meta">
                        <span class="search-year">${p.year}</span>
                        ${p.art_direction_ru ? `<span class="search-direction">• ${currentLang === 'ru' ? p.art_direction_ru : p.art_direction_en}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    dropdown.classList.add('show');

    setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) {
            const rect = input.getBoundingClientRect();
            dropdown.style.width = `${rect.width}px`;
        }
    }, 0);
}

function highlightFuseMatches(text, matches, fieldType) {
    if (!matches || !text) return escapeHtml(text);

    const fieldMatches = matches.filter(m => m.key === fieldType);
    if (fieldMatches.length === 0) return escapeHtml(text);

    const indices = new Set();
    fieldMatches.forEach(m => {
        m.indices.forEach(([start, end]) => {
            for (let i = start; i <= end; i++) indices.add(i);
        });
    });

    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = escapeHtml(text[i]);
        if (indices.has(i)) {
            result += `<mark>${char}</mark>`;
        } else {
            result += char;
        }
    }
    return result;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateDropdownSelection() {
    const items = document.querySelectorAll('#search-dropdown .search-item:not(.empty)');
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === selectedResultIndex);
    });

    const selected = document.querySelector('#search-dropdown .search-item.selected');
    if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
    }
}

function hideSearchDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        setTimeout(() => {
            if (!dropdown.classList.contains('show')) {
                dropdown.innerHTML = '';
            }
        }, 150);
    }
    selectedResultIndex = -1;
}

window.selectSearchResult = function (paintingId) {
    router('painting', paintingId);
    hideSearchDropdown();
    document.getElementById('search-input').value = '';
};

function changeLanguage(lang) {
    if (lang === currentLang) return;

    const app = document.getElementById('app');

    app.classList.add('fade-out');

    setTimeout(() => {
        currentLang = lang;
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = translations[lang]['search.placeholder'];
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        router(state.currentView, state.currentParam);

        requestAnimationFrame(() => {
            app.classList.remove('fade-out');
        });

    }, 300);
}

let state = { currentView: 'home', currentParam: null };

async function router(view, param = null) {
    state.currentView = view;
    state.currentParam = param;

    if (view !== 'home' && carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }

    const app = document.getElementById('app');

    if (!app.classList.contains('fade-out')) {
        app.innerHTML = '<div class="loader">Загрузка...</div>';
    }

    if (view === 'home') {
        await renderHome(app);
    } else if (view === 'painting') {
        await renderPaintingDetail(app, param);
    } else if (view === 'stats') {
        await renderStats(app);
    }

    //await renderStats(app);

    if (!app.querySelector('.app-content')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'app-content';
        while (app.firstChild) {
            wrapper.appendChild(app.firstChild);
        }
        app.appendChild(wrapper);
    }
}

let fuse = null;

async function loadPaintings() {
    try {
        const res = await fetch('/api/paintings');
        paintings = await res.json();

        initFuseSearch();
    } catch (e) {
        console.error("Ошибка:", e);
    }
}

function initFuseSearch() {
    fuse = new Fuse(paintings, {
        keys: [
            { name: 'title_ru', weight: 2 },
            { name: 'title_en', weight: 2 },
            { name: 'author_ru', weight: 1.5 },
            { name: 'author_en', weight: 1.5 },
            { name: 'art_direction_ru', weight: 1 },
            { name: 'art_direction_en', weight: 1 },
        ],
        threshold: 0.4,
        distance: 100,
        ignoreLocation: true,
        includeMatches: true,
        includeScore: true,
        minMatchCharLength: 2,
        findAllMatches: true,
        useExtendedSearch: true,
    });
}

async function renderHome(container) {
    const t = translations[currentLang];

    if (carouselInterval) {
        clearInterval(carouselInterval);
    }

    const totalSlides = Math.ceil(paintings.length / PAINTINGS_PER_PAGE);

    container.innerHTML = `
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title" data-i18n="hero.title">${t['hero.title']}</h1>
                <p class="hero-subtitle" data-i18n="hero.subtitle">${t['hero.subtitle']}</p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">${paintings.length}+</span>
                        <span class="stat-label" data-i18n="hero.num_of_paintings">${t['hero.num_of_paintings']}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">150</span>
                        <span class="stat-label" data-i18n="hero.num_of_painters">${t['hero.num_of_painters']}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">25</span>
                        <span class="stat-label" data-i18n="hero.num_of_halls">${t['hero.num_of_halls']}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="paintings-section">
            <h2 class="section-title" data-i18n="section.collection">${t['section.collection']}</h2>
            
            <div class="carousel-container">
                <div class="carousel-track" id="carousel-track">
                    ${renderCarouselSlide(0)}
                </div>
                
                <div class="carousel-nav">
                    <button class="carousel-btn prev" onclick="prevSlide()">❮</button>
                    <button class="carousel-btn next" onclick="nextSlide()">❯</button>
                </div>
                
                <div class="carousel-progress">
                    <div class="progress-bar" id="progress-bar"></div>
                </div>
            </div>
        </section>

        <section class="map-section">
            <h2 class="section-title" data-i18n="section.map">${t['section.map']}</h2>
            <div class="map-container">
                <div class="interactive-map">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Museum_floor_plan.svg/1200px-Museum_floor_plan.svg.png" 
                         class="map-bg" alt="Plan">
                    <div id="map-markers"></div>
                </div>
                <p style="text-align:center; margin-top:10px; color:#666;" data-i18n="section.map.help">${t['section.map.help']}</p>
            </div>
        </section>
    `;

    renderMapMarkers();
    startCarousel();
}

function parseFacts(factsString, options = {}) {
    const {
        strict = false,
        trimValues = true
    } = options;

    if (!factsString || typeof factsString !== 'string') {
        return {};
    }

    const result = {};
    const pairs = factsString.trim().replace(/;+$/, '').split(';');

    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].trim();
        if (!pair) continue;

        if (!pair.includes(':')) {
            if (strict) {
                throw new Error(`Pair #${i + 1} has no ':' separator: "${pair}"`);
            }
            continue;
        }

        const [key, ...valueParts] = pair.split(':');
        let keyClean = key;
        let valueClean = valueParts.join(':');

        if (trimValues) {
            keyClean = keyClean.trim();
            valueClean = valueClean.trim();
        }
        if (!keyClean && strict) {
            throw new Error(`Pair #${i + 1} has empty key`);
        }
        if (keyClean) {
            result[keyClean] = valueClean;
        }
    }
    return result;
}

async function renderPaintingDetail(container, id) {
    const t = translations[currentLang];

    try {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }

        fetch('/api/pause-carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const res = await fetch(`/api/painting/${id}`);
        var p = await res.json();

        const isRu = currentLang === 'ru';
        p.title = isRu ? p.title_ru : p.title_en;
        p.author = isRu ? p.author_ru : p.author_en;
        p.description = isRu ? p.description_ru : p.description_en;
        p.drawing_technique = isRu ? p.drawing_technique_ru : p.drawing_technique_en;
        p.art_direction = isRu ? p.art_direction_ru : p.art_direction_en;
        const factsRaw = isRu ? p.facts_ru : p.facts_en;
        p.facts = parseFacts(factsRaw);

        fetch('/api/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ painting_id: id, duration: 300 })
        });

        container.innerHTML = `
            <div class="painting-detail">
                <div class="container">
                    <button onclick="router('home')" class="btn-back" data-i18n="btn.back">${t['btn.back']}</button>
                    <div class="detail-grid">
                        <div class="slideshow-section">
                            <div class="image-frame">
                                <img src="${p.image_uri}" style="width:100%; border-radius:8px;" 
                                    onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">
                            </div>
                        </div>
                        <div class="info-section">
                            <div class="info-card">
                                <h1 class="painting-title">${p.title}</h1>
                                <p class="painting-author">${p.author}, ${p.year}</p>
                                <div class="info-details">
                                    <div class="detail-row">
                                        <span class="detail-label" data-i18n="details.year_of_creation">${t['details.year_of_creation']}</span>
                                        <span class="detail-value">${p.year}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label" data-i18n="details.drawing_technique">${t['details.drawing_technique']}</span>
                                        <span class="detail-value">${p.drawing_technique}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label" data-i18n="details.dimensions">${t['details.dimensions']}</span>
                                        <span class="detail-value">${p.dimensions} ${t['centimeters']}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label" data-i18n="details.art_direction">${t['details.art_direction']}</span>
                                        <span class="detail-value">${p.art_direction}</span>
                                    </div>
                                </div>
                                <p style="margin: 20px 0; line-height: 1.6;">${p.description}</p>
                            </div>
                        </div>
                    </div>
                    <section class="facts-section">
                        <h2 class="section-title" data-i18n="facts.interesting_facts">${t['facts.interesting_facts']}</h2>
                        <div class="facts-grid">
                            ${Object.entries(p.facts).map(([key, value]) => `
                                <div class="fact-card">
                                    <h3>${key}</h3>
                                    <p>${value}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = '<h2>Ошибка загрузки картины</h2>';
    }
}

async function renderStats(container) {
    const t = translations[currentLang];

    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();

        const chartBars = stats.hourly_stats.data.map((val, i) => {
            const height = Math.max((val / Math.max(...stats.hourly_stats.data)) * 100, 20);
            return `
                <div class="bar-group">
                    <div class="bar" style="height: ${height}%"></div>
                    <span class="bar-label">${stats.hourly_stats.labels[i]}</span>
                </div>
            `;
        }).join('');

        const popularPaintings = stats.popular_paintings.slice(0, 5).map((p, i) => `
            <div class="ranking-item" onclick="router('painting', ${p.id})">
                <span class="rank">${i + 1}</span>
                <div class="ranking-info">
                    <span class="ranking-title">${p.title}</span>
                    <span class="ranking-author">${p.author}</span>
                </div>
                <span class="ranking-value">${p.views.toLocaleString()}</span>
            </div>
        `).join('');

        const averageRoute = [
            'Зал импрессионистов',
            'Классическая живопись',
            'Современное искусство',
            'Скульптуры'
        ];

        const routeHtml = averageRoute.map((step, i) => `
            <div class="route-step">
                <span class="step-number">${i + 1}</span>
                <span class="step-text">${step}</span>
            </div>
            ${i < averageRoute.length - 1 ? '<div class="route-arrow">↓</div>' : ''}
        `).join('');

        const attentionPaintings = (stats.attention_paintings || stats.popular_paintings).slice(0, 4).map((p, i) => `
            <div class="ranking-item" onclick="router('painting', ${p.id})">
                <span class="rank">${i + 1}</span>
                <div class="ranking-info">
                    <span class="ranking-title">${p.title}</span>
                    <span class="ranking-author">${p.author}</span>
                </div>
                <span class="ranking-value">${p.avg_time || (8.5 - i * 1.3).toFixed(1)} мин</span>
            </div>
        `).join('');

        container.innerHTML = `
            <section class="container" style="display:flex; flex-direction:column; gap:20px;">
                <h1 class="page-title" style="margin-top:50px;">Статистика посещений</h1>
                
                <div class="stat-card large">
                    <h2 class="stat-card-title">Общая информация</h2>
                    <div class="stat-content">
                        <div class="stat-big-number">
                            <span class="number">${stats.total_visits.toLocaleString()}</span>
                            <span class="label">Посещений за год</span>
                        </div>
                        <div class="stats-row">
                            <div class="mini-stat">
                                <span class="mini-number">${stats.unique_users.toLocaleString()}</span>
                                <span class="mini-label">Уникальных посетителей</span>
                            </div>
                            <div class="mini-stat">
                                <span class="mini-number">12 мин</span>
                                <span class="mini-label">Среднее время на сайте</span>
                            </div>
                            <div class="mini-stat">
                                <span class="mini-number">3,8</span>
                                <span class="mini-label">Картины за посещение</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <h2 class="stat-card-title">🏆 Популярные картины</h2>
                        <div class="ranking-list">
                            ${popularPaintings}
                        </div>
                    </div>

                    <div class="stat-card">
                        <h2 class="stat-card-title">📍 Средний маршрут</h2>
                        <div class="route-visual">
                            ${routeHtml}
                        </div>
                        <div class="route-info">На основе данных о перемещениях пользователей</div>
                    </div>
                </div>

                <div class="stat-card">
                    <h2 class="stat-card-title">⏱️ По задержке внимания</h2>
                    <div class="ranking-list">
                        ${attentionPaintings}
                    </div>
                </div>

                <div class="stat-card full-width">
                    <h2 class="stat-card-title">📊 Посещаемость по времени</h2>
                    <div class="chart-container">
                        <div class="chart-bars">
                            ${chartBars}
                        </div>
                        <div class="chart-filter">
                            <label>Фильтр по времени:</label>
                            <select class="filter-select" onchange="updateChartRange(this.value)">
                                <option value="today">За сегодня</option>
                                <option value="week">За неделю</option>
                                <option value="month" selected>За месяц</option>
                                <option value="year">За год</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Error loading stats:', e);
        container.innerHTML = '<h2>Ошибка загрузки статистики</h2>';
    }
}

window.updateChartRange = function (range) {
    console.log('Update range:', range);
};

window.updateChartRange = function (range) {
    const customRange = document.getElementById('custom-date-range');
    if (range === 'custom') {
        customRange.style.display = 'block';
    } else {
        customRange.style.display = 'none';
        fetch(`/api/stats?range=${range}`).then(res => res.json()).then(data => {
            renderChart(data);
        });
    }
};

window.applyCustomDateRange = function () {
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;

    if (from && to) {
        fetch(`/api/stats?from=${from}&to=${to}`)
            .then(res => res.json())
            .then(data => {
                renderChart(data);
            });
    }
};

function renderChart(stats) {
    const chartContainer = document.querySelector('.chart-bars');
    if (!chartContainer) return;

    const bars = stats.hourly_stats.data.map((val, i) => {
        const height = Math.min((val / Math.max(...stats.hourly_stats.data)) * 200, 200);
        return `<div class="bar-group">
            <div class="bar" style="height:${height}px"></div>
            <span class="bar-label">${stats.hourly_stats.labels[i]}</span>
        </div>`;
    }).join('');

    chartContainer.innerHTML = bars;
}

function renderMapMarkers() {
    const markersContainer = document.getElementById('map-markers');
    if (!markersContainer) return;

    markersContainer.innerHTML = '';

    paintings.forEach(p => {
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.style.left = p.map_x + '%';
        marker.style.top = p.map_y + '%';
        marker.title = p.title;
        marker.innerHTML = '<div class="pulse"></div>';
        marker.onclick = (e) => {
            e.stopPropagation();
            router('painting', p.id);
        };
        markersContainer.appendChild(marker);
    });
}

function handleSearch() {
    const input = document.getElementById('search-input');
    const query = input.value.trim();

    if (!query || query.length < 2) {
        setTimeout(() => input.classList.remove('shake'), 500);
        return;
    }

    performSearch(query);
    input.focus();
}

function renderCarouselSlide(slideIndex) {
    const start = slideIndex * PAINTINGS_PER_PAGE;
    const end = start + PAINTINGS_PER_PAGE;
    const slidePaintings = paintings.slice(start, end);
    const t = translations[currentLang];

    return `
        <div class="carousel-slide fade-in">
            <div class="paintings-grid">
                ${slidePaintings.map(p => `
                    <article class="painting-card" onclick="router('painting', ${p.id})">
                        <div class="card-image">
                            <img src="${p.image_uri}" alt="${currentLang === 'ru' ? p.title_ru : p.title_en}" 
                                 onerror="this.src='https://via.placeholder.com/400x500?text=No+Image'">
                            <div class="card-overlay">
                                <span class="view-btn" data-i18n="btn.view">${t['btn.view']}</span>
                            </div>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">${currentLang === 'ru' ? p.title_ru : p.title_en}</h3>
                            <p class="card-author">${currentLang === 'ru' ? p.author_ru : p.author_en}</p>
                            <p class="card-year">${p.year}</p>
                        </div>
                    </article>
                `).join('')}
            </div>
        </div>
    `;
}

function startCarousel() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;

    progressBar.style.animation = 'none';
    progressBar.offsetHeight;
    progressBar.style.animation = `progress ${CAROUSEL_DELAY / 1000}s linear`;

    carouselInterval = setInterval(() => {
        nextSlide();
    }, CAROUSEL_DELAY);
}

function nextSlide() {
    const totalSlides = Math.ceil(paintings.length / PAINTINGS_PER_PAGE);
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    const totalSlides = Math.ceil(paintings.length / PAINTINGS_PER_PAGE);
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const progressBar = document.getElementById('progress-bar');

    if (!track) return;

    track.style.opacity = '0';
    track.style.transform = 'translateY(20px)';

    setTimeout(() => {
        track.innerHTML = renderCarouselSlide(currentSlide);

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        track.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        track.style.opacity = '1';
        track.style.transform = 'translateY(0)';

        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.offsetHeight;
            progressBar.style.animation = `progress ${CAROUSEL_DELAY / 1000}s linear`;
        }

        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
        startCarousel();
    }, 500);
}