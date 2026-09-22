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

  /* ---- Editorial (journey.html): reading progress, live word count,
     scrollspy on the table of contents, and a copy-link button. Scoped
     to pages that actually have the editorial layout. ---- */
  var edArticle = document.querySelector(".ed-article");
  if (edArticle) {
    var progressBar = document.getElementById("ed-progress-bar");
    if (progressBar) {
      var updateProgress = function () {
        var rect = edArticle.getBoundingClientRect();
        var articleTop = rect.top + window.scrollY;
        var total = edArticle.offsetHeight - window.innerHeight * 0.6;
        var scrolled = window.scrollY - articleTop + window.innerHeight * 0.3;
        var pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
        progressBar.style.width = pct + "%";
      };
      updateProgress();
      window.addEventListener("scroll", updateProgress, { passive: true });
      window.addEventListener("resize", updateProgress);
    }

    var readTimeEl = document.getElementById("ed-read-time");
    if (readTimeEl) {
      var wordCount = (edArticle.textContent || "").trim().split(/\s+/).length;
      var minutes = Math.max(1, Math.round(wordCount / 200));
      readTimeEl.innerHTML = '<i class="bi bi-clock"></i> ' + minutes + " min read";
    }

    var tocLinks = document.querySelectorAll(".ed-toc a[href^='#']");
    if (tocLinks.length && "IntersectionObserver" in window) {
      var sections = Array.prototype.map.call(tocLinks, function (a) {
        return document.getElementById(a.getAttribute("href").slice(1));
      }).filter(Boolean);
      var setActive = function (id) {
        tocLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
        });
      };
      var tocObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { tocObserver.observe(s); });
    }

    var copyBtn = document.getElementById("ed-copy-link");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = window.location.href;
        var done = function () {
          copyBtn.classList.add("copied");
          copyBtn.innerHTML = '<i class="bi bi-check2"></i>';
          setTimeout(function () {
            copyBtn.classList.remove("copied");
            copyBtn.innerHTML = '<i class="bi bi-link-45deg"></i>';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
          done();
        }
      });
    }
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
  wireForm("support-form", "support-confirm");
  wireForm("referral-form", "referral-confirm");
  wireForm("caregiver-form", "caregiver-confirm");

  /* ---- Donate modal ---- */
  var donateOverlay = document.getElementById("donate-overlay");
  if (donateOverlay) {
    var donateModal = donateOverlay.querySelector(".donate-modal");
    var donateClose = document.getElementById("donate-close");
    var step1 = document.getElementById("donate-step-1");
    var step2 = document.getElementById("donate-step-2");
    var resultView = document.getElementById("donate-result-view");
    var resultSummary = document.getElementById("donate-result-summary");
    var amountGrid = document.getElementById("amount-grid");
    var amountCustom = document.getElementById("amount-custom");
    var amountWrap = document.getElementById("amount-display-wrap");
    var errAmount = document.getElementById("err-amount");
    var currencySelect = document.getElementById("currency-select");
    var freqTabs = donateOverlay.querySelectorAll(".freq-btn[data-freq]");
    var methodButtons = donateOverlay.querySelectorAll(".payment-method[data-method]");
    var purposeSelect = document.getElementById("donate-purpose");
    var dedicateCheck = document.getElementById("donate-dedicate");
    var honoreeInput = document.getElementById("donate-honoree");
    var orgCheck = document.getElementById("donor-org");
    var orgNameInput = document.getElementById("donor-org-name");
    var donorFirst = document.getElementById("donor-first");
    var donorLast = document.getElementById("donor-last");
    var donorEmail = document.getElementById("donor-email");
    var donorAnon = document.getElementById("donor-anon");
    var donorTerms = document.getElementById("donor-terms");
    var errFirst = document.getElementById("err-donor-first");
    var errLast = document.getElementById("err-donor-last");
    var errEmail = document.getElementById("err-donor-email");
    var errTerms = document.getElementById("err-donor-terms");
    var progressBar = document.getElementById("donate-progress-bar");
    var step1Continue = document.getElementById("donate-step1-continue");
    var step2Continue = document.getElementById("donate-step2-continue");
    var backTo1 = document.getElementById("donate-back-1");
    var backTo2 = document.getElementById("donate-back-2");
    var lastFocused = null;

    /* Small validation helpers so every field and button on this form
       actually does something, not just look clickable. */
    function setFieldError(input, errEl, message) {
      if (errEl) errEl.textContent = message || "";
      if (input) {
        if (message) input.classList.add("input-error");
        else input.classList.remove("input-error");
      }
    }
    function clearFieldError(input, errEl) { setFieldError(input, errEl, ""); }
    function shake(el) {
      if (!el) return;
      el.classList.remove("donate-shake");
      void el.offsetWidth; /* restart animation */
      el.classList.add("donate-shake");
    }
    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    var PRESETS = {
      KES: [500, 1000, 2500, 5000, 10000, 20000],
      USD: [5, 10, 25, 50, 100, 200],
      GBP: [5, 10, 20, 40, 80, 150],
      EUR: [5, 10, 20, 50, 100, 180]
    };
    var currentCurrency = "KES";
    var currentSymbol = "KES ";
    var selectedAmount = null;
    var selectedFrequency = "One-time";
    var selectedMethod = "M-Pesa";

    function renderAmounts() {
      amountGrid.innerHTML = "";
      PRESETS[currentCurrency].forEach(function (val) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "amount-btn";
        btn.textContent = val >= 1000 ? Math.round(val / 1000) + "K" : val.toLocaleString();
        btn.setAttribute("data-value", val);
        btn.addEventListener("click", function () {
          selectedAmount = val;
          amountCustom.value = currentSymbol + val.toLocaleString();
          amountGrid.querySelectorAll(".amount-btn").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          setFieldError(amountWrap, errAmount, "");
        });
        amountGrid.appendChild(btn);
      });
    }
    renderAmounts();
    step2Continue.textContent = "Donate once";

    currencySelect.addEventListener("change", function () {
      var opt = currencySelect.options[currencySelect.selectedIndex];
      currentCurrency = opt.value;
      currentSymbol = opt.getAttribute("data-symbol");
      selectedAmount = null;
      amountCustom.value = "";
      renderAmounts();
    });

    freqTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        freqTabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        selectedFrequency = tab.getAttribute("data-freq");
        step2Continue.textContent = selectedFrequency === "Monthly" ? "Donate monthly" : "Donate once";
      });
    });

    methodButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        methodButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        selectedMethod = btn.getAttribute("data-method");
      });
    });

    amountCustom.addEventListener("input", function () {
      var num = parseFloat(amountCustom.value.replace(/[^0-9.]/g, ""));
      if (!isNaN(num) && num > 0) {
        selectedAmount = num;
        amountGrid.querySelectorAll(".amount-btn").forEach(function (b) { b.classList.remove("active"); });
        setFieldError(amountWrap, errAmount, "");
      } else {
        selectedAmount = null;
      }
    });

    dedicateCheck.addEventListener("change", function () {
      honoreeInput.hidden = !dedicateCheck.checked;
      if (dedicateCheck.checked) honoreeInput.focus();
    });

    orgCheck.addEventListener("change", function () {
      orgNameInput.hidden = !orgCheck.checked;
      if (orgCheck.checked) orgNameInput.focus();
    });

    [donorFirst, donorLast].forEach(function (input, i) {
      input.addEventListener("input", function () {
        setFieldError(input, i === 0 ? errFirst : errLast, "");
      });
    });
    donorEmail.addEventListener("input", function () {
      setFieldError(donorEmail, errEmail, "");
    });
    donorTerms.addEventListener("change", function () {
      if (donorTerms.checked) setFieldError(donorTerms, errTerms, "");
    });

    var PROGRESS = { 1: "50%", 2: "85%", 3: "100%" };
    function showStep(step) {
      step1.hidden = step !== 1;
      step2.hidden = step !== 2;
      resultView.hidden = step !== 3;
      if (progressBar) progressBar.style.width = PROGRESS[step];
      var toFocus = step === 1 ? donateClose : step === 2 ? backTo1 : backTo2;
      if (toFocus) toFocus.focus();
    }

    var lockedScrollY = 0;
    function openDonate() {
      lastFocused = document.activeElement;
      donateOverlay.classList.add("open");
      /* Robust cross-device scroll lock: fixing body in place (rather than
         just overflow:hidden) stops iOS Safari's visual viewport from
         drifting sideways while the modal is open, which is what made the
         header and modal content look shifted/cropped on some phones. */
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = "-" + lockedScrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      showStep(1);
      donateClose.focus();
    }
    function closeDonate() {
      donateOverlay.classList.remove("open");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, lockedScrollY);
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll("[data-open-donate]").forEach(function (trigger) {
      trigger.addEventListener("click", openDonate);
    });
    donateClose.addEventListener("click", closeDonate);
    donateOverlay.addEventListener("click", function (e) {
      if (e.target === donateOverlay) closeDonate();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && donateOverlay.classList.contains("open")) closeDonate();
    });
    // simple focus trap
    donateModal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var visibleParent = !step1.hidden ? step1 : !step2.hidden ? step2 : resultView;
      var focusable = donateModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      focusable = Array.prototype.filter.call(focusable, function (el) {
        return el === donateClose || visibleParent.contains(el);
      });
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    step1Continue.addEventListener("click", function () {
      if (!selectedAmount || selectedAmount <= 0) {
        setFieldError(amountWrap, errAmount, "Please choose or enter an amount to continue.");
        shake(amountWrap);
        amountCustom.focus();
        return;
      }
      showStep(2);
    });
    backTo1.addEventListener("click", function () { showStep(1); });

    step2Continue.addEventListener("click", function () {
      var valid = true;
      var firstInvalid = null;

      if (!donorFirst.value.trim()) {
        setFieldError(donorFirst, errFirst, "First name is required.");
        firstInvalid = firstInvalid || donorFirst;
        valid = false;
      }
      if (!donorLast.value.trim()) {
        setFieldError(donorLast, errLast, "Last name is required.");
        firstInvalid = firstInvalid || donorLast;
        valid = false;
      }
      if (!donorEmail.value.trim()) {
        setFieldError(donorEmail, errEmail, "Email address is required.");
        firstInvalid = firstInvalid || donorEmail;
        valid = false;
      } else if (!isValidEmail(donorEmail.value.trim())) {
        setFieldError(donorEmail, errEmail, "Enter a valid email address.");
        firstInvalid = firstInvalid || donorEmail;
        valid = false;
      }
      if (!donorTerms.checked) {
        setFieldError(donorTerms, errTerms, "Please agree to the Terms and Privacy Policy to continue.");
        firstInvalid = firstInvalid || donorTerms;
        valid = false;
      }

      if (!valid) {
        shake(step2.querySelector(".donate-step-scroll"));
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var amount = selectedAmount;
      var purpose = purposeSelect.value;
      var display = amount ? currentSymbol + amount.toLocaleString() : "your contribution";
      var freqText = selectedFrequency === "Monthly" ? " monthly" : "";
      var donorName = donorAnon.checked ? "" : (donorFirst.value.trim() + " " + donorLast.value.trim()).trim();
      var greeting = donorName && !donorAnon.checked ? "Thank you, " + donorName.split(" ")[0] + ". " : "Thank you for choosing to give ";
      resultSummary.textContent = greeting + (donorName && !donorAnon.checked ? "Your gift of " : "") + display + freqText + " toward " + purpose.toLowerCase() + " via " + selectedMethod + " has been recorded.";
      showStep(3);
    });
    backTo2.addEventListener("click", function () { showStep(2); });
  }
})();
