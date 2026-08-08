/* Bitway — shared site scripts
   Mobile menu, FAQ accordion, testimonials carousel, smooth scrolling,
   news filter/pagination, contact form handling. */
(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;

    var bars = toggle.querySelectorAll('span');

    function setOpen(open) {
      menu.classList.toggle('hidden', !open);
      menu.classList.toggle('flex', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (bars.length >= 2) {
        if (open) {
          bars[0].style.transform = 'rotate(45deg)';
          bars[1].style.transform = 'rotate(-45deg)';
        } else {
          bars[0].style.transform = '';
          bars[1].style.transform = '';
        }
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(menu.classList.contains('hidden'));
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var answer = item.querySelector('.faq-answer');
      var icon = item.querySelector('svg');
      if (!answer) return;

      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-expanded', 'false');

      function toggleItem() {
        var open = answer.classList.contains('hidden');
        // close others
        items.forEach(function (other) {
          if (other === item) return;
          var a = other.querySelector('.faq-answer');
          var i = other.querySelector('svg');
          if (a) a.classList.add('hidden');
          if (i) i.style.transform = '';
          other.setAttribute('aria-expanded', 'false');
        });
        answer.classList.toggle('hidden', !open);
        if (icon) icon.style.transform = open ? 'rotate(45deg)' : '';
        item.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      item.addEventListener('click', toggleItem);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem();
        }
      });
    });
  }

  /* ---------- Testimonials carousel ---------- */
  function initCarousel() {
    var section = document.querySelector('[aria-label="Testimonials section"]');
    if (!section) return;

    var viewport = section.querySelector('.cursor-grab');
    if (!viewport) return;
    var track = viewport.querySelector('.flex');
    if (!track) return;

    var slides = Array.prototype.filter.call(track.children, function (el) {
      return !el.className.match(/w-carousel-padding/);
    });
    if (!slides.length) return;

    var prevBtn = section.querySelector('button[aria-label="Previous"]');
    var nextBtn = section.querySelector('button[aria-label="Next"]');
    var progress = section.querySelector('.relative.h-2 > div');

    var index = 0;

    function maxOffset() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function offsetFor(i) {
      var base = slides[0].offsetLeft;
      return Math.min(slides[i].offsetLeft - base, maxOffset());
    }

    function update() {
      var offset = offsetFor(index);
      track.style.transition = 'transform 0.4s ease-out';
      track.style.transform = 'translate3d(' + (-offset) + 'px, 0, 0)';
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= slides.length - 1 || offset >= maxOffset();
      if (progress) {
        var pct = slides.length > 1 ? (index / (slides.length - 1)) * 100 : 0;
        progress.style.transform = 'translate3d(' + pct + '%, 0, 0)';
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      index = Math.max(0, index - 1);
      update();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      index = Math.min(slides.length - 1, index + 1);
      update();
    });

    /* drag / swipe support — listeners attached only while dragging */
    var startX = null;
    var startOffset = 0;

    function onPointerMove(e) {
      if (startX === null) return;
      var delta = e.clientX - startX;
      var offset = Math.min(Math.max(startOffset - delta, 0), maxOffset());
      track.style.transform = 'translate3d(' + (-offset) + 'px, 0, 0)';
    }

    function onPointerUp(e) {
      if (startX === null) return;
      var delta = e.clientX - startX;
      if (delta < -50) index = Math.min(slides.length - 1, index + 1);
      else if (delta > 50) index = Math.max(0, index - 1);
      startX = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      update();
    }

    viewport.addEventListener('pointerdown', function (e) {
      startX = e.clientX;
      startOffset = offsetFor(index);
      track.style.transition = 'none';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });

    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Smooth anchor scrolling ---------- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- News filter + pagination ---------- */
  function initNews() {
    var list = document.querySelector('[data-news-list]');
    if (!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-category]'));
    var filterBtns = document.querySelectorAll('[data-filter]');
    var pagination = document.querySelector('[data-news-pagination]');
    var perPage = 6;
    var currentFilter = 'all';
    var currentPage = 1;

    function visibleCards() {
      return cards.filter(function (c) {
        return currentFilter === 'all' || c.getAttribute('data-category') === currentFilter;
      });
    }

    function render() {
      var visible = visibleCards();
      var pages = Math.max(1, Math.ceil(visible.length / perPage));
      if (currentPage > pages) currentPage = pages;

      cards.forEach(function (c) { c.classList.add('hidden'); });
      visible
        .slice((currentPage - 1) * perPage, currentPage * perPage)
        .forEach(function (c) { c.classList.remove('hidden'); });

      if (pagination) {
        pagination.innerHTML = '';
        if (pages > 1) {
          for (var i = 1; i <= pages; i++) {
            (function (page) {
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.textContent = String(page);
              btn.className =
                'flex items-center justify-center h-8 px-3 rounded cursor-pointer text-sm ' +
                (page === currentPage ? 'primary-button text-primary-cta-text' : 'secondary-button text-secondary-cta-text');
              btn.addEventListener('click', function () {
                currentPage = page;
                render();
              });
              pagination.appendChild(btn);
            })(i);
          }
        }
      }

      filterBtns.forEach(function (b) {
        var active = b.getAttribute('data-filter') === currentFilter;
        b.classList.toggle('primary-button', active);
        b.classList.toggle('text-primary-cta-text', active);
        b.classList.toggle('secondary-button', !active);
        b.classList.toggle('text-secondary-cta-text', !active);
      });
    }

    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        currentFilter = b.getAttribute('data-filter');
        currentPage = 1;
        render();
      });
    });

    render();
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        if (status) {
          status.textContent = 'Please fill in all fields before submitting.';
          status.classList.remove('hidden');
        }
        return;
      }
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!emailOk) {
        if (status) {
          status.textContent = 'Please enter a valid email address.';
          status.classList.remove('hidden');
        }
        return;
      }

      var subject = 'Website enquiry from ' + name.value.trim();
      var bodyText = 'Name: ' + name.value.trim() + '\nEmail: ' + email.value.trim() + '\n\n' + message.value.trim();
      window.location.href =
        'mailto:info@bitway.ae?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);

      if (status) {
        status.textContent = 'Thank you! Your email client should open now. You can also write to us directly at info@bitway.ae.';
        status.classList.remove('hidden');
      }
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initFaq();
    initCarousel();
    initSmoothScroll();
    initNews();
    initContactForm();
  });
})();
