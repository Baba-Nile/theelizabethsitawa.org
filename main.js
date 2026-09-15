// Elizabeth Sitawa Cancer C.B.O. — shared behavior
document.addEventListener('DOMContentLoaded', function () {

  // Sticky header shadow state
  var header = document.querySelector('.site-header');
  if (header) {
    var setScrolled = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  // Scroll-reveal (.reveal / .reveal-left / .reveal-right / .reveal-scale)
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  var reduceMotionReveal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (revealEls.length && !reduceMotionReveal && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i class="bi bi-list"></i>';
      });
    });
  }

  // Accordion (FAQ)
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var trigger = item.querySelector('.acc-trigger');
    var panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.acc-panel').style.maxHeight = null;
          other.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Story filter (Stories & Voices page)
  var filterBtns = document.querySelectorAll('.pill-filter button');
  var storyCards = document.querySelectorAll('.story-card');
  if (filterBtns.length && storyCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');
        storyCards.forEach(function (card) {
          var show = cat === 'all' || card.getAttribute('data-category') === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  // Gentle number count-up for stat sections (respects reduced motion)
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = document.querySelectorAll('.stat-num[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = 0;
        var duration = 900;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          el.textContent = Math.floor(progress * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { obs.observe(c); });
  }

  // Story submission form — front-end only demo handling
  var storyForm = document.getElementById('story-form');
  if (storyForm) {
    storyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var confirmBox = document.getElementById('story-confirm');
      storyForm.style.display = 'none';
      if (confirmBox) confirmBox.hidden = false;
    });
  }

  // Registration form (Get Involved) — front-end only demo handling
  var regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var confirmBox = document.getElementById('register-confirm');
      regForm.style.display = 'none';
      if (confirmBox) confirmBox.hidden = false;
    });
  }

  // Contact form — front-end only demo handling
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var confirmBox = document.getElementById('contact-confirm');
      contactForm.style.display = 'none';
      if (confirmBox) confirmBox.hidden = false;
    });
  }
});
