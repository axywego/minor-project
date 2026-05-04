export function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

export function parseFacts(factsString) {
	if (!factsString || typeof factsString !== 'string') {
		return [];
	}
	return factsString.split(';').filter(f => f.trim()).map(f => f.trim());
}