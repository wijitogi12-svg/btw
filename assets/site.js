(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (mobileNav) mobileNav.classList.remove('open');
    });
  });

  document.querySelectorAll('[data-faq-item]').forEach((item) => {
    const btn = item.querySelector('[data-faq-toggle]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  const track = document.querySelector('[data-carousel-track]');
  const slides = track ? [...track.querySelectorAll('[data-slide]')] : [];
  let slideIndex = 0;
  const updateCarousel = () => {
    if (!track || slides.length === 0) return;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
  };
  document.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
    if (!slides.length) return;
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  });
  document.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
    if (!slides.length) return;
    slideIndex = (slideIndex + 1) % slides.length;
    updateCarousel();
  });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const newsItems = [...document.querySelectorAll('[data-news-item]')];
  const pagerPrev = document.querySelector('[data-page-prev]');
  const pagerNext = document.querySelector('[data-page-next]');
  const pagerLabel = document.querySelector('[data-page-label]');
  let selectedCategory = 'all';
  let currentPage = 1;
  const perPage = 2;

  const renderNews = () => {
    const filtered = newsItems.filter((item) => selectedCategory === 'all' || item.dataset.category === selectedCategory);
    const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    newsItems.forEach((item) => item.classList.add('hidden'));
    filtered.slice(start, end).forEach((item) => item.classList.remove('hidden'));

    if (pagerLabel) pagerLabel.textContent = `${currentPage} / ${pageCount}`;
    if (pagerPrev) pagerPrev.disabled = currentPage <= 1;
    if (pagerNext) pagerNext.disabled = currentPage >= pageCount;
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.filter || 'all';
      currentPage = 1;
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderNews();
    });
  });

  pagerPrev?.addEventListener('click', () => {
    currentPage -= 1;
    renderNews();
  });
  pagerNext?.addEventListener('click', () => {
    currentPage += 1;
    renderNews();
  });

  if (newsItems.length) renderNews();
})();
