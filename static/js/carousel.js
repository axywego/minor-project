import { PAINTINGS_PER_PAGE, CAROUSEL_DELAY } from './constants.js';
import { paintings, filteredPaintings } from './api.js'; // Добавляем filteredPaintings
import { renderCarouselSlide } from './pages/home.js';

let carouselInterval = null;
let currentSlide = 0;

export function startCarousel() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
    // Используем отфильтрованные картины
    const totalSlides = Math.ceil(filteredPaintings.length / PAINTINGS_PER_PAGE);
    if (totalSlides <= 1) return; // Не запускаем если только 1 слайд
    
    progressBar.style.animation = 'none';
    progressBar.offsetHeight;
    progressBar.style.animation = `progress ${CAROUSEL_DELAY / 1000}s linear`;

    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(() => nextSlide(), CAROUSEL_DELAY);
}

export function stopCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

export function nextSlide() {
    const totalSlides = Math.ceil(filteredPaintings.length / PAINTINGS_PER_PAGE);
    if (totalSlides <= 1) return;
    
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

export function prevSlide() {
    const totalSlides = Math.ceil(filteredPaintings.length / PAINTINGS_PER_PAGE);
    if (totalSlides <= 1) return;
    
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

// Добавляем функцию для перехода к конкретному слайду
export function goToSlide(index) {
    const totalSlides = Math.ceil(filteredPaintings.length / PAINTINGS_PER_PAGE);
    if (index < 0 || index >= totalSlides) return;
    
    currentSlide = index;
    updateCarousel();
}

// Сброс текущего слайда при изменении фильтров
export function resetCarousel() {
    currentSlide = 0;
    stopCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    
    track.style.opacity = '0';
    track.style.transform = 'translateY(20px)';

    setTimeout(() => {
        track.innerHTML = renderCarouselSlide(currentSlide);
        track.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        track.style.opacity = '1';
        track.style.transform = 'translateY(0)';

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.offsetHeight;
            progressBar.style.animation = `progress ${CAROUSEL_DELAY / 1000}s linear`;
        }

        restartCarousel();
    }, 500);
}

function restartCarousel() {
    stopCarousel();
    startCarousel();
}

// Создаем индикаторы слайдов (если нужно)
export function createSlideIndicators() {
    const totalSlides = Math.ceil(filteredPaintings.length / PAINTINGS_PER_PAGE);
    if (totalSlides <= 1) return '';
    
    let indicators = '<div class="slide-indicators">';
    for (let i = 0; i < totalSlides; i++) {
        indicators += `
            <button class="slide-indicator ${i === currentSlide ? 'active' : ''}" 
                    onclick="window.goToSlide(${i})"
                    aria-label="Перейти к слайду ${i + 1}">
            </button>
        `;
    }
    indicators += '</div>';
    return indicators;
}

// Глобальный доступ для HTML и обратной совместимости
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;