// export function escapeHtml(text) {
// 	const div = document.createElement('div');
// 	div.textContent = text;
// 	return div.innerHTML;
// }

// export function parseFacts(factsString, options = {}) {
// 	const { trimValues = true, lang = 'ru' } = options;
	
// 	if (!factsString || typeof factsString !== 'string') {
// 		return getEmptyFactsMessage(lang);
// 	}
	
// 	// Проверяем, есть ли двоеточия (формат "Ключ:Значение")
// 	if (factsString.includes(':')) {
// 		// Старый формат с ключами
// 		const result = {};
// 		const pairs = factsString.trim().replace(/;+$/, '').split(';');
// 		for (let i = 0; i < pairs.length; i++) {
// 			const pair = pairs[i].trim();
// 			if (!pair || !pair.includes(':')) continue;
// 			const [key, ...valueParts] = pair.split(':');
// 			let keyClean = trimValues ? key.trim() : key;
// 			let valueClean = trimValues ? valueParts.join(':').trim() : valueParts.join(':');
// 			if (keyClean) result[keyClean] = valueClean;
// 		}
// 		return Object.keys(result).length > 0 ? result : getEmptyFactsMessage(lang);
// 	} else {
// 		// Новый формат - просто факты через точку с запятой
// 		const result = {};
// 		const facts = factsString.split(';').filter(f => f.trim());
		
// 		if (facts.length === 0) {
// 			return getEmptyFactsMessage(lang);
// 		}
		
// 		// Получаем слово "Факт" на нужном языке
// 		const factWord = getFactWord(lang);
		
// 		facts.forEach((fact, index) => {
// 			const cleanFact = fact.trim();
// 			if (cleanFact) {
// 				result[`${factWord} ${index + 1}`] = cleanFact;
// 			}
// 		});
		
// 		return Object.keys(result).length > 0 ? result : getEmptyFactsMessage(lang);
// 	}
// }

// function getFactWord(lang) {
// 	const translations = {
// 		'ru': 'Факт',
// 		'en': 'Fact',
// 		'de': 'Fakt'
// 	};
// 	return translations[lang] || 'Fact';
// }

// function getEmptyFactsMessage(lang) {
// 	const messages = {
// 		'ru': { "Нет данных": "Интересные факты отсутствуют" },
// 		'en': { "No data": "No interesting facts available" },
// 		'de': { "Keine Daten": "Keine interessanten Fakten verfügbar" }
// 	};
// 	return messages[lang] || messages['en'];
// }

export function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

export function parseFacts(factsString) {
	if (!factsString || typeof factsString !== 'string') {
		return [];
	}
	
	// Просто разделяем по ; и убираем пустые
	return factsString.split(';').filter(f => f.trim()).map(f => f.trim());
}