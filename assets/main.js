/* BTW News — site scripts: navbar, mobile menu, smooth scroll, FAQ, carousel, news filter, contact form */
(function () {
  'use strict';

  /* ---------- Navbar background on scroll ---------- */
  var navbar = document.getElementById('site-navbar');
  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 10) {
      navbar.classList.add('bg-background/80', 'backdrop-blur-md');
      navbar.classList.remove('bg-background/0', 'backdrop-blur-0');
    } else {
      navbar.classList.add('bg-background/0', 'backdrop-blur-0');
      navbar.classList.remove('bg-background/80', 'backdrop-blur-md');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* ---------- Mobile menu toggle ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('menu-icon-open');
  var iconClose = document.getElementById('menu-icon-close');

  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle('hidden', !open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (iconOpen) iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      setMenu(mobileMenu.classList.contains('hidden'));
    });
    // Close the menu when a link inside it is clicked
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    // Close when resizing up to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setMenu(false);
    });
  }

  /* ---------- Smooth scrolling for same-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 80; // navbar offset
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });
  // Links like "index.html#faq" on the index page itself
  document.querySelectorAll('a[href^="index.html#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href').split('#')[1];
      var target = id && document.getElementById(id);
      if (!target) return; // navigate normally on other pages
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var answer = item.querySelector('.faq-answer');
      var icon = item.querySelector('.faq-icon svg');
      if (!answer) return;
      var isOpen = !answer.classList.contains('hidden');
      // Close others within the same panel
      var panel = item.parentElement;
      if (panel) {
        panel.querySelectorAll('.faq-answer').forEach(function (a) { a.classList.add('hidden'); });
        panel.querySelectorAll('.faq-icon svg').forEach(function (s) { s.classList.remove('rotate-45'); });
      }
      if (!isOpen) {
        answer.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-45');
      }
    });
  });

  /* ---------- FAQ tabs ---------- */
  var faqTabs = document.querySelectorAll('.faq-tab');
  faqTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var value = tab.getAttribute('data-tab');
      faqTabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('primary-button', active);
        t.classList.toggle('text-primary-cta-text', active);
        t.classList.toggle('text-foreground', !active);
      });
      document.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
        var active = panel.getAttribute('data-tab-panel') === value;
        panel.classList.toggle('hidden', !active);
        panel.classList.toggle('flex', active);
      });
    });
  });

  /* ---------- Coverage carousel ---------- */
  var track = document.getElementById('carousel-track');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  if (track && prevBtn && nextBtn) {
    var slides = track.querySelectorAll('.carousel-slide');
    var index = 0;
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
    }
    prevBtn.addEventListener('click', function () { goTo(index - 1); });
    nextBtn.addEventListener('click', function () { goTo(index + 1); });
  }

  /* ---------- News category filter ---------- */
  var filterBtns = document.querySelectorAll('.news-filter-btn');
  var newsCards = document.querySelectorAll('.news-card');
  var newsEmpty = document.getElementById('news-empty');
  if (filterBtns.length && newsCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('primary-button', active);
          b.classList.toggle('text-primary-cta-text', active);
          b.classList.toggle('card', !active);
          b.classList.toggle('text-foreground', !active);
        });
        var visible = 0;
        newsCards.forEach(function (card) {
          var show = value === 'All' || card.getAttribute('data-category') === value;
          card.classList.toggle('hidden', !show);
          if (show) visible++;
        });
        if (newsEmpty) newsEmpty.classList.toggle('hidden', visible > 0);
      });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name');
      var email = document.getElementById('cf-email');
      var message = document.getElementById('cf-message');
      var error = document.getElementById('cf-error');
      var success = document.getElementById('cf-success');
      var emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var valid = name && name.value.trim() && emailOk && message && message.value.trim();
      if (error) error.classList.toggle('hidden', !!valid);
      if (!valid) {
        if (success) success.classList.add('hidden');
        return;
      }
      var subject = encodeURIComponent('BTW News — message from ' + name.value.trim());
      var body = encodeURIComponent(message.value.trim() + '\n\nFrom: ' + name.value.trim() + ' <' + email.value.trim() + '>');
      window.location.href = 'mailto:editorial@btwnews.example.com?subject=' + subject + '&body=' + body;
      if (success) success.classList.remove('hidden');
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
