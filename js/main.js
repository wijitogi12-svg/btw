/* Sonic Observer — shared site scripts
   Handles: mobile/desktop navigation menu, FAQ accordion, smooth anchor
   scrolling, news filtering, contact form handling, back-to-top button. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- *
   * Navigation menu (open/close by burger button)
   * ---------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('nav-menu-open', open);
      toggle.classList.toggle('nav-toggle-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-lock', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('nav-menu-open'));
    });

    // Close menu when a link inside it is clicked
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link) setOpen(false);
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ---------------------------------------------------------------- *
   * FAQ accordion
   * ---------------------------------------------------------------- */
  function initFaq() {
    var items = document.querySelectorAll('[data-faq-item]');
    items.forEach(function (item) {
      var question = item.querySelector('[data-faq-question]');
      var answer = item.querySelector('[data-faq-answer]');
      var icon = item.querySelector('[data-faq-icon]');
      if (!question || !answer) return;

      question.setAttribute('role', 'button');
      question.setAttribute('tabindex', '0');
      question.setAttribute('aria-expanded', 'false');

      function toggleItem() {
        var open = item.classList.toggle('faq-open');
        question.setAttribute('aria-expanded', open ? 'true' : 'false');
        answer.style.maxHeight = open ? answer.scrollHeight + 'px' : '0px';
        if (icon) icon.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
      }

      question.addEventListener('click', toggleItem);
      question.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem();
        }
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Smooth scrolling for same-page anchors
   * ---------------------------------------------------------------- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = 96; // keep content clear of the fixed navbar
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  }

  /* ---------------------------------------------------------------- *
   * News filtering (news.html)
   * ---------------------------------------------------------------- */
  function initNewsFilter() {
    var buttons = document.querySelectorAll('[data-filter]');
    var cards = document.querySelectorAll('[data-category]');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          b.classList.toggle('filter-active', b === btn);
        });
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Contact form (client-side validation + confirmation message)
   * ---------------------------------------------------------------- */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#contact-name');
      var email = form.querySelector('#contact-email');
      var message = form.querySelector('#contact-message');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        if (status) {
          status.textContent = 'Please fill in your name, a valid email address and a message.';
          status.className = 'form-status form-status-error';
        }
        return;
      }

      form.reset();
      if (status) {
        status.textContent = 'Thank you. Your message has been recorded — the editorial team will reply to your email.';
        status.className = 'form-status form-status-ok';
      }
    });
  }

  /* ---------------------------------------------------------------- *
   * Back-to-top button
   * ---------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle('back-to-top-visible', window.pageYOffset > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------- *
   * Footer year
   * ---------------------------------------------------------------- */
  function initYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    initFaq();
    initSmoothScroll();
    initNewsFilter();
    initContactForm();
    initBackToTop();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
