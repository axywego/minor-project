// router.js
import { loadPaintings } from './api.js';
import { renderHome } from './pages/home.js';
import { renderPaintingDetail } from './pages/painting.js';
import { renderAdmin } from './pages/admin.js';
import { currentLang } from './i18n.js';
import { checkAuth, showLoginModal, isAdminLoggedIn } from './admin_auth.js'; // добавлен импорт

export const state = {
	currentView: 'home',
	currentParam: null
};

let currentPaintingStartTime = null;
let currentPaintingId = null;
let userId = localStorage.getItem('gallery_user_id');
if (!userId) {
	userId = 'user_' + Math.random().toString(36).substr(2, 9);
	localStorage.setItem('gallery_user_id', userId);
}

export async function router(view, param = null) {
	const prevView = state.currentView;
	const prevParam = state.currentParam;

	state.currentView = view;
	state.currentParam = param;

	// Трекинг посещения картины
	if (prevView === 'painting' && view !== 'painting' && currentPaintingStartTime && currentPaintingId) {
		const duration = Math.round((Date.now() - currentPaintingStartTime) / 1000);
		fetch('/api/visit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ painting_id: currentPaintingId, duration, user_id: userId })
		});
		currentPaintingStartTime = null;
		currentPaintingId = null;
	}

	// Остановка карусели при уходе с home
	if (view !== 'home') {
		import('./carousel.js').then(({ stopCarousel }) => stopCarousel());
	}

	const app = document.getElementById('app');
	if (!app.classList.contains('fade-out')) {
		app.innerHTML = '<div class="loader">Загрузка...</div>';
	}

	// --- Обработка admin-маршрутов ---
	if (view.startsWith('admin')) {
		// Сначала проверяем, авторизован ли пользователь
		await checkAuth();

		if (!isAdminLoggedIn) {
			// Не авторизован — показываем модалку и остаёмся на текущей странице (home)
			showLoginModal();
			// Но чтобы не было пустого экрана, рендерим home
			await renderHome(app);
			return;
		}

		// Авторизован — рендерим админку
		const parts = view.split('/');
		const tab = parts[1] || 'stats';
		const range = new URLSearchParams(window.location.search).get('range') || 'month';
		await renderAdmin(app, tab, range);
		return;
	}

	// --- Обычные маршруты ---
	switch (view) {
		case 'home':
			await renderHome(app);
			break;
		case 'painting':
			await renderPaintingDetail(app, param);
			currentPaintingStartTime = Date.now();
			currentPaintingId = param;
			break;
		default:
			await renderHome(app);
	}
}

window.router = router;