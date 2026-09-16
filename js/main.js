/* =========================================================
   MAIN.JS — Elizabeth Sitawa Cancer C.B.O.
   Shared site behaviour: nav, scroll effects, reveal-on-scroll,
   FAQ accordion, story filter, and lightweight form handling.
   No external libraries; respects prefers-reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");

  function closeNav() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector("i").className = "bi bi-list";
  }

  function toggleNav() {
    if (!navLinks || !navToggle) return;
    var isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggle.querySelector("i").className = isOpen ? "bi bi-x-lg" : "bi bi-list";
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", toggleNav);
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---- Header solidify on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---- Scroll-reveal ---- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".acc-item").forEach(function (item) {
    var trigger = item.querySelector(".acc-trigger");
    var panel = item.querySelector(".acc-panel");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // close sibling items within the same accordion for a cleaner list
      item.parentElement.querySelectorAll(".acc-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
          openItem.querySelector(".acc-panel").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        item.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---- Stories pill filter ---- */
  var filterButtons = document.querySelectorAll(".pill-filter [data-filter]");
  var storyCards = document.querySelectorAll(".story-card[data-category]");
  if (filterButtons.length && storyCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");
        storyCards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* ---- Form handling (no backend wired up yet: confirm in-page) ---- */
  function wireForm(formId, confirmId) {
    var form = document.getElementById(formId);
    var confirmBox = document.getElementById(confirmId);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.hidden = true;
      if (confirmBox) {
        confirmBox.hidden = false;
        confirmBox.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    });
  }

  wireForm("story-form", "story-confirm");
  wireForm("register-form", "register-confirm");
  wireForm("contact-form", "contact-confirm");
})();
