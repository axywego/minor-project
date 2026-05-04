import { loadPaintings } from './api.js';
import { setupLiveSearch } from './search.js';
import { router } from './router.js';
import { checkAuth } from './admin_auth.js';

document.addEventListener('DOMContentLoaded', async () => {
	// Проверяем, авторизован ли администратор
	await checkAuth();
	// Загружаем список картин
	await loadPaintings();
	// Инициализируем живой поиск
	setupLiveSearch();

	// Если URL содержит #admin, открываем админку через роутер
	// (роутер сам проверит авторизацию и покажет модалку, если нужно)
	if (window.location.hash.startsWith('#admin')) {
		// Извлекаем путь после "#/" (если есть) или просто "admin"
		const path = window.location.hash.substring(1).replace(/^\//, '') || 'admin';
		router(path);
	} else {
		// Иначе грузим главную страницу
		router('home');
	}
});