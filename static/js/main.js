import { loadPaintings } from './api.js';
import { setupLiveSearch } from './search.js';
import { router } from './router.js';
import { checkAuth, showLoginModal } from './admin_auth.js';

document.addEventListener('DOMContentLoaded', async () => {
	checkAuth();
	await loadPaintings();
	setupLiveSearch();
	router('home');
});

document.addEventListener('keydown', (e) => {
	if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
		e.preventDefault();
		showLoginModal();
	}
});

const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
	heroTitle.addEventListener('dblclick', (e) => {
		e.preventDefault();
		showLoginModal();
	});
}

if (window.location.hash === '#admin') {
	showLoginModal();
	history.replaceState(null, null, ' ');
}