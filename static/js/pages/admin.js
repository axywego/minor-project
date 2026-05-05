import { translations, currentLang } from '../i18n.js';
import {
	fetchStats,
	paintings,
	loadPaintings,
	fetchPainting,
	createPainting,
	updatePainting,
	deletePainting,
	fetchAllReviews,
	approveReview,
	rejectReview,
  uploadImage
} from '../api.js';

// ====================== ГЛАВНАЯ ФУНКЦИЯ ======================
export async function renderAdmin(container, tab = 'stats', range = 'month') {
	const t = translations[currentLang];

	// Убедимся, что картины загружены
	if (!paintings.length) await loadPaintings();

	// --- ОБЩИЙ КОНТЕЙНЕР ---
	container.innerHTML = `
    <section class="stats-page">   <!-- тот же класс, что и в статистике -->
      <div class="container">
        <button onclick="logout()" class="logout-btn">Exit</button>

        <h1 class="page-title">${t['admin.panel'] || 'Админ-панель'}</h1>

        <!-- Табы -->
        <div class="admin-tabs">
          <button class="tab-btn ${tab === 'stats' ? 'active' : ''}" 
                  id="tab-stats">
            📊 ${t['stats.tab'] || 'Статистика'}
          </button>
          <button class="tab-btn ${tab === 'paintings' ? 'active' : ''}" 
                  id="tab-paintings">
            🖼️ ${t['admin.paintings'] || 'Картины'}
          </button>
          <button class="tab-btn ${tab === 'reviews' ? 'active' : ''}" 
                  id="tab-reviews">
            💬 ${t['admin.reviews'] || 'Отзывы'}
          </button>
        </div>

        <!-- Контент вкладок -->
        <div id="admin-tab-content"></div>
      </div>
    </section>
  `;

	// Навешиваем обработчики переключения вкладок
	document.getElementById('tab-stats').addEventListener('click', () => switchTab('stats', range));
	document.getElementById('tab-paintings').addEventListener('click', () => switchTab('paintings', range));
	document.getElementById('tab-reviews').addEventListener('click', () => switchTab('reviews', range));

	// Глобальная функция смены URL (без перезагрузки)
	window.switchAdminTab = (newTab) => {
		// обновим URL без перезагрузки
		history.pushState(null, '', `#/admin/${newTab}`);
		switchTab(newTab, range);
	};

	// Рендерим содержимое выбранной вкладки
	await switchTab(tab, range, container);
}

// ====================== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ======================
async function switchTab(tab, range, container) {
	const contentDiv = document.getElementById('admin-tab-content');
	if (!contentDiv) return;

	// Обновляем активный класс табов
	document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
	document.getElementById(`tab-${tab}`)?.classList.add('active');

	switch (tab) {
		case 'stats':
			await renderStatsTab(contentDiv, range);
			break;
		case 'paintings':
			await renderPaintingsTab(contentDiv);
			break;
		case 'reviews':
			await renderReviewsTab(contentDiv);
			break;
		default:
			contentDiv.innerHTML = '<p>Неизвестная вкладка</p>';
	}
}

// ====================== ВКЛАДКА СТАТИСТИКИ ======================
// Здесь скопирована логика из оригинального renderStats, но без общего контейнера.
async function renderStatsTab(container, range) {
	const t = translations[currentLang];
	const stats = await fetchStats(range);

	let chartData = [], chartLabels = [], chartTitle = '';

	if (range === 'today') {
		chartData = stats.hourly_stats?.data || new Array(24).fill(0);
		chartLabels = stats.hourly_stats?.labels || Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
		chartTitle = t['stats.by_hours'] || 'По часам';
	} else if (range === 'week') {
		chartData = stats.daily_stats?.data || new Array(7).fill(0);
		chartLabels = stats.daily_stats?.labels || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
		chartTitle = t['stats.by_days'] || 'По дням';
	} else if (range === 'month') {
		chartData = stats.daily_stats?.data || new Array(30).fill(0);
		chartLabels = stats.daily_stats?.labels || Array.from({ length: 30 }, (_, i) => `${i + 1}`);
		chartTitle = t['stats.by_days'] || 'По дням';
	} else if (range === 'year') {
		chartData = stats.monthly_stats?.data || new Array(12).fill(0);
		chartLabels = stats.monthly_stats?.labels || ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
		chartTitle = t['stats.by_months'] || 'По месяцам';
	} else {
		chartData = stats.monthly_stats?.data || new Array(5).fill(0);
		chartLabels = stats.monthly_stats?.labels || ['2020', '2021', '2022', '2023', '2024'];
		chartTitle = t['stats.by_years'] || 'По годам';
	}

	const maxVal = Math.max(...chartData, 1);
	const yAxisSteps = 5;
	const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
		const val = Math.round((maxVal / yAxisSteps) * i);
		return `<span class="y-axis-label">${val}</span>`;
	}).join('');

	const chartBars = chartData.map((val, i) => {
		const heightPercent = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 2 : 0) : 0;
		return `
      <div class="bar-group">
        <div class="bar-wrapper" style="height: 100%;">
          <div class="bar" style="height: ${heightPercent}%;" data-value="${val}" title="${val}"></div>
        </div>
        <span class="bar-label">${chartLabels[i] || ''}</span>
      </div>`;
	}).join('');

	const chartHtml = `
    <div class="chart-container">
      <div class="chart-header"><h3 class="chart-subtitle">${chartTitle}</h3></div>
      <div class="chart-inner">
        <div class="y-axis">${yAxisLabels}</div>
        <div class="chart-bars ${chartData.length > 15 ? 'many-bars' : ''}">${chartBars}</div>
      </div>
    </div>`;

	const popularPaintings = stats.popular_paintings?.map((p, i) => `
    <div class="ranking-item" onclick="router('painting', ${p.id})">
      <span class="rank">${i + 1}</span>
      <div class="ranking-info">
        <span class="ranking-title">${p[`title_${currentLang}`] || p.title_en || 'Без названия'}</span>
        <span class="ranking-author">${p[`author_${currentLang}`] || p.author_en || 'Неизвестный автор'}</span>
      </div>
      <span class="ranking-value">${p.views || 0}</span>
    </div>`).join('') || '<p class="no-data">Нет данных</p>';

	const attentionPaintings = stats.attention_paintings?.map((p, i) => `
    <div class="ranking-item" onclick="router('painting', ${p.id})">
      <span class="rank">${i + 1}</span>
      <div class="ranking-info">
        <span class="ranking-title">${p[`title_${currentLang}`] || p.title_en || 'Без названия'}</span>
        <span class="ranking-author">${p[`author_${currentLang}`] || p.author_en || 'Неизвестный автор'}</span>
      </div>
      <span class="ranking-value">${p.avg_duration_minutes || 0} мин</span>
    </div>`).join('') || '<p class="no-data">Нет данных</p>';

	const routeHtml = (stats.average_paintings_route || []).length ? stats.average_paintings_route.map((p, i) => `
    <div class="route-step" onclick="router('painting', ${p.id})" style="cursor:pointer;">
      <span class="step-number">${i + 1}</span>
      <span class="step-text">${p[`title_${currentLang}`] || p.title_en || 'Без названия'}</span>
    </div>
    ${i < stats.average_paintings_route.length - 1 ? '<div class="route-arrow">↓</div>' : ''}`).join('') : '<p class="no-data">Нет данных</p>';

	container.innerHTML = `
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

    <div class="stats-grid">
      <div class="stat-card">
        <h2 class="stat-card-title">🏆 ${t['stats.popular'] || 'Популярные картины'}</h2>
        <div class="ranking-list">${popularPaintings}</div>
      </div>
      <div class="stat-card">
        <h2 class="stat-card-title">📍 ${t['stats.route'] || 'Средний маршрут'}</h2>
        <div class="route-visual">${routeHtml}</div>
      </div>
    </div>

    <div class="stat-card">
      <h2 class="stat-card-title">⏱️ ${t['stats.attention'] || 'По задержке внимания'}</h2>
      <div class="ranking-list">${attentionPaintings}</div>
    </div>

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
  `;

	const select = document.getElementById('stats-range-select');
	if (select) {
		select.addEventListener('change', (e) => {
			const newRange = e.target.value;
			container.innerHTML = '<div class="loader">Загрузка...</div>';
			renderStatsTab(container, newRange);
		});
	}
}

// ====================== ВКЛАДКА КАРТИН ======================
// ====================== ВКЛАДКА КАРТИН (улучшенная форма) ======================
async function renderPaintingsTab(container) {
	const t = translations[currentLang];
	const list = paintings;

	container.innerHTML = `
        <div class="admin-panel-inner">
            <button class="btn btn-add" onclick="window.showPaintingForm()">+ ${t['admin.add'] || 'Добавить картину'}</button>
            <div id="painting-form" style="display:none; margin-bottom:20px;"></div>
            <table class="admin-table">
                <thead><tr><th>ID</th><th>${t['admin.title'] || 'Название'}</th><th>${t['admin.author'] || 'Автор'}</th><th>${t['admin.year'] || 'Год'}</th><th></th></tr></thead>
                <tbody>
                    ${list.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p[`title_${currentLang}`] || p.title_en}</td>
                            <td>${p[`author_${currentLang}`] || p.author_en}</td>
                            <td>${p.year}</td>
                            <td>
                                <button onclick="window.editPainting(${p.id})">✏️</button>
                                <button onclick="window.deletePaintingById(${p.id})">🗑️</button>
                            </td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;

	// ---------- Функция показа формы (новая) ----------
	window.showPaintingForm = (painting = null) => {
		const formDiv = document.getElementById('painting-form');
		const isEdit = !!painting;
		formDiv.style.display = 'block';

		// Парсим факты (если есть)
		const factsRu = painting?.facts_ru ? painting.facts_ru.split(';') : ['', '', '', ''];
		const factsEn = painting?.facts_en ? painting.facts_en.split(';') : ['', '', '', ''];
		const factsDe = painting?.facts_de ? painting.facts_de.split(';') : ['', '', '', ''];

		// Создаём строки для 4 фактов на каждом языке
		const makeFactInputs = (lang, values) => {
			return [0, 1, 2, 3].map(i => `
                <input name="facts_${lang}[]" placeholder="Факт ${i + 1}" value="${(values[i] || '').replace(/"/g, '&quot;')}">
            `).join('');
		};

		formDiv.innerHTML = `
            <h3>${isEdit ? t['admin.edit'] || 'Редактировать' : t['admin.add'] || 'Добавить'}</h3>
            <form id="painting-form-inner">
                <!-- Общие поля -->
                <div class="form-section">
                    <div class="form-row">
                        <label>${t['admin.year'] || 'Год'}: <input type="number" name="year" value="${painting?.year || ''}" required></label>
                        <label>${t['admin.dimensions'] || 'Размеры'}: <input name="dimensions" value="${painting?.dimensions || ''}"></label>
                        <label>Map X: <input type="number" name="map_x" value="${painting?.map_x || 50}" step="any"></label>
                        <label>Map Y: <input type="number" name="map_y" value="${painting?.map_y || 50}" step="any"></label>
                    </div>
                </div>

                <!-- Изображение -->
                <div class="form-section">
                    <label>${t['admin.image'] || 'Изображение'}:</label>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <img id="image-preview" src="${painting?.image_uri || ''}" 
                             style="max-width:150px; max-height:100px; border-radius:8px; ${painting?.image_uri ? '' : 'display:none;'}">
                        <div>
                            <input type="file" id="painting-image-file" accept="image/*" 
                                   onchange="window.handleImageUpload(this)">
                            <input type="hidden" name="image_uri" value="${painting?.image_uri || ''}">
                            <div style="font-size:12px; color:gray;">${t['admin.image_hint'] || 'Файл загрузится автоматически'}</div>
                        </div>
                    </div>
                </div>

                <!-- Языковые колонки -->
                <div class="lang-columns">
                    <div class="lang-col">
                        <h4>🇷🇺 Русский</h4>
                        <label>${t['admin.title_field'] || 'Название'}:<input name="title_ru" value="${painting?.title_ru || ''}" required></label>
                        <label>${t['admin.author_field'] || 'Автор'}:<input name="author_ru" value="${painting?.author_ru || ''}" required></label>
                        <label>${t['admin.description'] || 'Описание'}:<textarea name="description_ru">${painting?.description_ru || ''}</textarea></label>
                        <label>${t['admin.facts'] || 'Факты'} (4):</label>
                        <div class="facts-grid">${makeFactInputs('ru', factsRu)}</div>
                        <label>${t['admin.technique'] || 'Техника'}:<input name="drawing_technique_ru" value="${painting?.drawing_technique_ru || ''}"></label>
                        <label>${t['admin.direction'] || 'Направление'}:<input name="art_direction_ru" value="${painting?.art_direction_ru || ''}"></label>
                    </div>
                    <div class="lang-col">
                        <h4>🇬🇧 English</h4>
                        <label>${t['admin.title_field'] || 'Название'}:<input name="title_en" value="${painting?.title_en || ''}" required></label>
                        <label>${t['admin.author_field'] || 'Автор'}:<input name="author_en" value="${painting?.author_en || ''}" required></label>
                        <label>${t['admin.description'] || 'Описание'}:<textarea name="description_en">${painting?.description_en || ''}</textarea></label>
                        <label>${t['admin.facts'] || 'Факты'} (4):</label>
                        <div class="facts-grid">${makeFactInputs('en', factsEn)}</div>
                        <label>${t['admin.technique'] || 'Техника'}:<input name="drawing_technique_en" value="${painting?.drawing_technique_en || ''}"></label>
                        <label>${t['admin.direction'] || 'Направление'}:<input name="art_direction_en" value="${painting?.art_direction_en || ''}"></label>
                    </div>
                    <div class="lang-col">
                        <h4>🇩🇪 Deutsch</h4>
                        <label>${t['admin.title_field'] || 'Название'}:<input name="title_de" value="${painting?.title_de || ''}" required></label>
                        <label>${t['admin.author_field'] || 'Автор'}:<input name="author_de" value="${painting?.author_de || ''}" required></label>
                        <label>${t['admin.description'] || 'Описание'}:<textarea name="description_de">${painting?.description_de || ''}</textarea></label>
                        <label>${t['admin.facts'] || 'Факты'} (4):</label>
                        <div class="facts-grid">${makeFactInputs('de', factsDe)}</div>
                        <label>${t['admin.technique'] || 'Техника'}:<input name="drawing_technique_de" value="${painting?.drawing_technique_de || ''}"></label>
                        <label>${t['admin.direction'] || 'Направление'}:<input name="art_direction_de" value="${painting?.art_direction_de || ''}"></label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit">${isEdit ? t['admin.save'] || 'Сохранить' : t['admin.create'] || 'Создать'}</button>
                    <button type="button" onclick="document.getElementById('painting-form').style.display='none'">${t['admin.cancel'] || 'Отмена'}</button>
                </div>
            </form>
        `;

		// Обработка загрузки изображения
        // Обработка загрузки изображения
    window.handleImageUpload = async (input) => {
        const file = input.files[0];
        if (!file) return;
        
        // Проверка размера (макс 10MB)
        // if (file.size > 10 * 1024 * 1024) {
        //     alert('Файл слишком большой. Максимум 10MB.');
        //     input.value = '';
        //     return;
        // }
        
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            alert('Можно загружать только изображения.');
            input.value = '';
            return;
        }
        
        try {
            // Показываем индикатор загрузки
            const preview = document.getElementById('image-preview');
            preview.style.opacity = '0.5';
            
            const url = await uploadImage(file);
            console.log('Изображение загружено:', url);
            
            document.querySelector('input[name="image_uri"]').value = url;
            preview.src = url;
            preview.style.display = 'block';
            preview.style.opacity = '1';
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            alert('Ошибка загрузки изображения. Проверьте консоль (F12).');
            input.value = '';
        }
    };

		// Отправка формы
		document.getElementById('painting-form-inner').onsubmit = async e => {
			e.preventDefault();
			const form = e.target;
			const formData = new FormData(form);
			const data = Object.fromEntries(formData.entries());

			// Собираем факты из массивов
			['ru', 'en', 'de'].forEach(lang => {
				const facts = formData.getAll(`facts_${lang}[]`);
				data[`facts_${lang}`] = facts.join(';');
				// удаляем временные ключи массивов
				delete data[`facts_${lang}[]`];
			});

			data.year = parseInt(data.year);
			data.map_x = parseFloat(data.map_x);
			data.map_y = parseFloat(data.map_y);

			if (isEdit) {
				await updatePainting(painting.id, data);
			} else {
				await createPainting(data);
			}
			await loadPaintings();
			await renderPaintingsTab(container);
		};
	};

	window.editPainting = async id => {
		const p = await fetchPainting(id);
		window.showPaintingForm(p);
	};

	window.deletePaintingById = async id => {
		if (confirm(t['admin.confirm_delete'] || 'Удалить картину?')) {
			await deletePainting(id);
			await loadPaintings();
			await renderPaintingsTab(container);
		}
	};
}

// ====================== ВКЛАДКА ОТЗЫВОВ ======================
async function renderReviewsTab(container) {
	const t = translations[currentLang];
	const data = await fetchAllReviews();
	const reviews = data.reviews || [];

	container.innerHTML = `
    <div class="admin-panel-inner">
      <h2>${t['admin.reviews_moderation'] || 'Модерация отзывов'}</h2>
      <div class="reviews-list">
        ${reviews.map(r => `
          <div class="review-card ${r.approved ? 'approved' : 'pending'}">
            <div class="review-header">
              <strong>${r.author}</strong>
              <span>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
              <span>${new Date(r.created_at).toLocaleString()}</span>
              <span>${t['admin.painting'] || 'Картина'}: ${r[`title_${currentLang}`] || r.title_en}</span>
              <span>${r.approved ? '✅' : '⏳'}</span>
            </div>
            <p>${r.text}</p>
            <div class="actions">
              ${r.approved ? `
                <button onclick="window.rejectReview(${r.id})">🗑️ ${t['admin.reject'] || 'Удалить'}</button>
              ` : `
                <button onclick="window.approveReview(${r.id})">✅ ${t['admin.approve'] || 'Одобрить'}</button>
                <button onclick="window.rejectReview(${r.id})">🗑️ ${t['admin.reject'] || 'Отклонить'}</button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

	window.approveReview = async id => {
		await approveReview(id);
		await renderReviewsTab(container);
	};
	window.rejectReview = async id => {
		if (confirm(t['admin.confirm_reject'] || 'Отклонить отзыв?')) {
			await rejectReview(id);
			await renderReviewsTab(container);
		}
	};
}