// home.js
import { translations, currentLang } from '../i18n.js';
import { paintings, filteredPaintings, getFilterOptions, getFilteredStats } from '../api.js';
import { PAINTINGS_PER_PAGE } from '../constants.js';
import { 
    startCarousel, 
    stopCarousel, 
    nextSlide, 
    prevSlide, 
    resetCarousel, 
    goToSlide,
    createSlideIndicators 
} from '../carousel.js';
import { activeFilters, setFilter, clearAllFilters, getActiveFiltersCount, applyActiveFilters } from '../filters.js';

export async function renderHome(container) {
    const t = translations[currentLang];

    if (window.filtersVisible === undefined) {
        window.filtersVisible = false;
    }

    // Останавливаем и сбрасываем карусель
    stopCarousel();
    resetCarousel();

    // Применяем фильтры
    applyActiveFilters(currentLang);
    
    const totalSlides = Math.ceil(filteredPaintings.length / PAINTINGS_PER_PAGE);
    const filterCount = getActiveFiltersCount();

    const quotes = t['hero.quotes'] || [];
    const randomQuote = quotes.length > 0 
        ? quotes[Math.floor(Math.random() * quotes.length)] 
        : { text: '', author: '' }

    container.innerHTML = `
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title" data-i18n="hero.title">${t['hero.title']}</h1>
                <p class="hero-subtitle" data-i18n="hero.subtitle">${t['hero.subtitle']}</p>
                <div class="hero-quote">
                    <p class="quote-text">${randomQuote.text}</p>
                    <p class="quote-author">— ${randomQuote.author}</p>
                </div>
            </div>
        </section>

        <section class="filters-section">
            <div class="filters-container">
                <div class="filters-header">
                    ${filterCount > 0 ? `
                        <h4 class="filters-count">${t['filters.found'] || 'Найдено'}: ${filteredPaintings.length} ${t['filters.paintings'] || 'картин'}</span>
                    ` : ''}
                </div>
                ${renderFilters(t)}
            </div>
        </section>

        <section class="paintings-section">
            <h2 class="section-title" data-i18n="section.collection">${t['section.collection']}</h2>
            
            ${filteredPaintings.length > 0 ? `
                <div class="carousel-container">
                    <div class="carousel-track" id="carousel-track">
                        ${renderCarouselSlide(0)}
                    </div>
                    
                    ${totalSlides > 1 ? `
                        <div class="carousel-nav">
                            <button class="carousel-btn prev" onclick="window.prevSlide()">❮</button>
                            <button class="carousel-btn next" onclick="window.nextSlide()">❯</button>
                        </div>
                        <div class="carousel-progress">
                            <div class="progress-bar" id="progress-bar"></div>
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="no-results">
                    <div class="no-results-icon">🎨</div>
                    <p class="no-results-text">${t['filters.no_results'] || 'По вашему запросу ничего не найдено'}</p>
                    <p class="no-results-hint">${t['filters.no_results_hint'] || 'Попробуйте изменить параметры фильтрации'}</p>
                    <button class="reset-filters-btn" onclick="window.clearAllFilters()">
                        ${t['filters.reset'] || 'Сбросить фильтры'}
                    </button>
                </div>
            `}
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

    // Устанавливаем обработчики для фильтров
    setupFilterListeners();
    
    // Рендерим маркеры на карте
    renderMapMarkers();
    
    // Запускаем карусель если есть слайды
    if (filteredPaintings.length > 0 && totalSlides > 1) {
        startCarousel();
    }
}

function setupFilterListeners() {
    const directionSelect = document.getElementById('filter-direction');
    const techniqueSelect = document.getElementById('filter-technique');
    const centurySelect = document.getElementById('filter-century');
    const yearFromInput = document.getElementById('filter-year-from');
    const yearToInput = document.getElementById('filter-year-to');
    const clearBtn = document.getElementById('clear-filters-btn');

    const toggleBtn = document.getElementById('toggle-filters-btn');
    toggleBtn?.addEventListener('click', () => {
        window.filtersVisible = !window.filtersVisible;
        const container = document.getElementById('app');
        if (container) renderHome(container);
    });

    const applyAndRerender = () => {
        setFilter('direction', directionSelect?.value || null);
        setFilter('technique', techniqueSelect?.value || null);
        setFilter('century', centurySelect?.value ? parseInt(centurySelect.value) : null);
        
        const container = document.getElementById('app');
        if (container) {
            renderHome(container);
        }
    };

    directionSelect?.addEventListener('change', applyAndRerender);
    techniqueSelect?.addEventListener('change', applyAndRerender);
    centurySelect?.addEventListener('change', applyAndRerender);
    
    // Debounce для ввода годов
    let yearTimeout;
    const applyYearFilter = () => {
        clearTimeout(yearTimeout);
        yearTimeout = setTimeout(() => {
            const fromValue = yearFromInput?.value ? parseInt(yearFromInput.value) : null;
            const toValue = yearToInput?.value ? parseInt(yearToInput.value) : null;
            
            setFilter('yearFrom', fromValue);
            setFilter('yearTo', toValue);
            
            const container = document.getElementById('app');
            if (container) {
                renderHome(container);
            }
        }, 500);
    };
    
    yearFromInput?.addEventListener('input', applyYearFilter);
    yearToInput?.addEventListener('input', applyYearFilter);

    // Очистка всех фильтров
    window.clearAllFilters = () => {
        clearAllFilters();
        const container = document.getElementById('app');
        if (container) {
            renderHome(container);
        }
    };

    clearBtn?.addEventListener('click', window.clearAllFilters);

    // Удаление отдельных фильтров по тегам
    document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterKey = e.target.dataset.filter;
            if (filterKey === 'yearRange') {
                setFilter('yearFrom', null);
                setFilter('yearTo', null);
            } else {
                setFilter(filterKey, null);
            }
            
            const container = document.getElementById('app');
            if (container) {
                renderHome(container);
            }
        });
    });
}

function renderFilters(t) {
    const options = getFilterOptions(currentLang);
    if (!options) return '';

    const filterCount = getActiveFiltersCount();
    const filtersVisible = window.filtersVisible || false;

    return `
        <div class="filters-wrapper">
            <button class="toggle-filters-btn ${filtersVisible ? 'active' : ''}" id="toggle-filters-btn">
                <span class="filter-icon">⚙</span>
                ${filtersVisible ? t['filters.hide'] || 'Скрыть фильтры' : t['filters.show'] || 'Фильтры'}
                ${filterCount > 0 && !filtersVisible ? `<span class="filter-badge">${filterCount}</span>` : ''}
            </button>
            
            <div class="filters-panel ${filtersVisible ? 'visible' : ''}" id="filters-panel">
                <div class="filter-group">
                    <label>${t['filters.direction'] || 'Направление'}</label>
                    <select id="filter-direction" class="filter-select">
                        <option value="">${t['filters.all'] || 'Все'}</option>
                        ${options.directions.map(d => `
                            <option value="${d}" ${activeFilters.direction === d ? 'selected' : ''}>${d}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="filter-group">
                    <label>${t['filters.technique'] || 'Техника'}</label>
                    <select id="filter-technique" class="filter-select">
                        <option value="">${t['filters.all'] || 'Все'}</option>
                        ${options.techniques.map(tech => `
                            <option value="${tech}" ${activeFilters.technique === tech ? 'selected' : ''}>${tech}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="filter-group">
                    <label>${t['filters.century'] || 'Век'}</label>
                    <select id="filter-century" class="filter-select">
                        <option value="">${t['filters.all'] || 'Все'}</option>
                        ${options.centuries.map(c => `
                            <option value="${c}" ${activeFilters.century === c ? 'selected' : ''}>${c} век</option>
                        `).join('')}
                    </select>
                </div>

                <div class="filter-group">
                    <label>${t['filters.year'] || 'Год'}</label>
                    <div class="year-range">
                        <input type="number" id="filter-year-from" class="year-input" 
                               placeholder="${t['filters.from'] || 'От'}"
                               value="${activeFilters.yearFrom || ''}">
                        <span>-</span>
                        <input type="number" id="filter-year-to" class="year-input" 
                               placeholder="${t['filters.to'] || 'До'}"
                               value="${activeFilters.yearTo || ''}">
                    </div>
                </div>

                ${filterCount > 0 ? `
                    <button class="clear-filters-btn" id="clear-filters-btn">
                        ✕ ${t['filters.clear'] || 'Сбросить'} (${filterCount})
                    </button>
                ` : ''}
            </div>
            
            ${filterCount > 0 && !filtersVisible ? `
                <div class="active-filters-tags">
                    ${renderActiveFilterTags(t)}
                </div>
            ` : ''}
        </div>
    `;
}

function renderActiveFilterTags(t) {
    const tags = [];
    
    if (activeFilters.direction) {
        tags.push(`<span class="filter-tag">${activeFilters.direction}<button class="tag-remove" data-filter="direction">×</button></span>`);
    }
    if (activeFilters.technique) {
        tags.push(`<span class="filter-tag">${activeFilters.technique}<button class="tag-remove" data-filter="technique">×</button></span>`);
    }
    if (activeFilters.century) {
        tags.push(`<span class="filter-tag">${activeFilters.century} век<button class="tag-remove" data-filter="century">×</button></span>`);
    }
    if (activeFilters.yearFrom || activeFilters.yearTo) {
        tags.push(`<span class="filter-tag">${activeFilters.yearFrom || '...'}—${activeFilters.yearTo || '...'}<button class="tag-remove" data-filter="yearRange">×</button></span>`);
    }
    
    return tags.join('');
}

export function renderCarouselSlide(slideIndex) {
    const start = slideIndex * PAINTINGS_PER_PAGE;
    const end = start + PAINTINGS_PER_PAGE;
    const slidePaintings = filteredPaintings.slice(start, end);
    const t = translations[currentLang];

    if (slidePaintings.length === 0) return '';

    return `
    <div class="carousel-slide fade-in">
      <div class="paintings-grid">
        ${slidePaintings.map(p => `
          <article class="painting-card" onclick="router('painting', ${p.id})">
            <div class="card-image">
              <img src="${p.image_uri}" alt="${p[`title_${currentLang}`] || p.title_en}">
              <div class="card-overlay"><span class="view-btn">${t['btn.view']}</span></div>
            </div>
            <div class="card-content">
              <h3 class="card-title">${p[`title_${currentLang}`] || p.title_en}</h3>
              <p class="card-author">${p[`author_${currentLang}`] || p.author_en}</p>
              <p class="card-year">${p.year}</p>
              ${p[`art_direction_${currentLang}`] ? 
                `<p class="card-direction">${p[`art_direction_${currentLang}`]}</p>` : ''}
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMapMarkers() {
    const markersContainer = document.getElementById('map-markers');
    if (!markersContainer) return;
    markersContainer.innerHTML = '';
    
    filteredPaintings.forEach(p => {
        if (p.map_x === null || p.map_y === null) return;
        
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.style.left = p.map_x + '%';
        marker.style.top = p.map_y + '%';
        marker.title = p.title_ru || p.title_en || '';
        marker.innerHTML = '<div class="pulse"></div>';
        marker.onclick = (e) => {
            e.stopPropagation();
            router('painting', p.id);
        };
        markersContainer.appendChild(marker);
    });
}