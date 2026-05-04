// import { translations, currentLang } from '../i18n.js';
// import { fetchStats } from '../api.js';

// export async function renderStats(container, range) {
// 	const t = translations[currentLang];

// 	try {
// 		console.log('📊 Загрузка статистики для диапазона:', range);
// 		const stats = await fetchStats(range);
// 		console.log('📥 Получено данных:', stats);

// 		// === 1. ПОСТРОЕНИЕ ГРАФИКА В ЗАВИСИМОСТИ ОТ ДИАПАЗОНА ===
// 		let chartData = [];
// 		let chartLabels = [];
// 		let chartTitle = '';
		
// 		// Определяем, какой тип данных использовать
// 		if (range === 'today' || range === 'week') {
// 			// Для дня и недели - почасовой график
// 			chartData = stats.hourly_stats?.data || [];
// 			chartLabels = stats.hourly_stats?.labels || [];
// 			chartTitle = t['stats.by_hours'] || 'По часам';
			
// 			// Если данных нет, создаем пустой массив из 24 элементов
// 			if (chartData.length === 0) {
// 				chartData = new Array(24).fill(0);
// 				chartLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
// 			}
// 		} else if (range === 'month') {
// 			// Для месяца - по дням
// 			chartData = stats.daily_stats?.data || [];
// 			chartLabels = stats.daily_stats?.labels || [];
// 			chartTitle = t['stats.by_days'] || 'По дням';
			
// 			// Если данных нет, создаем пустой массив для текущего месяца
// 			if (chartData.length === 0) {
// 				const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
// 				chartData = new Array(daysInMonth).fill(0);
// 				chartLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
// 			}
// 		} else {
// 			// Для года и всего времени - по месяцам
// 			chartData = stats.monthly_stats?.data || [];
// 			chartLabels = stats.monthly_stats?.labels || [];
// 			chartTitle = range === 'year' ? (t['stats.by_months'] || 'По месяцам') : (t['stats.by_years'] || 'По годам');
			
// 			// Если данных нет, создаем пустой массив
// 			if (chartData.length === 0) {
// 				if (range === 'year') {
// 					chartData = new Array(12).fill(0);
// 					const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
// 					chartLabels = months;
// 				} else {
// 					chartData = new Array(5).fill(0);
// 					const currentYear = new Date().getFullYear();
// 					chartLabels = Array.from({ length: 5 }, (_, i) => `${currentYear - 4 + i}`);
// 				}
// 			}
// 		}

// 		// Находим максимальное значение для масштабирования
// 		const maxVal = Math.max(...chartData, 1);
		
// 		// Генерация шкалы Y (5 шагов)
// 		const yAxisSteps = 5;
// 		const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
// 			const val = Math.round((maxVal / yAxisSteps) * i);
// 			return `<span class="y-axis-label">${val}</span>`;
// 		}).join('');

// 		// Генерация столбцов с правильным вычислением высоты
// 		const chartBars = chartData.map((val, i) => {
// 			// Вычисляем высоту в процентах, минимум 2% для видимости нулевых значений
// 			const heightPercent = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 2 : 0) : 0;
			
// 			return `
// 				<div class="bar-group">
// 					<div class="bar-wrapper" style="height: 100%;">
// 						<div class="bar" 
// 							 style="height: ${heightPercent}%;" 
// 							 data-value="${val}"
// 							 title="${val} ${getTitleForRange(range, t)}">
// 						</div>
// 					</div>
// 					<span class="bar-label">${chartLabels[i] || ''}</span>
// 				</div>
// 			`;
// 		}).join('');

// 		const chartHtml = `
// 			<div class="chart-container">
// 				<div class="chart-header">
// 					<h3 class="chart-subtitle">${chartTitle}</h3>
// 				</div>
// 				<div class="chart-inner">
// 					<div class="y-axis">${yAxisLabels}</div>
// 					<div class="chart-bars ${chartData.length > 15 ? 'many-bars' : ''}">${chartBars}</div>
// 				</div>
// 			</div>
// 		`;

// 		// === 2. ПОПУЛЯРНЫЕ КАРТИНЫ ===
// 		const popularPaintings = stats.popular_paintings?.map((p, i) => {
// 			const title = p[`title_${currentLang}`] || p.title_en || 'Без названия';
// 			const author = p[`author_${currentLang}`] || p.author_en || 'Неизвестный автор';
// 			return `<div class="ranking-item" onclick="router('painting', ${p.id})">
// 				<span class="rank">${i + 1}</span>
// 				<div class="ranking-info">
// 					<span class="ranking-title">${title}</span>
// 					<span class="ranking-author">${author}</span>
// 				</div>
// 				<span class="ranking-value">${p.views || 0}</span>
// 			</div>`;
// 		}).join('') || '<p class="no-data">Нет данных</p>';

// 		// === 3. ПО ЗАДЕРЖКЕ ВНИМАНИЯ ===
// 		const attentionPaintings = stats.attention_paintings?.map((p, i) => {
// 			const title = p[`title_${currentLang}`] || p.title_en || 'Без названия';
// 			const author = p[`author_${currentLang}`] || p.author_en || 'Неизвестный автор';
// 			return `<div class="ranking-item" onclick="router('painting', ${p.id})">
// 				<span class="rank">${i + 1}</span>
// 				<div class="ranking-info">
// 					<span class="ranking-title">${title}</span>
// 					<span class="ranking-author">${author}</span>
// 				</div>
// 				<span class="ranking-value">${p.avg_duration_minutes || 0} мин</span>
// 			</div>`;
// 		}).join('') || '<p class="no-data">Нет данных</p>';

// 		// === 4. СРЕДНИЙ МАРШРУТ ===
// 		const paintingsRoute = stats.average_paintings_route || [];
// 		const paintingsRouteHtml = paintingsRoute.length ? paintingsRoute.map((p, i) => `
// 			<div class="route-step" onclick="router('painting', ${p.id})" style="cursor:pointer;">
// 				<span class="step-number">${i + 1}</span>
// 				<span class="step-text">${p[`title_${currentLang}`] || p.title_en || 'Без названия'}</span>
// 			</div>
// 			${i < paintingsRoute.length - 1 ? '<div class="route-arrow">↓</div>' : ''}
// 		`).join('') : '<p class="no-data">Нет данных</p>';

// 		// === 5. ФИНАЛЬНЫЙ HTML ===
// 		container.innerHTML = `
// 			<section class="stats-page">
// 				<div class="container">
// 					<button onclick="logout()" class="logout-btn">Exit</button>
					
// 					<h1 class="page-title">${t['section.stats'] || 'Статистика'}</h1>
					
// 					<!-- Общая информация -->
// 					<div class="stat-card large">
// 						<h2 class="stat-card-title">${t['stats.general'] || 'Общая информация'}</h2>
// 						<div class="stat-content">
// 							<div class="stat-big-number">
// 								<span class="number">${(stats.total_visits || 0).toLocaleString()}</span>
// 								<span class="label">${t['stats.visits'] || 'Посещений за период'}</span>
// 							</div>
// 							<div class="stats-row">
// 								<div class="mini-stat">
// 									<span class="mini-number">${(stats.unique_users || 0).toLocaleString()}</span>
// 									<span class="mini-label">${t['stats.unique'] || 'Уникальных посетителей'}</span>
// 								</div>
// 								<div class="mini-stat">
// 									<span class="mini-number">${Math.round((stats.avg_duration_seconds || 0) / 60)} мин</span>
// 									<span class="mini-label">${t['stats.avg_time'] || 'Среднее время просмотра'}</span>
// 								</div>
// 								<div class="mini-stat">
// 									<span class="mini-number">${stats.paintings_per_user || 0}</span>
// 									<span class="mini-label">${t['stats.per_visit'] || 'Картин за посещение'}</span>
// 								</div>
// 							</div>
// 						</div>
// 					</div>

// 					<!-- Сетка: Популярные + Маршрут -->
// 					<div class="stats-grid">
// 						<div class="stat-card">
// 							<h2 class="stat-card-title">🏆 ${t['stats.popular'] || 'Популярные картины'}</h2>
// 							<div class="ranking-list">${popularPaintings}</div>
// 						</div>
// 						<div class="stat-card">
// 							<h2 class="stat-card-title">📍 ${t['stats.route'] || 'Средний маршрут'}</h2>
// 							<div class="route-visual">${paintingsRouteHtml}</div>
// 						</div>
// 					</div>

// 					<!-- По задержке внимания -->
// 					<div class="stat-card">
// 						<h2 class="stat-card-title">⏱️ ${t['stats.attention'] || 'По задержке внимания'}</h2>
// 						<div class="ranking-list">${attentionPaintings}</div>
// 					</div>

// 					<!-- График посещаемости -->
// 					<div class="stat-card full-width">
// 						<h2 class="stat-card-title">📊 ${t['stats.timeline'] || 'Посещаемость'}</h2>
// 						${chartHtml}
// 						<div class="chart-filter">
// 							<label>${t['stats.filter'] || 'Фильтр по времени:'}</label>
// 							<select class="filter-select" id="stats-range-select">
// 								<option value="today" ${range === 'today' ? 'selected' : ''}>${t['time.today'] || 'За сегодня'}</option>
// 								<option value="week" ${range === 'week' ? 'selected' : ''}>${t['time.week'] || 'За неделю'}</option>
// 								<option value="month" ${range === 'month' ? 'selected' : ''}>${t['time.month'] || 'За месяц'}</option>
// 								<option value="year" ${range === 'year' ? 'selected' : ''}>${t['time.year'] || 'За год'}</option>
// 								<option value="all" ${range === 'all' ? 'selected' : ''}>${t['time.all'] || 'За всё время'}</option>
// 							</select>
// 						</div>
// 					</div>
// 				</div>
// 			</section>
// 		`;

// 		// Добавляем обработчик изменения диапазона
// 		const selectElement = document.getElementById('stats-range-select');
// 		if (selectElement) {
// 			selectElement.addEventListener('change', async (e) => {
// 				const newRange = e.target.value;
// 				console.log('🔄 Смена диапазона на:', newRange);
				
// 				// Показываем лоадер
// 				const chartContainer = document.querySelector('.chart-container');
// 				if (chartContainer) {
// 					chartContainer.innerHTML = '<div class="loader">Загрузка...</div>';
// 				}
				
// 				// Загружаем новые данные и обновляем ВСЮ страницу
// 				const app = document.getElementById('app');
// 				if (app) {
// 					await renderStats(app, newRange);
// 				}
// 			});
// 		}

// 	} catch (e) {
// 		console.error('❌ Ошибка загрузки статистики:', e);
// 		container.innerHTML = `
// 			<div class="error-state">
// 				<h2>Ошибка загрузки статистики</h2>
// 				<p>${e.message}</p>
// 				<button onclick="location.reload()">Попробовать снова</button>
// 			</div>
// 		`;
// 	}
// }

// // Вспомогательная функция для получения правильного текста в тултипе
// function getTitleForRange(range, t) {
// 	switch(range) {
// 		case 'today':
// 		case 'week':
// 			return t['stats.visits_per_hour'] || 'посещений в час';
// 		case 'month':
// 			return t['stats.visits_per_day'] || 'посещений в день';
// 		case 'year':
// 			return t['stats.visits_per_month'] || 'посещений в месяц';
// 		default:
// 			return t['stats.visits_per_year'] || 'посещений в год';
// 	}
// }

// // Глобальная функция для обновления диапазона
// window.updateStatsRange = async function (range) {
// 	console.log('🔄 Смена диапазона на:', range);
// 	const app = document.getElementById('app');
// 	if (app) {
// 		app.innerHTML = '<div class="loader">Загрузка...</div>';
// 		await renderStats(app, range);
// 	}
// };

import { translations, currentLang } from '../i18n.js';
import { fetchStats } from '../api.js';

export async function renderStats(container, range) {
	const t = translations[currentLang];

	try {
		console.log('\n' + '='.repeat(60));
		console.log('📊 [ФРОНТЕНД] ЗАГРУЗКА СТАТИСТИКИ');
		console.log('📊 [ФРОНТЕНД] Диапазон:', range);
		console.log('='.repeat(60));
		
		const stats = await fetchStats(range);
		
		console.log('📥 [ФРОНТЕНД] Получены данные от сервера:');
		console.log('  - total_visits:', stats.total_visits);
		console.log('  - unique_users:', stats.unique_users);
		console.log('  - avg_duration_seconds:', stats.avg_duration_seconds);
		console.log('  - paintings_per_user:', stats.paintings_per_user);
		console.log('  - Ключи в ответе:', Object.keys(stats));
		
		// Проверяем наличие разных типов статистики
		if (stats.hourly_stats) {
			console.log('  ✓ Есть hourly_stats:', stats.hourly_stats.data.length, 'значений');
		}
		if (stats.daily_stats) {
			console.log('  ✓ Есть daily_stats:', stats.daily_stats.data.length, 'значений');
		}
		if (stats.monthly_stats) {
			console.log('  ✓ Есть monthly_stats:', stats.monthly_stats.data.length, 'значений');
		}
		
		// === 1. ОПРЕДЕЛЯЕМ ТИП ДАННЫХ ДЛЯ ГРАФИКА ===
		let chartData = [];
		let chartLabels = [];
		let chartTitle = '';
		let dataType = '';
		
		console.log('\n📈 [ФРОНТЕНД] ОПРЕДЕЛЕНИЕ ТИПА ГРАФИКА:');
		
		if (range === 'today') {
			console.log('  → Диапазон: СЕГОДНЯ - используем hourly_stats');
			chartData = stats.hourly_stats?.data || [];
			chartLabels = stats.hourly_stats?.labels || [];
			chartTitle = t['stats.by_hours'] || 'По часам';
			dataType = 'hourly_stats';
			
			// Если данных нет, создаем пустой массив из 24 элементов
			if (chartData.length === 0) {
				console.warn('  ⚠️ Нет данных, создаем пустой массив из 24 часов');
				chartData = new Array(24).fill(0);
				chartLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
			}
		} else if (range === 'week') {
			console.log('  → Диапазон: НЕДЕЛЯ - используем daily_stats');
			chartData = stats.daily_stats?.data || [];
			chartLabels = stats.daily_stats?.labels || [];
			chartTitle = t['stats.by_days'] || 'По дням';
			dataType = 'daily_stats (7 дней)';
			
			// Если данных нет, создаем пустой массив из 7 элементов
			if (chartData.length === 0) {
				console.warn('  ⚠️ Нет данных, создаем пустой массив из 7 дней');
				chartData = new Array(7).fill(0);
				const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
				const today = new Date();
				chartLabels = Array.from({ length: 7 }, (_, i) => {
					const day = new Date(today);
					day.setDate(today.getDate() - 6 + i);
					const weekday = day.getDay();
					const dayIndex = weekday === 0 ? 6 : weekday - 1;
					return `${dayNames[dayIndex]} ${day.getDate().toString().padStart(2, '0')}.${(day.getMonth() + 1).toString().padStart(2, '0')}`;
				});
			}
		} else if (range === 'month') {
			console.log('  → Диапазон: МЕСЯЦ - используем daily_stats');
			chartData = stats.daily_stats?.data || [];
			chartLabels = stats.daily_stats?.labels || [];
			chartTitle = t['stats.by_days'] || 'По дням';
			dataType = 'daily_stats (30 дней)';
			
			// Если данных нет, создаем пустой массив для текущего месяца
			if (chartData.length === 0) {
				console.warn('  ⚠️ Нет данных, создаем пустой массив из 30 дней');
				const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
				chartData = new Array(Math.min(daysInMonth, 30)).fill(0);
				chartLabels = Array.from({ length: Math.min(daysInMonth, 30) }, (_, i) => `${(i + 1).toString().padStart(2, '0')}.${(new Date().getMonth() + 1).toString().padStart(2, '0')}`);
			}
		} else if (range === 'year') {
			console.log('  → Диапазон: ГОД - используем monthly_stats');
			chartData = stats.monthly_stats?.data || [];
			chartLabels = stats.monthly_stats?.labels || [];
			chartTitle = t['stats.by_months'] || 'По месяцам';
			dataType = 'monthly_stats (12 месяцев)';
			
			// Если данных нет, создаем пустой массив из 12 месяцев
			if (chartData.length === 0) {
				console.warn('  ⚠️ Нет данных, создаем пустой массив из 12 месяцев');
				chartData = new Array(12).fill(0);
				const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
				chartLabels = months;
			}
		} else {
			console.log('  → Диапазон: ВСЁ ВРЕМЯ - используем monthly_stats с годами');
			chartData = stats.monthly_stats?.data || [];
			chartLabels = stats.monthly_stats?.labels || [];
			chartTitle = t['stats.by_years'] || 'По годам';
			dataType = 'monthly_stats (годы)';
			
			// Если данных нет, создаем пустой массив для последних 5 лет
			if (chartData.length === 0) {
				console.warn('  ⚠️ Нет данных, создаем пустой массив из 5 лет');
				chartData = new Array(5).fill(0);
				const currentYear = new Date().getFullYear();
				chartLabels = Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
			}
		}
		
		console.log(`\n📊 [ФРОНТЕНД] Данные графика (${dataType}):`);
		console.log('  - Количество точек:', chartData.length);
		console.log('  - Метки (первые 5):', chartLabels.slice(0, 5));
		console.log('  - Значения (первые 5):', chartData.slice(0, 5));
		console.log('  - Сумма всех значений:', chartData.reduce((a, b) => a + b, 0));
		console.log('  - Максимальное значение:', Math.max(...chartData, 1));
		
		// Находим максимальное значение для масштабирования
		const maxVal = Math.max(...chartData, 1);
		
		// Генерация шкалы Y (5 шагов)
		const yAxisSteps = 5;
		const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
			const val = Math.round((maxVal / yAxisSteps) * i);
			return `<span class="y-axis-label">${val}</span>`;
		}).join('');
		
		console.log('  - Шкала Y:', Array.from({ length: yAxisSteps + 1 }, (_, i) => Math.round((maxVal / yAxisSteps) * i)));

		// Генерация столбцов с правильным вычислением высоты
		const chartBars = chartData.map((val, i) => {
			// Вычисляем высоту в процентах, минимум 2% для видимости нулевых значений
			const heightPercent = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 2 : 0) : 0;
			
			return `
				<div class="bar-group">
					<div class="bar-wrapper" style="height: 100%;">
						<div class="bar" 
							 style="height: ${heightPercent}%;" 
							 data-value="${val}"
							 title="${val} ${getTitleForRange(range, t)}">
						</div>
					</div>
					<span class="bar-label">${chartLabels[i] || ''}</span>
				</div>
			`;
		}).join('');

		const chartHtml = `
			<div class="chart-container">
				<div class="chart-header">
					<h3 class="chart-subtitle">${chartTitle}</h3>
				</div>
				<div class="chart-inner">
					<div class="y-axis">${yAxisLabels}</div>
					<div class="chart-bars ${chartData.length > 15 ? 'many-bars' : ''}">${chartBars}</div>
				</div>
			</div>
		`;
		
		console.log('✅ [ФРОНТЕНД] График сгенерирован');

		// === 2. ПОПУЛЯРНЫЕ КАРТИНЫ ===
		console.log('\n🏆 [ФРОНТЕНД] ПОПУЛЯРНЫЕ КАРТИНЫ:');
		const popularPaintings = stats.popular_paintings?.map((p, i) => {
			const title = p[`title_${currentLang}`] || p.title_en || 'Без названия';
			const author = p[`author_${currentLang}`] || p.author_en || 'Неизвестный автор';
			console.log(`  ${i + 1}. ${title} - ${p.views} просмотров`);
			return `<div class="ranking-item" onclick="router('painting', ${p.id})">
				<span class="rank">${i + 1}</span>
				<div class="ranking-info">
					<span class="ranking-title">${title}</span>
					<span class="ranking-author">${author}</span>
				</div>
				<span class="ranking-value">${p.views || 0}</span>
			</div>`;
		}).join('') || '<p class="no-data">Нет данных</p>';

		// === 3. ПО ЗАДЕРЖКЕ ВНИМАНИЯ ===
		console.log('\n⏱️ [ФРОНТЕНД] ПО ЗАДЕРЖКЕ ВНИМАНИЯ:');
		const attentionPaintings = stats.attention_paintings?.map((p, i) => {
			const title = p[`title_${currentLang}`] || p.title_en || 'Без названия';
			const author = p[`author_${currentLang}`] || p.author_en || 'Неизвестный автор';
			console.log(`  ${i + 1}. ${title} - ${p.avg_duration_minutes} мин`);
			return `<div class="ranking-item" onclick="router('painting', ${p.id})">
				<span class="rank">${i + 1}</span>
				<div class="ranking-info">
					<span class="ranking-title">${title}</span>
					<span class="ranking-author">${author}</span>
				</div>
				<span class="ranking-value">${p.avg_duration_minutes || 0} мин</span>
			</div>`;
		}).join('') || '<p class="no-data">Нет данных</p>';

		// === 4. СРЕДНИЙ МАРШРУТ ===
		console.log('\n🗺️ [ФРОНТЕНД] СРЕДНИЙ МАРШРУТ:');
		const paintingsRoute = stats.average_paintings_route || [];
		if (paintingsRoute.length > 0) {
			paintingsRoute.forEach((p, i) => {
				const title = p[`title_${currentLang}`] || p.title_en || 'Без названия';
				console.log(`  ${i + 1}. ${title}`);
			});
		} else {
			console.log('  Нет данных о маршруте');
		}
		
		const paintingsRouteHtml = paintingsRoute.length ? paintingsRoute.map((p, i) => `
			<div class="route-step" onclick="router('painting', ${p.id})" style="cursor:pointer;">
				<span class="step-number">${i + 1}</span>
				<span class="step-text">${p[`title_${currentLang}`] || p.title_en || 'Без названия'}</span>
			</div>
			${i < paintingsRoute.length - 1 ? '<div class="route-arrow">↓</div>' : ''}
		`).join('') : '<p class="no-data">Нет данных</p>';

		// === 5. ФИНАЛЬНЫЙ HTML ===
		console.log('\n🎨 [ФРОНТЕНД] РЕНДЕРИНГ HTML...');
		
		container.innerHTML = `
			<section class="stats-page">
				<div class="container">
					<button onclick="logout()" class="logout-btn">Exit</button>
					
					<h1 class="page-title">${t['section.stats'] || 'Статистика'}</h1>
					
					<!-- Общая информация -->
					<div class="stat-card large">
						<h2 class="stat-card-title">${t['stats.general'] || 'Общая информация'}</h2>
						<div class="stat-content">
							<div class="stat-big-number">
								<span class="number">${(stats.total_visits || 0).toLocaleString()}</span>
								<span class="label">${t['stats.visits'] || 'Посещений за период'}</span>
							</div>
							<div class="stats-row">
								<div class="mini-stat">
									<span class="mini-number">${(stats.unique_users || 0).toLocaleString()}</span>
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
						<h2 class="stat-card-title">📊 ${t['stats.timeline'] || 'Посещаемость'}</h2>
						${chartHtml}
						<div class="chart-filter">
							<label>${t['stats.filter'] || 'Фильтр по времени:'}</label>
							<select class="filter-select" id="stats-range-select">
								<option value="today" ${range === 'today' ? 'selected' : ''}>${t['time.today'] || 'За сегодня'}</option>
								<option value="week" ${range === 'week' ? 'selected' : ''}>${t['time.week'] || 'За неделю'}</option>
								<option value="month" ${range === 'month' ? 'selected' : ''}>${t['time.month'] || 'За месяц'}</option>
								<option value="year" ${range === 'year' ? 'selected' : ''}>${t['time.year'] || 'За год'}</option>
								<option value="all" ${range === 'all' ? 'selected' : ''}>${t['time.all'] || 'За всё время'}</option>
							</select>
						</div>
					</div>
				</div>
			</section>
		`;

		console.log('✅ [ФРОНТЕНД] HTML успешно вставлен в контейнер');

		// Добавляем обработчик изменения диапазона
		const selectElement = document.getElementById('stats-range-select');
		if (selectElement) {
			console.log('✅ [ФРОНТЕНД] Обработчик изменения диапазона добавлен');
			selectElement.addEventListener('change', async (e) => {
				const newRange = e.target.value;
				console.log('\n🔄 [ФРОНТЕНД] Смена диапазона на:', newRange);
				
				// Показываем лоадер
				const chartContainer = document.querySelector('.chart-container');
				if (chartContainer) {
					chartContainer.innerHTML = '<div class="loader">Загрузка...</div>';
				}
				
				// Загружаем новые данные и обновляем ВСЮ страницу
				const app = document.getElementById('app');
				if (app) {
					await renderStats(app, newRange);
				}
			});
		} else {
			console.error('❌ [ФРОНТЕНД] Не найден элемент select для диапазона');
		}
		
		console.log('='.repeat(60) + '\n');

	} catch (e) {
		console.error('\n❌ [ФРОНТЕНД] ОШИБКА загрузки статистики:');
		console.error('  - Сообщение:', e.message);
		console.error('  - Стек:', e.stack);
		console.log('='.repeat(60) + '\n');
		
		container.innerHTML = `
			<div class="error-state">
				<h2>Ошибка загрузки статистики</h2>
				<p>${e.message}</p>
				<button onclick="location.reload()">Попробовать снова</button>
			</div>
		`;
	}
}

// Вспомогательная функция для получения правильного текста в тултипе
function getTitleForRange(range, t) {
	let title;
	switch(range) {
		case 'today':
			title = t['stats.visits_per_hour'] || 'посещений в час';
			break;
		case 'week':
			title = t['stats.visits_per_day'] || 'посещений в день';
			break;
		case 'month':
			title = t['stats.visits_per_day'] || 'посещений в день';
			break;
		case 'year':
			title = t['stats.visits_per_month'] || 'посещений в месяц';
			break;
		default:
			title = t['stats.visits_per_year'] || 'посещений в год';
	}
	console.log(`  📝 Тултип для range="${range}": "${title}"`);
	return title;
}

// Глобальная функция для обновления диапазона
window.updateStatsRange = async function (range) {
	console.log('\n🔄 [ГЛОБАЛЬНАЯ] updateStatsRange вызвана с range =', range);
	const app = document.getElementById('app');
	if (app) {
		app.innerHTML = '<div class="loader">Загрузка...</div>';
		await renderStats(app, range);
	} else {
		console.error('❌ [ГЛОБАЛЬНАЯ] Не найден элемент #app');
	}
};