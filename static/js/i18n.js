// i18n.js
export const translations = {
    ru: {
        // Навигация
        'nav.home': 'Главная',
        'nav.stats': 'Статистика',
        
        // Футер
        'footer.contacts': 'Контакты',
        'footer.contacts.address': '📍 ул. Искусств, 15, Москва',
        'footer.hours': 'Режим работы',
        'footer.weekdays': 'Пн-Пт: 10:00 - 20:00',
        'footer.holidays': 'Сб-Вс: 11:00 - 22:00',
        
        // Главная (Hero)
        'hero.title': 'Национальная Галерея Искусств',
        'hero.subtitle': 'Откройте для себя мир прекрасного в нашей коллекции шедевров мировой живописи',
        'hero.num_of_paintings': 'Картин',
        'hero.num_of_painters': 'Художников',
        'hero.num_of_halls': 'Залов',
        'hero.quotes': [
            { text: '«Искусство — это не то, что видишь, а то, что заставляешь видеть других»', author: 'Эдгар Дега' },
            { text: '«Живопись — это поэзия, которую видят, а поэзия — это живопись, которую слышат»', author: 'Леонардо да Винчи' },
            { text: '«Каждое произведение искусства — это дитя своего времени»', author: 'Василий Кандинский' },
            { text: '«Искусство смывает с души пыль повседневной жизни»', author: 'Пабло Пикассо' },
            { text: '«Цель искусства — не копировать природу, а выражать её»', author: 'Огюст Роден' }
        ],
        
        // Секции
        'section.collection': 'Коллекция',
        'section.map': 'Карта галереи',
        'section.map.help': 'Нажмите на точку, чтобы открыть картину',
        'section.stats': 'Статистика посещений',
        
        // Кнопки
        'btn.view': 'Смотреть',
        'btn.back': '← Назад',
        'btn.favorite': 'Добавить в избранное',
        
        // Поиск
        'search.placeholder': 'Поиск по названию картины и/или автору',
        'search_failed': 'Ничего не найдено по запросу',
        
        // Факты
        'facts.interesting_facts': 'Интересные факты',
        
        // Детали картины
        'details.year_of_creation': 'Год создания:',
        'details.drawing_technique': 'Техника:',
        'details.dimensions': 'Размеры:',
        'details.art_direction': 'Направление:',
        'centimeters': 'см',
        'click_to_zoom': 'Нажмите для увеличения',
        
        // Отзывы
        'reviews.title': 'Отзывы',
        'reviews.leave_review': 'Написать отзыв',
        'reviews.rating': 'Оценка',
        'reviews.your_name': 'Ваше имя',
        'reviews.your_review': 'Ваш отзыв...',
        'reviews.submit': 'Отправить',
        'reviews.no_reviews': 'Пока нет отзывов. Будьте первым!',
        'reviews.loading': 'Загрузка отзывов...',
        'reviews.fill_fields': 'Заполните все поля',
        
        // Фильтры
        'filters.show': 'Фильтры',
        'filters.hide': 'Скрыть фильтры',
        'filters.found': 'Найдено',
        'filters.paintings': 'картин',
        'filters.no_results': 'По вашему запросу ничего не найдено',
        'filters.no_results_hint': 'Попробуйте изменить параметры фильтрации',
        'filters.reset': 'Сбросить фильтры',
        'filters.clear': 'Сбросить',
        'filters.direction': 'Направление',
        'filters.technique': 'Техника',
        'filters.century': 'Век',
        'filters.year': 'Год',
        'filters.from': 'От',
        'filters.to': 'До',
        'filters.all': 'Все',
        
        // Админ-панель
        'admin.panel': 'Админ-панель',
        'admin.paintings': 'Картины',
        'admin.reviews': 'Отзывы',
        'admin.add': 'Добавить картину',
        'admin.edit': 'Редактировать',
        'admin.save': 'Сохранить',
        'admin.create': 'Создать',
        'admin.cancel': 'Отмена',
        'admin.confirm_delete': 'Удалить картину?',
        'admin.title': 'Название',
        'admin.author': 'Автор',
        'admin.year': 'Год',
        'admin.title_field': 'Название',
        'admin.author_field': 'Автор',
        'admin.description': 'Описание',
        'admin.facts': 'Факты',
        'admin.technique': 'Техника',
        'admin.direction': 'Направление',
        'admin.image': 'Изображение',
        'admin.image_hint': 'Файл загрузится автоматически',
        'admin.reviews_moderation': 'Модерация отзывов',
        'admin.approve': 'Одобрить',
        'admin.reject': 'Отклонить',
        'admin.confirm_reject': 'Отклонить отзыв?',
        'admin.painting': 'Картина',
        'admin.dimensions': 'Размеры',
        
        // Статистика
        'stats.tab': 'Статистика',
        'stats.general': 'Общая информация',
        'stats.visits': 'Посещений за период',
        'stats.unique': 'Уникальных посетителей',
        'stats.avg_time': 'Среднее время просмотра',
        'stats.per_visit': 'Картин за посещение',
        'stats.popular': 'Популярные картины',
        'stats.route': 'Средний маршрут',
        'stats.attention': 'По задержке внимания',
        'stats.timeline': 'Посещаемость',
        'stats.filter': 'Фильтр по времени:',
        'stats.by_hours': 'По часам',
        'stats.by_days': 'По дням',
        'stats.by_months': 'По месяцам',
        'stats.by_years': 'По годам',
        
        // Время
        'time.today': 'За сегодня',
        'time.week': 'За неделю',
        'time.month': 'За месяц',
        'time.year': 'За год',
        'time.all': 'За всё время',
        
        // Тутипы для графика
        'stats.visits_per_hour': 'посещений в час',
        'stats.visits_per_day': 'посещений в день',
        'stats.visits_per_month': 'посещений в месяц',
        'stats.visits_per_year': 'посещений в год'
    },

    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.stats': 'Statistics',
        
        // Footer
        'footer.contacts': 'Contacts',
        'footer.contacts.address': '📍 15 Iskusstv Street, Moscow',
        'footer.hours': 'Opening Hours',
        'footer.weekdays': 'Mon-Fri: 10:00 - 20:00',
        'footer.holidays': 'Sat-Sun: 11:00 - 22:00',
        
        // Hero
        'hero.title': 'National Art Gallery',
        'hero.subtitle': 'Discover the world of beauty in our collection of world painting masterpieces',
        'hero.num_of_paintings': 'Paintings',
        'hero.num_of_painters': 'Painters',
        'hero.num_of_halls': 'Halls',
        'hero.quotes': [
            { text: '"Art is not what you see, but what you make others see"', author: 'Edgar Degas' },
            { text: '"Painting is poetry that is seen rather than felt, and poetry is painting that is felt rather than seen"', author: 'Leonardo da Vinci' },
            { text: '"Every work of art is the child of its time"', author: 'Wassily Kandinsky' },
            { text: '"Art washes away from the soul the dust of everyday life"', author: 'Pablo Picasso' },
            { text: '"The purpose of art is not to copy nature, but to express it"', author: 'Auguste Rodin' }
        ],
        
        // Sections
        'section.collection': 'Collection',
        'section.map': 'Gallery Map',
        'section.map.help': 'Click on point to open the painting',
        'section.stats': 'Visit Statistics',
        
        // Buttons
        'btn.view': 'View',
        'btn.back': '← Back',
        'btn.favorite': 'Add to Favorites',
        
        // Search
        'search.placeholder': 'Search by painting name and/or author',
        'search_failed': 'Nothing found for your request',
        
        // Facts
        'facts.interesting_facts': 'Interesting Facts',
        
        // Painting details
        'details.year_of_creation': 'Year of creation:',
        'details.drawing_technique': 'Drawing technique:',
        'details.dimensions': 'Dimensions:',
        'details.art_direction': 'Art direction:',
        'centimeters': 'cm',
        'click_to_zoom': 'Click to enlarge',
        
        // Reviews
        'reviews.title': 'Reviews',
        'reviews.leave_review': 'Leave a Review',
        'reviews.rating': 'Rating',
        'reviews.your_name': 'Your Name',
        'reviews.your_review': 'Your review...',
        'reviews.submit': 'Submit',
        'reviews.no_reviews': 'No reviews yet. Be the first!',
        'reviews.loading': 'Loading reviews...',
        'reviews.fill_fields': 'Please fill in all fields',
        
        // Filters
        'filters.show': 'Filters',
        'filters.hide': 'Hide Filters',
        'filters.found': 'Found',
        'filters.paintings': 'paintings',
        'filters.no_results': 'No results found for your query',
        'filters.no_results_hint': 'Try changing the filter parameters',
        'filters.reset': 'Reset Filters',
        'filters.clear': 'Clear',
        'filters.direction': 'Direction',
        'filters.technique': 'Technique',
        'filters.century': 'Century',
        'filters.year': 'Year',
        'filters.from': 'From',
        'filters.to': 'To',
        'filters.all': 'All',
        
        // Admin Panel
        'admin.panel': 'Admin Panel',
        'admin.paintings': 'Paintings',
        'admin.reviews': 'Reviews',
        'admin.add': 'Add Painting',
        'admin.edit': 'Edit',
        'admin.save': 'Save',
        'admin.create': 'Create',
        'admin.cancel': 'Cancel',
        'admin.confirm_delete': 'Delete painting?',
        'admin.title': 'Title',
        'admin.author': 'Author',
        'admin.year': 'Year',
        'admin.title_field': 'Title',
        'admin.author_field': 'Author',
        'admin.description': 'Description',
        'admin.facts': 'Facts',
        'admin.technique': 'Technique',
        'admin.direction': 'Direction',
        'admin.image': 'Image',
        'admin.image_hint': 'File will be uploaded automatically',
        'admin.reviews_moderation': 'Review Moderation',
        'admin.approve': 'Approve',
        'admin.reject': 'Reject',
        'admin.confirm_reject': 'Reject review?',
        'admin.painting': 'Painting',
        'admin.dimensions': 'Dimensions',
        
        // Statistics
        'stats.tab': 'Statistics',
        'stats.general': 'General Info',
        'stats.visits': 'Visits over period',
        'stats.unique': 'Unique Visitors',
        'stats.avg_time': 'Average Viewing Time',
        'stats.per_visit': 'Paintings per Visit',
        'stats.popular': 'Popular Paintings',
        'stats.route': 'Average Route',
        'stats.attention': 'By Attention Span',
        'stats.timeline': 'Visit Timeline',
        'stats.filter': 'Filter by time:',
        'stats.by_hours': 'By Hours',
        'stats.by_days': 'By Days',
        'stats.by_months': 'By Months',
        'stats.by_years': 'By Years',
        
        // Time
        'time.today': 'Today',
        'time.week': 'Week',
        'time.month': 'Month',
        'time.year': 'Year',
        'time.all': 'All Time',
        
        // Graph tooltips
        'stats.visits_per_hour': 'visits per hour',
        'stats.visits_per_day': 'visits per day',
        'stats.visits_per_month': 'visits per month',
        'stats.visits_per_year': 'visits per year'
    },

    de: {
        // Navigation
        'nav.home': 'Startseite',
        'nav.stats': 'Statistiken',
        
        // Footer
        'footer.contacts': 'Kontakt',
        'footer.contacts.address': '📍 Kunststraße 15, Moskau',
        'footer.hours': 'Öffnungszeiten',
        'footer.weekdays': 'Mo-Fr: 10:00 - 20:00',
        'footer.holidays': 'Sa-So: 11:00 - 22:00',
        
        // Hero
        'hero.title': 'Nationale Kunstgalerie',
        'hero.subtitle': 'Entdecken Sie die Welt des Schönen in unserer Sammlung von Meisterwerken der Weltmalerei',
        'hero.num_of_paintings': 'Gemälde',
        'hero.num_of_painters': 'Maler',
        'hero.num_of_halls': 'Säle',
        'hero.quotes': [
            { text: '„Die Kunst ist nicht das, was du siehst, sondern das, was du andere sehen lässt"', author: 'Edgar Degas' },
            { text: '„Malerei ist Poesie, die man sieht, und Poesie ist Malerei, die man fühlt"', author: 'Leonardo da Vinci' },
            { text: '„Jedes Kunstwerk ist ein Kind seiner Zeit"', author: 'Wassily Kandinsky' },
            { text: '„Die Kunst wäscht den Staub des Alltags von der Seele"', author: 'Pablo Picasso' },
            { text: '„Das Ziel der Kunst ist nicht, die Natur zu kopieren, sondern sie auszudrücken"', author: 'Auguste Rodin' }
        ],
        
        // Sections
        'section.collection': 'Sammlung',
        'section.map': 'Galeriekarte',
        'section.map.help': 'Klicken Sie auf einen Punkt, um das Gemälde zu öffnen',
        'section.stats': 'Besucherstatistiken',
        
        // Buttons
        'btn.view': 'Ansehen',
        'btn.back': '← Zurück',
        'btn.favorite': 'Zu Favoriten hinzufügen',
        
        // Search
        'search.placeholder': 'Suche nach Gemäldename und/oder Künstler',
        'search_failed': 'Nichts gefunden für Ihre Anfrage',
        
        // Facts
        'facts.interesting_facts': 'Interessante Fakten',
        
        // Painting details
        'details.year_of_creation': 'Entstehungsjahr:',
        'details.drawing_technique': 'Technik:',
        'details.dimensions': 'Abmessungen:',
        'details.art_direction': 'Stilrichtung:',
        'centimeters': 'cm',
        'click_to_zoom': 'Zum Vergrößern anklicken',
        
        // Reviews
        'reviews.title': 'Rezensionen',
        'reviews.leave_review': 'Rezension schreiben',
        'reviews.rating': 'Bewertung',
        'reviews.your_name': 'Ihr Name',
        'reviews.your_review': 'Ihre Bewertung...',
        'reviews.submit': 'Einreichen',
        'reviews.no_reviews': 'Es liegen noch keine Bewertungen vor. Sei der/die Erste!',
        'reviews.loading': 'Bewertungen werden geladen...',
        'reviews.fill_fields': 'Bitte alle Felder ausfüllen',
        
        // Filters
        'filters.show': 'Filter',
        'filters.hide': 'Filter ausblenden',
        'filters.found': 'Gefunden',
        'filters.paintings': 'Gemälde',
        'filters.no_results': 'Keine Ergebnisse für Ihre Anfrage',
        'filters.no_results_hint': 'Versuchen Sie, die Filterparameter zu ändern',
        'filters.reset': 'Filter zurücksetzen',
        'filters.clear': 'Löschen',
        'filters.direction': 'Stilrichtung',
        'filters.technique': 'Technik',
        'filters.century': 'Jahrhundert',
        'filters.year': 'Jahr',
        'filters.from': 'Von',
        'filters.to': 'Bis',
        'filters.all': 'Alle',
        
        // Admin Panel
        'admin.panel': 'Admin-Panel',
        'admin.paintings': 'Gemälde',
        'admin.reviews': 'Bewertungen',
        'admin.add': 'Gemälde hinzufügen',
        'admin.edit': 'Bearbeiten',
        'admin.save': 'Speichern',
        'admin.create': 'Erstellen',
        'admin.cancel': 'Abbrechen',
        'admin.confirm_delete': 'Gemälde löschen?',
        'admin.title': 'Titel',
        'admin.author': 'Künstler',
        'admin.year': 'Jahr',
        'admin.title_field': 'Titel',
        'admin.author_field': 'Künstler',
        'admin.description': 'Beschreibung',
        'admin.facts': 'Fakten',
        'admin.technique': 'Technik',
        'admin.direction': 'Stilrichtung',
        'admin.image': 'Bild',
        'admin.image_hint': 'Datei wird automatisch hochgeladen',
        'admin.reviews_moderation': 'Bewertungsmoderation',
        'admin.approve': 'Genehmigen',
        'admin.reject': 'Ablehnen',
        'admin.confirm_reject': 'Bewertung ablehnen?',
        'admin.painting': 'Gemälde',
        'admin.dimensions': 'Maße',
        
        // Statistics
        'stats.tab': 'Statistiken',
        'stats.general': 'Allgemeine Info',
        'stats.visits': 'Besuche im Zeitraum',
        'stats.unique': 'Einzigartige Besucher',
        'stats.avg_time': 'Durchschnittliche Betrachtungszeit',
        'stats.per_visit': 'Gemälde pro Besuch',
        'stats.popular': 'Beliebte Gemälde',
        'stats.route': 'Durchschnittliche Route',
        'stats.attention': 'Nach Aufmerksamkeit',
        'stats.timeline': 'Besuchsverlauf',
        'stats.filter': 'Nach Zeit filtern:',
        'stats.by_hours': 'Stündlich',
        'stats.by_days': 'Täglich',
        'stats.by_months': 'Monatlich',
        'stats.by_years': 'Jährlich',
        
        // Time
        'time.today': 'Heute',
        'time.week': 'Woche',
        'time.month': 'Monat',
        'time.year': 'Jahr',
        'time.all': 'Gesamter Zeitraum',
        
        // Graph tooltips
        'stats.visits_per_hour': 'Besuche pro Stunde',
        'stats.visits_per_day': 'Besuche pro Tag',
        'stats.visits_per_month': 'Besuche pro Monat',
        'stats.visits_per_year': 'Besuche pro Jahr'
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