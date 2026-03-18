export const translations = {
    ru: {
        'nav.home': 'Главная',
        'nav.stats': 'Статистика',
        'footer.contacts': 'Контакты',
        'footer.contacts.address': "📍 ул. Искусств, 15, Москва",
        'footer.hours': 'Режим работы',
        'footer.weekdays': 'Пн-Пт: 10:00 - 20:00',
        'footer.holidays': 'Сб-Вс: 11:00 - 22:00',
        'hero.title': 'Национальная Галерея Искусств',
        'hero.subtitle': 'Откройте для себя мир прекрасного в нашей коллекции шедевров мировой живописи',
        'hero.num_of_paintings': "Картин",
        'hero.num_of_painters': "Художников",
        'hero.num_of_halls': "Залов",
        'section.collection': 'Коллекция',
        'section.map': 'Карта галереи',
        'section.map.help': 'Нажмите на точку, чтобы открыть картину',
        'section.stats': 'Статистика посещений',
        'stats.total': 'Всего посещений',
        'stats.unique': 'Уникальных посетителей',
        'stats.popular': 'Популярные картины',
        'stats.chart': 'Активность по времени',
        'btn.view': 'Смотреть',
        'btn.back': '← Назад',
        'btn.favorite': 'Добавить в избранное',
        'search.placeholder': 'Поиск по названию картины и/или автору',
        'facts.interesting_facts': 'Интересные факты',
        'details.year_of_creation': "Год создания:",
        'details.drawing_technique': "Техника:",
        'details.dimensions': 'Размеры:',
        'details.art_direction': "Направление:",
        'centimeters': "см",
        'search_failed': "Ничего не найдено по запросу"
    },
    en: {
        'nav.home': 'Home',
        'nav.stats': 'Statistics',
        'footer.contacts': 'Contacts',
        'footer.contacts.address': "📍 15 Iskusstv Street, Moscow",
        'footer.hours': 'Opening Hours',
        'footer.weekdays': 'Mon-Fri: 10:00 - 20:00',
        'footer.holidays': 'Sat-Sun: 11:00 - 22:00',
        'hero.title': 'National Art Gallery',
        'hero.subtitle': 'Discover the world of beauty in our collection of world painting masterpieces',
        'hero.num_of_paintings': "Paintings",
        'hero.num_of_painters': "Painters",
        'hero.num_of_halls': "Halls",
        'section.collection': 'Collection',
        'section.map': 'Gallery Map',
        'section.map.help': 'Click on point to open the painting',
        'section.stats': 'Visit Statistics',
        'stats.total': 'Total Visits',
        'stats.unique': 'Unique Visitors',
        'stats.popular': 'Popular Paintings',
        'stats.chart': 'Activity by Time',
        'btn.view': 'View',
        'btn.back': '← Back',
        'btn.favorite': 'Add to Favorites',
        'search.placeholder': 'Search by painting name and/or author',
        'facts.interesting_facts': 'Interesting facts',
        'details.year_of_creation': "Year of creation:",
        'details.drawing_technique': "Drawing technique:",
        'details.dimensions': 'Dimensions:',
        'details.art_direction': "Art direction:",
        'centimeters': "sm",
        'search_failed': "Nothing found for your request"
    },
    de: {
        'nav.home': 'Startseite',
        'nav.stats': 'Statistiken',
        'footer.contacts': 'Kontakt',
        'footer.contacts.address': "📍 Kunststraße 15, Moskau",
        'footer.hours': 'Öffnungszeiten',
        'footer.weekdays': 'Mo-Fr: 10:00 - 20:00',
        'footer.holidays': 'Sa-So: 11:00 - 22:00',
        'hero.title': 'Nationale Kunstgalerie',
        'hero.subtitle': 'Entdecken Sie die Welt des Schönen in unserer Sammlung von Meisterwerken der Weltmalerei',
        'hero.num_of_paintings': "Gemälde",
        'hero.num_of_painters': "Maler",
        'hero.num_of_halls': "Säle",
        'section.collection': 'Sammlung',
        'section.map': 'Galeriekarte',
        'section.map.help': 'Klicken Sie auf einen Punkt, um das Gemälde zu öffnen',
        'section.stats': 'Besucherstatistiken',
        'stats.total': 'Gesamtbesuche',
        'stats.unique': 'Einzigartige Besucher',
        'stats.popular': 'Beliebte Gemälde',
        'stats.chart': 'Aktivität nach Zeit',
        'btn.view': 'Ansehen',
        'btn.back': '← Zurück',
        'btn.favorite': 'Zu Favoriten hinzufügen',
        'search.placeholder': 'Suche nach Gemäldename und/oder Künstler',
        'facts.interesting_facts': 'Interessante Fakten',
        'details.year_of_creation': "Entstehungsjahr:",
        'details.drawing_technique': "Technik:",
        'details.dimensions': 'Abmessungen:',
        'details.art_direction': "Stilrichtung:",
        'centimeters': "cm",
        'search_failed': "Nichts gefunden für Ihre Anfrage"
    }
};

export let currentLang = 'ru';

export function changeLanguage(lang) {
  if (lang === currentLang) return;
  const app = document.getElementById('app');
  app.classList.add('fade-out');

  setTimeout(() => {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Обновление статических элементов с data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) el.textContent = translations[lang][key];
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = translations[lang]['search.placeholder'];

    // Активация кнопки языка
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Перерисовка текущей страницы через роутер
    import('./router.js').then(({ state, router }) => router(state.currentView, state.currentParam));

    requestAnimationFrame(() => app.classList.remove('fade-out'));
  }, 300);
}

// Глобальный доступ для вызова из HTML
window.changeLanguage = changeLanguage;