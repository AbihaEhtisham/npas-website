/* NPAS website: small, dependency-free behaviours.
   Everything here is progressive: pages still read correctly without JavaScript. */
(function () {
  "use strict";

  /* ---------- Navbar: transparent over the dark top, solid after scrolling ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("navLinks");

  function onScroll() {
    if (!nav) return;
    var open = links && links.classList.contains("open");
    nav.classList.toggle("is-solid", window.scrollY > 80 && !open);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      onScroll();
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        onScroll();
      }
    });
  }

  /* ---------- Countdown ---------- */
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var target = new Date(el.getAttribute("data-countdown")).getTime();
    var parts = {
      d: el.querySelector("[data-d]"), h: el.querySelector("[data-h]"),
      m: el.querySelector("[data-m]"), s: el.querySelector("[data-s]")
    };
    function pad(n) { return String(n).padStart(2, "0"); }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var s = Math.floor(diff / 1000);
      parts.d.textContent = pad(Math.floor(s / 86400));
      parts.h.textContent = pad(Math.floor((s % 86400) / 3600));
      parts.m.textContent = pad(Math.floor((s % 3600) / 60));
      parts.s.textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  });

  /* ---------- Filters (events + blog). Buttons [data-filter], items [data-cat] [data-year] ---------- */
  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var buttons = scope.querySelectorAll("[data-filter]");
    var yearSelect = scope.querySelector("[data-year-filter]");
    var items = scope.querySelectorAll("[data-cat]");
    var empty = scope.querySelector(".empty-state");
    var cat = "all";

    function apply() {
      var year = yearSelect ? yearSelect.value : "all";
      var shown = 0;
      items.forEach(function (item) {
        var okCat = cat === "all" || item.getAttribute("data-cat").split(" ").indexOf(cat) !== -1;
        var okYear = year === "all" || item.getAttribute("data-year") === year;
        var show = okCat && okYear;
        item.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.classList.toggle("show", shown === 0);
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        cat = btn.getAttribute("data-filter");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        apply();
      });
    });
    if (yearSelect) yearSelect.addEventListener("change", apply);
    var reset = scope.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", function () {
      cat = "all";
      if (yearSelect) yearSelect.value = "all";
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === "all")); });
      apply();
    });
  });

  /* ---------- Tabs (tenures). Supports #2023-24 style links ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[role=tab]"));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });

    function select(tab, focus) {
      tabs.forEach(function (t, i) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab);
        history.replaceState(null, "", "#" + tab.getAttribute("data-tab"));
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    var hash = decodeURIComponent(location.hash.replace("#", ""));
    var fromHash = tabs.filter(function (t) { return t.getAttribute("data-tab") === hash; })[0];
    select(fromHash || tabs[0]);
  });

  /* ---------- Lightbox for posters / photos ---------- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var inner = lightbox.querySelector(".lightbox-inner");
    document.querySelectorAll("[data-lightbox]").forEach(function (item) {
      item.addEventListener("click", function () {
        var clone = item.cloneNode(true);
        clone.removeAttribute("data-lightbox");
        clone.style.cursor = "default";
        inner.innerHTML = "";
        inner.appendChild(clone);
        lightbox.classList.add("open");
        lightbox.querySelector(".lightbox-close").focus();
      });
    });
    function closeBox() { lightbox.classList.remove("open"); }
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox || e.target.classList.contains("lightbox-close")) closeBox(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBox(); });
  }

  /* ---------- Form helpers ---------- */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function fieldOf(el) { return el.closest(".field"); }
  function setError(field, on, msg) {
    if (!field) return;
    field.classList.toggle("has-error", on);
    var err = field.querySelector(".err");
    if (err && msg) err.textContent = msg;
  }
  function validateField(input) {
    var field = fieldOf(input);
    var v = (input.value || "").trim();
    if (input.hasAttribute("required") && !v) { setError(field, true, "This field is required."); return false; }
    if (v && input.type === "email" && !emailRe.test(v)) { setError(field, true, "Enter a valid email address, like name@example.com."); return false; }
    if (v && input.type === "tel" && v.replace(/\D/g, "").length < 10) { setError(field, true, "Enter a phone number with at least 10 digits."); return false; }
    setError(field, false);
    return true;
  }
  function validateGroup(container) {
    var ok = true, first = null;
    container.querySelectorAll("input[required], select[required], textarea[required], input[type=email], input[type=tel]").forEach(function (input) {
      if (input.type === "checkbox" || input.type === "radio") return;
      if (!validateField(input)) { ok = false; first = first || input; }
    });
    container.querySelectorAll("[data-radio-required]").forEach(function (group) {
      var picked = group.querySelector("input:checked");
      setError(group, !picked, "Choose one option.");
      if (!picked) { ok = false; first = first || group.querySelector("input"); }
    });
    if (first) first.focus();
    return ok;
  }
  document.querySelectorAll(".field input, .field select, .field textarea").forEach(function (input) {
    input.addEventListener("blur", function () { if (input.type !== "checkbox" && input.type !== "radio") validateField(input); });
    input.addEventListener("input", function () { if (fieldOf(input) && fieldOf(input).classList.contains("has-error")) validateField(input); });
  });

  /* ---------- Contact / newsletter forms (design prototype: shows success state only) ---------- */
  document.querySelectorAll("[data-simple-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateGroup(form)) return;
      var success = form.parentElement.querySelector(".form-success");
      form.hidden = true;
      if (success) { success.classList.add("show"); success.querySelector("h3").focus(); }
    });
  });

  /* ---------- Multi-step registration form ---------- */
  var reg = document.querySelector("[data-stepper]");
  if (reg) {
    var steps = Array.prototype.slice.call(reg.querySelectorAll(".form-step"));
    var indicators = Array.prototype.slice.call(document.querySelectorAll(".steps .step"));
    var current = 0;

    function show(i) {
      current = i;
      steps.forEach(function (s, idx) { s.hidden = idx !== i; });
      indicators.forEach(function (ind, idx) {
        ind.classList.toggle("is-active", idx === i);
        ind.classList.toggle("is-done", idx < i);
        if (idx === i) ind.setAttribute("aria-current", "step"); else ind.removeAttribute("aria-current");
      });
      if (i === 2) fillReview();
      var top = reg.closest(".form-card");
      if (top) window.scrollTo({ top: top.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    }
    function val(name) { var el = reg.elements[name]; return el ? (el.value || "").trim() : ""; }
    function fillReview() {
      var events = Array.prototype.slice.call(reg.querySelectorAll("input[name=events]:checked")).map(function (c) { return c.value; });
      var ptype = reg.querySelector("input[name=ptype]:checked");
      var rows = [
        ["Full name", val("fullname")], ["Email", val("email")], ["Phone", val("phone")],
        ["Institution", val("institution")], ["Student ID", val("studentid") || "Not provided"], ["City", val("city")],
        ["Participant type", ptype ? ptype.value : "Not selected"],
        ["Events", events.length ? events.join(", ") : "None selected"],
        ["Competition", val("competition") || "None"]
      ];
      var dl = document.getElementById("reviewList");
      dl.innerHTML = "";
      rows.forEach(function (r) {
        var row = document.createElement("div"); row.className = "review-row";
        var dt = document.createElement("dt"); dt.textContent = r[0];
        var dd = document.createElement("dd"); dd.textContent = r[1];
        row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
      });
    }
    reg.querySelectorAll("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () { if (validateGroup(steps[current])) show(current + 1); });
    });
    reg.querySelectorAll("[data-prev]").forEach(function (b) {
      b.addEventListener("click", function () { show(current - 1); });
    });
    reg.querySelectorAll("[data-edit]").forEach(function (b) {
      b.addEventListener("click", function () { show(parseInt(b.getAttribute("data-edit"), 10)); });
    });
    reg.addEventListener("submit", function (e) {
      e.preventDefault();
      var consent = reg.querySelector("input[name=consent]");
      var cf = fieldOf(consent);
      if (!consent.checked) { setError(cf, true, "Please agree to continue."); consent.focus(); return; }
      setError(cf, false);
      var ref = "SW26-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      document.getElementById("refCode").textContent = ref;
      var card = reg.closest(".form-card");
      card.querySelector(".steps").hidden = true;
      reg.hidden = true;
      var success = card.querySelector(".form-success");
      success.classList.add("show");
      success.querySelector("h3").focus();
      window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    });
    show(0);
  }
})();
