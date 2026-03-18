import { translations, currentLang } from '../i18n.js';
import { fetchStats } from '../api.js';

export async function renderStats(container, range) {
  const t = translations[currentLang];
  try {
    const stats = await fetchStats(range);

    // Построение графика
    const maxVal = Math.max(...stats.hourly_stats.data);
    const chartBars = stats.hourly_stats.data.map((val, i) => `
      <div class="bar-group">
        <div class="bar" style="height: ${maxVal ? (val / maxVal) * 100 : 20}%"></div>
        <span class="bar-label">${stats.hourly_stats.labels[i]}</span>
      </div>
    `).join('');

    // Популярные по просмотрам
    const popularPaintings = stats.popular_paintings.map((p, i) => {
      const title = p[`title_${currentLang}`] || p.title_en;
      const author = p[`author_${currentLang}`] || p.author_en;
      return `<div class="ranking-item" onclick="router('painting', ${p.id})">
        <span class="rank">${i + 1}</span>
        <div class="ranking-info"><span class="ranking-title">${title}</span><span class="ranking-author">${author}</span></div>
        <span class="ranking-value">${p.views}</span>
      </div>`;
    }).join('');

    // По задержке внимания
    const attentionPaintings = stats.attention_paintings.map((p, i) => {
      const title = currentLang === 'ru' ? p.title_ru : p.title_en;
      const author = currentLang === 'ru' ? p.author_ru : p.author_en;
      return `<div class="ranking-item" onclick="router('painting', ${p.id})">
        <span class="rank">${i + 1}</span>
        <div class="ranking-info"><span class="ranking-title">${title}</span><span class="ranking-author">${author}</span></div>
        <span class="ranking-value">${p.avg_duration_minutes} мин</span>
      </div>`;
    }).join('');

    // Средний маршрут
    const paintingsRoute = stats.average_paintings_route || [];
    const paintingsRouteHtml = paintingsRoute.map((p, i) => {
      const title = currentLang === 'ru' ? p.title_ru : p.title_en;
      return `
      <div class="route-step" onclick="router('painting', ${p.id})" style="cursor:pointer;">
        <span class="step-number">${i + 1}</span>
        <span class="step-text">${title}</span>
      </div>
      ${i < paintingsRoute.length - 1 ? '<div class="route-arrow">↓</div>' : ''}
    `;
    }).join('');

    container.innerHTML = `
      <section class="container" style="display:flex; flex-direction:column; gap:20px;">
        <button onclick="logout()" class="logout-btn">Exit</button>
        <h1 class="page-title" style="margin-top:50px;">${t['section.stats']}</h1>
        <div class="stat-card large">

            <h2 class="stat-card-title">Общая информация</h2>
            <div class="stat-content">
              <div class="stat-big-number">
                <span class="number">${stats.total_visits.toLocaleString()}</span>
                <span class="label">Посещений за период</span>
              </div>
              <div class="stats-row">
                <div class="mini-stat">
                  <span class="mini-number">${stats.unique_users.toLocaleString()}</span>
                  <span class="mini-label">Уникальных посетителей</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-number">${Math.round(stats.avg_duration_seconds / 60)} мин</span>
                  <span class="mini-label">Среднее время просмотра</span>
                </div>
                <div class="mini-stat">
                  <span class="mini-number">${stats.paintings_per_user}</span>
                  <span class="mini-label">Картин за посещение</span>
                </div>
              </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card"><h2 class="stat-card-title">🏆 Популярные картины</h2><div class="ranking-list">${popularPaintings || '<p>Нет данных</p>'}</div></div>
          <div class="stat-card"><h2 class="stat-card-title">📍 Средний маршрут</h2><div class="route-visual">${paintingsRouteHtml || '<p>Нет данных</p>'}</div><div class="route-info">...</div></div>
        </div>
        <div class="stat-card"><h2 class="stat-card-title">⏱️ По задержке внимания</h2><div class="ranking-list">${attentionPaintings || '<p>Нет данных</p>'}</div></div>
        <div class="stat-card full-width">
          <h2 class="stat-card-title">📊 Посещаемость по времени</h2>
          <div class="chart-container">
            <div class="chart-bars">${chartBars}</div>
            <div class="chart-filter">
              <label>Фильтр по времени:</label>
              <select class="filter-select" onchange="window.updateStatsRange(this.value)">
                <option value="today">За сегодня</option>
                <option value="week">За неделю</option>
                <option value="month" selected>За месяц</option>
                <option value="year">За год</option>
                <option value="all">За всё время</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    `;
  } catch (e) {
    container.innerHTML = '<h2>Ошибка загрузки статистики</h2>';
  }
}

window.updateStatsRange = async function (range) {
  const app = document.getElementById('app');
  await renderStats(app, range);
};