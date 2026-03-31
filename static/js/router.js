import { loadPaintings } from './api.js';
import { renderHome } from './pages/home.js';
import { renderPaintingDetail } from './pages/painting.js';
import { renderStats } from './pages/stats.js';
import { currentLang } from './i18n.js';

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

	if (view !== 'home') {
		import('./carousel.js').then(({ stopCarousel }) => stopCarousel());
	}

	const app = document.getElementById('app');
	if (!app.classList.contains('fade-out')) {
		app.innerHTML = '<div class="loader">Загрузка...</div>';
	}

	switch (view) {
		case 'home':
			await renderHome(app);
			break;
		case 'painting':
			await renderPaintingDetail(app, param);
			currentPaintingStartTime = Date.now();
			currentPaintingId = param;
			break;
		case 'stats':
			await renderStats(app, 'month');
			break;
	}
}

window.router = router;