import { currentLang, translations } from './i18n.js';
import { paintings } from './api.js';
import { escapeHtml } from './utils.js';

let fuse = null;
let searchResults = [];
let selectedResultIndex = -1;
let searchTimeout = null;

export function initFuseSearch(paintingsArray) {
  fuse = new Fuse(paintingsArray, {
    keys: [
      { name: 'title_ru', weight: 2 },
      { name: 'title_en', weight: 2 },
      { name: 'title_de', weight: 2 },
      { name: 'author_ru', weight: 1.5 },
      { name: 'author_en', weight: 1.5 },
      { name: 'author_de', weight: 1.5 },
      { name: 'art_direction_ru', weight: 1 },
      { name: 'art_direction_en', weight: 1 },
      { name: 'art_direction_de', weight: 1 }
    ],
    threshold: 0.4,
    distance: 100,
    ignoreLocation: true,
    includeMatches: true,
    minMatchCharLength: 2,
    findAllMatches: true,
    useExtendedSearch: true
  });
}

export function setupLiveSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    searchTimeout = setTimeout(() => {
      if (query.length >= 2) performSearch(query);
      else hideSearchDropdown();
    }, 250);
  });

  input.addEventListener('keydown', handleKeyDown);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) hideSearchDropdown();
  });
}

function handleKeyDown(e) {
  if (searchResults.length === 0) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedResultIndex = Math.min(selectedResultIndex + 1, searchResults.length - 1);
    updateDropdownSelection();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
    updateDropdownSelection();
  } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
    e.preventDefault();
    const painting = searchResults[selectedResultIndex].item;
    router('painting', painting.id);
    hideSearchDropdown();
    document.getElementById('search-input').value = '';
  } else if (e.key === 'Escape') {
    hideSearchDropdown();
  }
}

function performSearch(query) {
  if (!fuse) return;
  const results = fuse.search(query);
  searchResults = results.slice(0, 8);
  selectedResultIndex = -1;
  renderSearchDropdown(query);
}

function renderSearchDropdown(query) {
  const searchBox = document.querySelector('.search-box');
  if (!searchBox) return;
  let dropdown = document.getElementById('search-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'search-dropdown';
    dropdown.className = 'search-dropdown';
    searchBox.appendChild(dropdown);
  }

  if (searchResults.length === 0) {
    dropdown.innerHTML = `<div class="search-item empty">😔 ${translations[currentLang]['search_failed']} <strong>${escapeHtml(query)}</strong></div>`;
  } else {
    dropdown.innerHTML = searchResults.map((result, idx) => {
      const p = result.item;
      const title = p[`title_${currentLang}`] || p.title_en;
      const author = p[`author_${currentLang}`] || p.author_en;
      const highlightedTitle = highlightMatches(title, result.matches, 'title');
      const highlightedAuthor = highlightMatches(author, result.matches, 'author');
      return `
        <div class="search-item ${idx === selectedResultIndex ? 'selected' : ''}" data-index="${idx}" onclick="window.selectSearchResult(${p.id})">
          <div class="search-result-main">
            <span class="search-title">${highlightedTitle}</span>
            <span class="search-author">— ${highlightedAuthor}</span>
          </div>
          <div class="search-meta">
            <span class="search-year">${p.year}</span>
            ${p.art_direction_ru ? `<span class="search-direction">• ${currentLang === 'ru' ? p.art_direction_ru : p.art_direction_en}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
  dropdown.classList.add('show');
}

function highlightMatches(text, matches, fieldType) {
  if (!matches || !text) return escapeHtml(text);
  const fieldMatches = matches.filter(m => m.key === fieldType);
  if (fieldMatches.length === 0) return escapeHtml(text);
  const indices = new Set();
  fieldMatches.forEach(m => m.indices.forEach(([s, e]) => {
    for (let i = s; i <= e; i++) indices.add(i);
  }));
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = escapeHtml(text[i]);
    result += indices.has(i) ? `<mark>${char}</mark>` : char;
  }
  return result;
}

function updateDropdownSelection() {
  const items = document.querySelectorAll('#search-dropdown .search-item:not(.empty)');
  items.forEach((item, idx) => item.classList.toggle('selected', idx === selectedResultIndex));
  const selected = document.querySelector('#search-dropdown .search-item.selected');
  if (selected) selected.scrollIntoView({ block: 'nearest' });
}

function hideSearchDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
    setTimeout(() => {
      if (!dropdown.classList.contains('show')) dropdown.innerHTML = '';
    }, 150);
  }
  selectedResultIndex = -1;
}

window.selectSearchResult = (paintingId) => {
  router('painting', paintingId);
  hideSearchDropdown();
  document.getElementById('search-input').value = '';
};