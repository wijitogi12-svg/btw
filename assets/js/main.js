/*
 * Bitway Brief — front-end behaviour.
 * Handles: mobile navigation, FAQ accordions, anchor smooth scrolling,
 * article filtering + pagination, contact form validation and small UI helpers.
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* ---------------------------------------------------------------- navbar */
  function initNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!toggle || !panel) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (event.target.closest('[data-menu-panel]') || event.target.closest('[data-menu-toggle]')) return;
      setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setOpen(false);
    });
  }

  /* --------------------------------------------------------- nav on scroll */
  function initScrollState() {
    var nav = document.querySelector('[data-section="navbar"]');
    if (!nav) return;

    function update() {
      nav.classList.toggle('opacity-90', window.scrollY > 40);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------- FAQ */
  function initFaq() {
    var items = document.querySelectorAll('[data-faq-item]');
    Array.prototype.forEach.call(items, function (item) {
      var trigger = item.querySelector('[data-faq-trigger]');
      var answer = item.querySelector('[data-faq-answer]');
      if (!trigger || !answer) return;

      if (!answer.id) {
        answer.id = 'faq-answer-' + Math.random().toString(36).slice(2, 9);
      }
      trigger.setAttribute('aria-controls', answer.id);
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          trigger.click();
        }
      });
    });
  }

  /* --------------------------------------------------------- smooth scroll */
  function initAnchors() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', hash);
    });
  }

  /* ------------------------------------------------ article list + paging  */
  function initArticleList() {
    var list = document.querySelector('[data-article-list]');
    if (!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-article]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var pagination = document.querySelector('[data-pagination]');
    var empty = document.querySelector('[data-empty-state]');
    var perPage = parseInt(list.getAttribute('data-per-page'), 10) || 6;
    var activeFilter = 'all';
    var page = 1;

    function matches(card) {
      return activeFilter === 'all' || (card.getAttribute('data-topics') || '').split(' ').indexOf(activeFilter) !== -1;
    }

    function render() {
      var visible = cards.filter(matches);
      var pages = Math.max(1, Math.ceil(visible.length / perPage));
      if (page > pages) page = pages;

      cards.forEach(function (card) {
        card.classList.add('is-hidden');
      });
      visible.slice((page - 1) * perPage, page * perPage).forEach(function (card) {
        card.classList.remove('is-hidden');
      });

      if (empty) empty.classList.toggle('is-hidden', visible.length !== 0);
      renderPagination(pages);
    }

    function renderPagination(pages) {
      if (!pagination) return;
      pagination.innerHTML = '';
      if (pages < 2) return;

      function button(label, targetPage, options) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn';
        btn.textContent = label;
        if (options && options.disabled) btn.disabled = true;
        if (options && options.current) btn.setAttribute('aria-current', 'true');
        btn.addEventListener('click', function () {
          page = targetPage;
          render();
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        pagination.appendChild(btn);
      }

      button('Prev', Math.max(1, page - 1), { disabled: page === 1 });
      for (var i = 1; i <= pages; i += 1) {
        button(String(i), i, { current: i === page });
      }
      button('Next', Math.min(pages, page + 1), { disabled: page === pages });
    }

    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', chip.getAttribute('data-filter') === activeFilter ? 'true' : 'false');
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || 'all';
        page = 1;
        chips.forEach(function (other) {
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        render();
      });
    });

    render();
  }

  /* ---------------------------------------------------------------- forms  */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var status = form.querySelector('[data-form-status]');

    function fail(message) {
      if (!status) return;
      status.textContent = message;
      status.setAttribute('data-state', 'error');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = (form.elements.name && form.elements.name.value || '').trim();
      var email = (form.elements.email && form.elements.email.value || '').trim();
      var message = (form.elements.message && form.elements.message.value || '').trim();

      if (name.length < 2) return fail('Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail('Please enter a valid email address.');
      if (message.length < 20) return fail('Please provide a message of at least 20 characters.');

      var subject = 'Website enquiry from ' + name;
      var body = message + '\n\n--\n' + name + ' <' + email + '>';
      if (status) {
        status.removeAttribute('data-state');
        status.textContent = 'Opening your email client so you can send the message to the editorial desk.';
      }
      window.location.href =
        'mailto:editorial@bitwaybrief.example?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);
    });
  }

  /* ------------------------------------------------------------- utilities */
  function initYear() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-current-year]'), function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initReveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(nodes, function (node) {
        node.style.opacity = '1';
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          entry.target.style.filter = 'blur(0px)';
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    Array.prototype.forEach.call(nodes, function (node) {
      node.style.opacity = '0';
      node.style.transform = 'translateY(12px)';
      node.style.transition = 'opacity .6s ease, transform .6s ease, filter .6s ease';
      observer.observe(node);
    });
  }

  ready(function () {
    initNavigation();
    initScrollState();
    initFaq();
    initAnchors();
    initArticleList();
    initContactForm();
    initYear();
    initReveal();
  });
})();
