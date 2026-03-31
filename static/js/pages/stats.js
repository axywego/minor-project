import { translations, currentLang } from '../i18n.js';
import { fetchStats } from '../api.js';

export async function renderStats(container, range) {
	const t = translations[currentLang];

	try {
		console.log('📊 Загрузка статистики для диапазона:', range);
		const stats = await fetchStats(range);
		console.log('📥 Получено данных:', stats);

		// === 1. ПОСТРОЕНИЕ ГРАФИКА ===
		let hourlyData = stats.hourly_stats?.data || [];
		let hourlyLabels = stats.hourly_stats?.labels || [];

		// 🕐 КОРРЕКЦИЯ ЧАСОВОГО ПОЯСА
		// Бэкенд отдаёт UTC, нам нужно локальное время
		const timezoneOffset = new Date().getTimezoneOffset() / 60; // в часах
		const offsetHours = -timezoneOffset; // смещение для добавления

		hourlyLabels = hourlyLabels.map((label, i) => {
			// label формата "00:00", "01:00" и т.д.
			let hour = parseInt(label.split(':')[0]);
			hour = (hour + offsetHours + 24) % 24; // сдвиг с учётом перехода через сутки
			return `${hour.toString().padStart(2, '0')}:00`;
		});

		// Перераспределяем данные по новым часам (если нужно)
		// Если бэкенд уже отдаёт по локальному времени - закомментируй этот блок
		if (offsetHours !== 0) {
			const adjustedData = new Array(24).fill(0);
			hourlyData.forEach((val, i) => {
				let newHour = (i + offsetHours + 24) % 24;
				adjustedData[newHour] = val;
			});
			hourlyData = adjustedData;
		}

		const maxVal = Math.max(...hourlyData, 1);

		// Генерация шкалы Y (5 шагов)
		const yAxisSteps = 5;
		const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
			const val = Math.round((maxVal / yAxisSteps) * i);
			return `<span class="y-axis-label">${val}</span>`;
		}).join('');

		// Генерация столбцов
		const chartBars = hourlyData.map((val, i) => `
			<div class="bar-group">
				<div class="bar" 
					 style="height: ${(val / maxVal) * 100}%;" 
					 data-value="${val}"
					 title="${val} посещений">
				</div>
				<span class="bar-label">${hourlyLabels[i] || ''}</span>
			</div>
		`).join('');

		const chartHtml = `
			<div class="chart-inner">
				<div class="y-axis">${yAxisLabels}</div>
				<div class="chart-bars">${chartBars}</div>
			</div>
		`;

		// === 2. ПОПУЛЯРНЫЕ КАРТИНЫ ===
		const popularPaintings = stats.popular_paintings?.map((p, i) => {
			const title = p[`title_${currentLang}`] || p.title_en;
			const author = p[`author_${currentLang}`] || p.author_en;
			return `<div class="ranking-item" onclick="router('painting', ${p.id})">
				<span class="rank">${i + 1}</span>
				<div class="ranking-info">
					<span class="ranking-title">${title}</span>
					<span class="ranking-author">${author}</span>
				</div>
				<span class="ranking-value">${p.views}</span>
			</div>`;
		}).join('') || '<p>Нет данных</p>';

		// === 3. ПО ЗАДЕРЖКЕ ВНИМАНИЯ ===
		const attentionPaintings = stats.attention_paintings?.map((p, i) => {
			const title = currentLang === 'ru' ? p.title_ru : p.title_en;
			const author = currentLang === 'ru' ? p.author_ru : p.author_en;
			return `<div class="ranking-item" onclick="router('painting', ${p.id})">
				<span class="rank">${i + 1}</span>
				<div class="ranking-info">
					<span class="ranking-title">${title}</span>
					<span class="ranking-author">${author}</span>
				</div>
				<span class="ranking-value">${p.avg_duration_minutes} мин</span>
			</div>`;
		}).join('') || '<p>Нет данных</p>';

		// === 4. СРЕДНИЙ МАРШРУТ ===
		const paintingsRoute = stats.average_paintings_route || [];
		const paintingsRouteHtml = paintingsRoute.length ? paintingsRoute.map((p, i) => `
			<div class="route-step" onclick="router('painting', ${p.id})" style="cursor:pointer;">
				<span class="step-number">${i + 1}</span>
				<span class="step-text">${currentLang === 'ru' ? p.title_ru : p.title_en}</span>
			</div>
			${i < paintingsRoute.length - 1 ? '<div class="route-arrow">↓</div>' : ''}
		`).join('') : '<p>Нет данных</p>';

		// === 5. ФИНАЛЬНЫЙ HTML ===
		container.innerHTML = `
			<section class="container" style="display:flex; flex-direction:column; gap:20px;">
				<button onclick="logout()" class="logout-btn">Exit</button>
				
				<h1 class="page-title" style="margin-top:50px;">${t['section.stats'] || 'Статистика'}</h1>
				
				<!-- Общая информация -->
				<div class="stat-card large">
					<h2 class="stat-card-title">${t['stats.general'] || 'Общая информация'}</h2>
					<div class="stat-content">
						<div class="stat-big-number">
							<span class="number">${stats.total_visits?.toLocaleString() || 0}</span>
							<span class="label">${t['stats.visits'] || 'Посещений за период'}</span>
						</div>
						<div class="stats-row">
							<div class="mini-stat">
								<span class="mini-number">${stats.unique_users?.toLocaleString() || 0}</span>
								<span class="mini-label">${t['stats.unique'] || 'Уникальных посетителей'}</span>
							</div>
							<div class="mini-stat">
								<span class="mini-number">${Math.round((stats.avg_duration_seconds || 0) / 60)} мин</span>
								<span class="mini-label">${t['stats.avg_time'] || 'Среднее время просмотра'}</span>
							</div>
							<div class="mini-stat">
								<span class="mini-number">${stats.paintings_per_user || 0}</span>
								<span class="mini-label">${t['stats.per_visit'] || 'Картин за посещение'}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Сетка: Популярные + Маршрут -->
				<div class="stats-grid">
					<div class="stat-card">
						<h2 class="stat-card-title">🏆 ${t['stats.popular'] || 'Популярные картины'}</h2>
						<div class="ranking-list">${popularPaintings}</div>
					</div>
					<div class="stat-card">
						<h2 class="stat-card-title">📍 ${t['stats.route'] || 'Средний маршрут'}</h2>
						<div class="route-visual">${paintingsRouteHtml}</div>
					</div>
				</div>

				<!-- По задержке внимания -->
				<div class="stat-card">
					<h2 class="stat-card-title">⏱️ ${t['stats.attention'] || 'По задержке внимания'}</h2>
					<div class="ranking-list">${attentionPaintings}</div>
				</div>

				<!-- График посещаемости -->
				<div class="stat-card full-width">
					<h2 class="stat-card-title">📊 ${t['stats.timeline'] || 'Посещаемость по времени'}</h2>
					${chartHtml}
					<div class="chart-filter">
						<label>${t['stats.filter'] || 'Фильтр по времени:'}</label>
						<select class="filter-select" onchange="window.updateStatsRange(this.value)">
							<option value="today" ${range === 'today' ? 'selected' : ''}>${t['time.today'] || 'За сегодня'}</option>
							<option value="week" ${range === 'week' ? 'selected' : ''}>${t['time.week'] || 'За неделю'}</option>
							<option value="month" ${range === 'month' ? 'selected' : ''}>${t['time.month'] || 'За месяц'}</option>
							<option value="year" ${range === 'year' ? 'selected' : ''}>${t['time.year'] || 'За год'}</option>
							<option value="all" ${range === 'all' ? 'selected' : ''}>${t['time.all'] || 'За всё время'}</option>
						</select>
					</div>
				</div>
			</section>
		`;

	} catch (e) {
		console.error('❌ Ошибка загрузки статистики:', e);
		container.innerHTML = `
			<div class="error-state">
				<h2>Ошибка загрузки статистики</h2>
				<p>${e.message}</p>
				<button onclick="location.reload()">Попробовать снова</button>
			</div>
		`;
	}
}

// Глобальная функция для обновления диапазона
window.updateStatsRange = async function (range) {
	console.log('🔄 Смена диапазона на:', range);
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = '<div class="loader">Загрузка...</div>';
		await renderStats(app, range);
	}
};