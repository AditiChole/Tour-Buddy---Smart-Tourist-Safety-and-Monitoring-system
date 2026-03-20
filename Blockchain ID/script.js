const gallery = document.querySelector('.phone-gallery');
const dots = Array.from(document.querySelectorAll('.dot'));
const navButtons = Array.from(document.querySelectorAll('.nav-button'));
const slides = Array.from(document.querySelectorAll('.phone-frame'));

function updateDots() {
  if (!gallery || !slides.length) {
    return;
  }

  let activeIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;
  const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;

  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
    const distance = Math.abs(slideCenter - galleryCenter);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeIndex = index;
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function scrollToSlide(index) {
  const slide = slides[index];

  if (!slide) {
    return;
  }

  gallery.scrollTo({
    left: slide.offsetLeft - 12,
    behavior: 'smooth',
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const currentIndex = dots.findIndex((dot) => dot.classList.contains('active'));
    const direction = button.dataset.direction === 'next' ? 1 : -1;
    const nextIndex = (currentIndex + direction + slides.length) % slides.length;
    scrollToSlide(nextIndex);
  });
});

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    scrollToSlide(Number(dot.dataset.target));
  });
});

gallery?.addEventListener('scroll', updateDots, { passive: true });
window.addEventListener('load', updateDots);
window.addEventListener('resize', updateDots);
