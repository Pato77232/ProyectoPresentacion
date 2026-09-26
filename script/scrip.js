// =========================================================
// Los Backyardigans — comportamiento de scroll
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  setupHeroFade(prefersReducedMotion);
  revealMemberRows(prefersReducedMotion);
});

/**
 * Mientras se hace scroll dentro de .hero-wrap, el contenido del hero
 * (imagen de fondo + círculos) se encoge y se desvanece progresivamente.
 */
function setupHeroFade(skipAnimation) {
  const heroWrap = document.querySelector('.hero-wrap');
  const heroContent = document.getElementById('heroContent');
  if (!heroWrap || !heroContent) return;

  if (skipAnimation) {
    heroContent.style.setProperty('--hero-scale', 1);
    heroContent.style.setProperty('--hero-opacity', 1);
    return;
  }

  const MIN_SCALE = 0.82;
  let ticking = false;

  function updateHero() {
    const wrapTop = heroWrap.offsetTop;
    const wrapHeight = heroWrap.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollRange = Math.max(wrapHeight - viewportHeight, 1);

    const scrolled = window.scrollY - wrapTop;
    const progress = clamp(scrolled / scrollRange, 0, 1);

    const scale = 1 - (1 - MIN_SCALE) * progress;
    const opacity = 1 - progress;

    heroContent.style.setProperty('--hero-scale', scale.toFixed(3));
    heroContent.style.setProperty('--hero-opacity', opacity.toFixed(3));

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHero);
      ticking = true;
    }
  }

  updateHero();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Revela cada sección de integrante con un fundo suave
 * a medida que entra en el viewport.
 */
function revealMemberRows(skipAnimation) {
  const rows = document.querySelectorAll('.member-row');
  if (!rows.length) return;

  if (skipAnimation || !('IntersectionObserver' in window)) {
    rows.forEach((row) => row.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  rows.forEach((row) => observer.observe(row));
}