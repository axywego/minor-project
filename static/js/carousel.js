import { PAINTINGS_PER_PAGE, CAROUSEL_DELAY } from './constants.js';
import { paintings } from './api.js';
import { renderCarouselSlide } from './pages/home.js';

let carouselInterval = null;
let currentSlide = 0;

export function startCarousel() {
  const progressBar = document.getElementById('progress-bar');
  if (!progressBar) return;
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
  const totalSlides = Math.ceil(paintings.length / PAINTINGS_PER_PAGE);
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

export function prevSlide() {
  const totalSlides = Math.ceil(paintings.length / PAINTINGS_PER_PAGE);
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
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

// Глобальный доступ для HTML
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;