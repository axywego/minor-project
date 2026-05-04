// pages/paintingDetail.js
import { translations, currentLang } from '../i18n.js';
import { fetchPainting, fetchReviews, addReview, likeReview } from '../api.js';
import { parseFacts } from '../utils.js';
import { stopCarousel } from '../carousel.js';

export async function renderPaintingDetail(container, id) {
    const t = translations[currentLang];
    stopCarousel();

    try {
        const p = await fetchPainting(id);
        const lang = currentLang;

        p.title = p[`title_${lang}`] || p.title_en;
        p.author = p[`author_${lang}`] || p.author_en;
        p.description = p[`description_${lang}`] || p.description_en;
        p.drawing_technique = p[`drawing_technique_${lang}`] || p.drawing_technique_en;
        p.art_direction = p[`art_direction_${lang}`] || p.art_direction_en;
        const factsRaw = p[`facts_${lang}`] || p.facts_en;
        p.facts = parseFacts(factsRaw);

        container.innerHTML = `
            <div class="painting-detail">
                <div class="container">
                    <button onclick="router('home')" class="btn-back">← ${t['btn.back']}</button>
                    <div class="detail-grid">
                        <div class="slideshow-section">
                            <div class="image-frame" onclick="window.openImageModal('${p.image_uri}', '${p.title}')">
                                <img src="${p.image_uri}" alt="${p.title}" class="detail-image">
                                <div class="zoom-hint">🔍 ${t['click_to_zoom'] || 'Нажмите для увеличения'}</div>
                            </div>
                        </div>
                        <div class="info-section">
                            <div class="info-card">
                                <h1 class="painting-title">${p.title}</h1>
                                <p class="painting-author">${p.author}, ${p.year}</p>
                                <div class="info-details">
                                    <div class="detail-row">
                                        <span class="detail-label">${t['details.year_of_creation']}</span>
                                        <span class="detail-value">${p.year}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">${t['details.drawing_technique']}</span>
                                        <span class="detail-value">${p.drawing_technique}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">${t['details.dimensions']}</span>
                                        <span class="detail-value">${p.dimensions}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">${t['details.art_direction']}</span>
                                        <span class="detail-value">${p.art_direction}</span>
                                    </div>
                                </div>
                                <p class="painting-description">${p.description}</p>
                            </div>
                        </div>
                    </div>
                    
                    <section class="facts-section">
                        <h2 class="section-title">${t['facts.interesting_facts']}</h2>
                        <div class="facts-grid">
                            ${p.facts.map(fact => `<div class="fact-card"><p>${fact}</p></div>`).join('')}
                        </div>
                    </section>

                    <section class="reviews-section">
                        <h2 class="section-title">${t['reviews.title'] || 'Отзывы'}</h2>
                        <div class="review-form">
                            <h3>${t['reviews.leave_review'] || 'Оставить отзыв'}</h3>
                            <div class="rating-input">
                                <span class="rating-label">${t['reviews.rating'] || 'Оценка'}:</span>
                                <div class="stars" id="rating-stars">
                                    ${[5,4,3,2,1].map(i => `
                                        <input type="radio" id="star${i}" name="rating" value="${i}">
                                        <label for="star${i}">★</label>
                                    `).join('')}
                                </div>
                            </div>
                            <input type="text" id="review-author" class="review-input" 
                                   placeholder="${t['reviews.your_name'] || 'Ваше имя'}">
                            <textarea id="review-text" class="review-textarea" 
                                      placeholder="${t['reviews.your_review'] || 'Ваш отзыв...'}"></textarea>
                            <button class="btn-submit-review" onclick="window.submitReview(${p.id})">
                                ${t['reviews.submit'] || 'Отправить'}
                            </button>
                        </div>
                        <div class="reviews-list" id="reviews-list">
                            <div class="loading">${t['loading'] || 'Загрузка отзывов...'}</div>
                        </div>
                    </section>
                </div>
            </div>
            
            <!-- Модальное окно для изображения -->
            <div class="image-modal" id="image-modal" onclick="window.closeImageModal()">
                <span class="modal-close" onclick="window.closeImageModal()">✕</span>
                <img class="modal-content" id="modal-image" src="${p.image_uri}" alt="${p.title}">
                <div class="modal-caption" id="modal-caption">${p.title}</div>
            </div>
        `;

        // Загружаем отзывы
        loadReviews(p.id);
        
        // Глобальные функции для модального окна
        window.openImageModal = function(imageSrc, title) {
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const caption = document.getElementById('modal-caption');
            
            if (modal && modalImg) {
                modal.style.display = 'flex';
                modalImg.src = imageSrc;
                if (caption) caption.textContent = title;
                document.body.style.overflow = 'hidden';
            }
        };

        window.closeImageModal = function(event) {
            if (event && event.target !== event.currentTarget) return;
            const modal = document.getElementById('image-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };

        // Отправка отзыва
        window.submitReview = async function(paintingId) {
            const author = document.getElementById('review-author').value.trim();
            const text = document.getElementById('review-text').value.trim();
            const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;

            if (!author || !text) {
                alert(t['reviews.fill_fields'] || 'Заполните все поля');
                return;
            }

            const result = await addReview(paintingId, {
                author,
                text,
                rating: parseInt(rating)
            });

            if (result.status === 'ok') {
                document.getElementById('review-author').value = '';
                document.getElementById('review-text').value = '';
                document.querySelector('input[name="rating"]:checked').checked = false;
                loadReviews(paintingId);
            }
        };

        // Лайк отзыва
        window.likeReviewFunc = async function(reviewId) {
            const result = await likeReview(reviewId);
            if (result.status === 'ok') {
                await loadReviews(p.id);
            }
        };

    } catch (e) {
        console.error(e);
        container.innerHTML = '<h2>Ошибка загрузки картины</h2>';
    }
}

async function loadReviews(paintingId) {
    const container = document.getElementById('reviews-list');
    if (!container) return;

    try {
        const data = await fetchReviews(paintingId);
        const reviews = data.reviews || [];

        if (reviews.length === 0) {
            const t = translations[currentLang];
            container.innerHTML = `<p class="no-reviews">${t['reviews.no_reviews'] || 'Пока нет отзывов. Будьте первым!'}</p>`;
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${review.author}</span>
                    <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                    <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p class="review-text">${review.text}</p>
                <div class="review-footer">
                    <button class="btn-like" onclick="window.likeReviewFunc(${review.id})">
                        👍 <span class="likes-count">${review.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p>Ошибка загрузки отзывов</p>';
    }
}