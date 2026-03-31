export function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

export function parseFacts(factsString, options = {}) {
	const { trimValues = true } = options;
	if (!factsString || typeof factsString !== 'string') return {};
	const result = {};
	const pairs = factsString.trim().replace(/;+$/, '').split(';');
	for (let i = 0; i < pairs.length; i++) {
		const pair = pairs[i].trim();
		if (!pair || !pair.includes(':')) continue;
		const [key, ...valueParts] = pair.split(':');
		let keyClean = trimValues ? key.trim() : key;
		let valueClean = trimValues ? valueParts.join(':').trim() : valueParts.join(':');
		if (keyClean) result[keyClean] = valueClean;
	}
	return result;
}