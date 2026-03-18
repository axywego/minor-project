import { loadPaintings } from './api.js';
import { setupLiveSearch } from './search.js';
import { router } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadPaintings();
  setupLiveSearch();
  router('home'); // начальная страница
});