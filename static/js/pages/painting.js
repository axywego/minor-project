import { translations, currentLang } from '../i18n.js';
import { fetchPainting } from '../api.js';
import { parseFacts } from '../utils.js';
import { stopCarousel } from '../carousel.js';

export async function renderPaintingDetail(container, id) {
  const t = translations[currentLang];
  stopCarousel(); // остановка карусели при открытии детальной страницы

  try {
    const p = await fetchPainting(id);
    const lang = currentLang;
    
    p.title = p[`title_${lang}`] || p.title_en;
    p.author = p[`author_${lang}`] || p.author_en;
    p.description = p[`description_${lang}`] || p.description_en;
    p.drawing_technique = p[`drawing_technique_${lang}`] || p.drawing_technique_en;
    p.art_direction = p[`art_direction_${lang}`] || p.art_direction_en;
    const factsRaw = p[`facts_${lang}`] || p.facts_en;
    p.facts = parseFacts(factsRaw);

    container.innerHTML = `
      <div class="painting-detail">
        <div class="container">
          <button onclick="router('home')" class="btn-back">${t['btn.back']}</button>
          <div class="detail-grid">
            <div class="slideshow-section">
              <div class="image-frame">
                <img src="${p.image_uri}" style="width:100%; border-radius:8px;">
              </div>
            </div>
            <div class="info-section">
              <div class="info-card">
                <h1 class="painting-title">${p.title}</h1>
                <p class="painting-author">${p.author}, ${p.year}</p>
                <div class="info-details">
                  <div class="detail-row"><span class="detail-label">${t['details.year_of_creation']}</span><span class="detail-value">${p.year}</span></div>
                  <div class="detail-row"><span class="detail-label">${t['details.drawing_technique']}</span><span class="detail-value">${p.drawing_technique}</span></div>
                  <div class="detail-row"><span class="detail-label">${t['details.dimensions']}</span><span class="detail-value">${p.dimensions} ${t['centimeters']}</span></div>
                  <div class="detail-row"><span class="detail-label">${t['details.art_direction']}</span><span class="detail-value">${p.art_direction}</span></div>
                </div>
                <p style="margin: 20px 0; line-height: 1.6;">${p.description}</p>
              </div>
            </div>
          </div>
          <section class="facts-section">
            <h2 class="section-title">${t['facts.interesting_facts']}</h2>
            <div class="facts-grid">
              ${Object.entries(p.facts).map(([key, value]) => `<div class="fact-card"><h3>${key}</h3><p>${value}</p></div>`).join('')}
            </div>
          </section>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = '<h2>Ошибка загрузки картины</h2>';
  }
}