(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Top bar border once scrolled
  var bar = document.querySelector('.topbar');
  function onScroll() { if (bar) bar.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = byId[e.target.id];
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObs.observe(el);
    });
  }

  // Gentle reveal on scroll
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.news li, .job, .paper, .card, .more li');
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { el.classList.add('reveal'); revealObs.observe(el); });
  }

  // Hero: a 32-token block being drafted, judged, and committed
  var row = document.querySelector('.block-row');
  if (!row) return;
  var N = 32;
  var cells = [];
  for (var i = 0; i < N; i++) {
    var s = document.createElement('span');
    row.appendChild(s);
    cells.push(s);
  }
  function setAll(cls) { cells.forEach(function (c) { c.className = cls; }); }

  if (reduceMotion) {
    cells.forEach(function (c, i) { c.className = i < 22 ? 'commit' : (i < 27 ? 'draft' : ''); });
    return;
  }

  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function cycle() {
    timers.forEach(clearTimeout);
    timers = [];
    setAll('');
    var t = 300;
    // Drafter pre-fills the block
    cells.forEach(function (c, i) { later(function () { c.className = 'draft'; }, t + i * 28); });
    t += N * 28 + 500;
    // Judge commits most tokens and re-masks a few
    var remask = {};
    while (Object.keys(remask).length < 7) remask[Math.floor(Math.random() * N)] = true;
    cells.forEach(function (c, i) {
      later(function () { c.className = remask[i] ? 'remask' : 'commit'; }, t + i * 22);
    });
    t += N * 22 + 700;
    // Re-masked tokens get redrafted, then committed
    Object.keys(remask).forEach(function (k, j) {
      later(function () { cells[k].className = 'draft'; }, t + j * 90);
      later(function () { cells[k].className = 'commit'; }, t + 700 + j * 90);
    });
    t += 700 + 7 * 90 + 1800;
    later(cycle, t);
  }

  // Only animate while the figure is on screen
  var running = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; cycle(); }
      if (!visible && running) { running = false; timers.forEach(clearTimeout); timers = []; }
    }).observe(row);
  } else {
    cycle();
  }
})();
