import { initFuseSearch } from './search.js';

export let paintings = [];

export async function loadPaintings() {
	try {
		const res = await fetch('/api/paintings');
		paintings = await res.json();
		initFuseSearch(paintings);
	} catch (e) {
		console.error('Ошибка загрузки картин:', e);
	}
}

export async function fetchPainting(id) {
	const res = await fetch(`/api/painting/${id}`);
	return await res.json();
}

export async function fetchStats(range) {
	const res = await fetch(`/api/stats?range=${range}`);
	return await res.json();
}