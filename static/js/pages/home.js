import { translations, currentLang } from '../i18n.js';
import { paintings } from '../api.js';
import { PAINTINGS_PER_PAGE, carouselInterval } from '../constants.js';
import { startCarousel, nextSlide, prevSlide } from '../carousel.js';

export async function renderHome(container) {
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

export function renderCarouselSlide(slideIndex) {
  const start = slideIndex * PAINTINGS_PER_PAGE;
  const end = start + PAINTINGS_PER_PAGE;
  const slidePaintings = paintings.slice(start, end);
  const t = translations[currentLang];

  // const title = p[`title_${currentLang}`] || p.title_en;
  // const author = p[`author_${currentLang}`] || p.author_en;

  return `
    <div class="carousel-slide fade-in">
      <div class="paintings-grid">
        ${slidePaintings.map(p => `
          <article class="painting-card" onclick="router('painting', ${p.id})">
            <div class="card-image">
              <img src="${p.image_uri}" alt="${ p[`title_${currentLang}`] || p.title_en }">
              <div class="card-overlay"><span class="view-btn">${t['btn.view']}</span></div>
            </div>
            <div class="card-content">
              <h3 class="card-title">${p[`title_${currentLang}`] || p.title_en}</h3>
              <p class="card-author">${p[`author_${currentLang}`] || p.author_en}</p>
              <p class="card-year">${p.year}</p>
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