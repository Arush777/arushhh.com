(function () {
  'use strict';
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- clock (IST) ---- */
  (function () {
    var els = $$('.clock'); if (!els.length) return;
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
    var tick = function () { var t = f.format(new Date()) + ' IST'; els.forEach(function (e) { e.textContent = t; }); };
    tick(); setInterval(tick, 15000);
  })();

  /* ---- lens glow ---- */
  if (FINE) $$('[data-lens]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---- nav: surface + scroll-spy ---- */
  (function () {
    var bar = $('.bar'); if (!bar) return;
    var surfaces = $$('[data-surface]');
    var links = $$('.nav a'); var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    function update() {
      var y = bar.getBoundingClientRect().bottom - 8, light = false;
      for (var i = 0; i < surfaces.length; i++) {
        var r = surfaces[i].getBoundingClientRect();
        if (r.top <= y && r.bottom > y) light = surfaces[i].dataset.surface === 'light';
      }
      bar.classList.toggle('on-light', light);
      var cur = null, line = innerHeight * 0.35;
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s.id; });
      links.forEach(function (a) { a.classList.toggle('active', byId[cur] === a); });
    }
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
  })();

  /* ---- highlights accordion ---- */
  (function () {
    var cards = $$('.hl'); if (!cards.length) return;
    var open = function (c) { cards.forEach(function (x) { x.classList.toggle('open', x === c); }); };
    open(cards[0]);
    cards.forEach(function (c) { c.addEventListener('pointerenter', function () { open(c); }); c.addEventListener('focusin', function () { open(c); }); });
  })();

  /* ---- expanding paper rows ---- */
  (function () {
    var list = $('#paper-list'); if (!list) return;
    var heads = $$('.paper-head', list);
    function setOpen(li, v) { li.classList.toggle('open', v); $('.paper-head', li).setAttribute('aria-expanded', v ? 'true' : 'false'); }
    heads.forEach(function (h) {
      h.addEventListener('click', function () { var li = h.parentElement; setOpen(li, !li.classList.contains('open')); });
    });
    list.addEventListener('keydown', function (e) {
      var keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']; if (keys.indexOf(e.key) < 0) return;
      var i = heads.indexOf(document.activeElement); if (i < 0) return; e.preventDefault();
      var j = e.key === 'ArrowDown' ? Math.min(i + 1, heads.length - 1) : e.key === 'ArrowUp' ? Math.max(i - 1, 0) : e.key === 'Home' ? 0 : heads.length - 1;
      heads[j].focus();
    });
    function fromHash() { var id = location.hash.slice(1); var li = id && document.getElementById(id); if (li && li.classList.contains('paper')) setOpen(li, true); }
    fromHash(); addEventListener('hashchange', fromHash);
    $$('a[href^="#paper-"]').forEach(function (a) { a.addEventListener('click', function () { var li = document.getElementById(a.getAttribute('href').slice(1)); if (li) setOpen(li, true); }); });
  })();

  /* ---- copy email ---- */
  (function () {
    var b = $('#copy-email'); if (!b) return; var live = $('#live');
    b.addEventListener('click', function () {
      var email = b.dataset.email;
      var done = function () { b.classList.add('done'); if (live) live.textContent = 'Email address copied: ' + email; setTimeout(function () { b.classList.remove('done'); }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, function () { location.href = 'mailto:' + email; });
      else location.href = 'mailto:' + email;
    });
  })();

  /* ---- draft-and-verify strip ---- */
  (function () {
    var line = $('#dv-line'), stat = $('#dv-stat'), kIn = $('#dv-k'), kOut = $('#dv-kv'), replay = $('#dv-replay');
    if (!line || !kIn) return;
    // Each token: [text, wrongDraft|null]. A wrong draft is what the cheap drafter proposes before the judge rejects it.
    var SENTS = [
      [['Diffusion'],['language'],['models'],['unmask','predict'],['a'],['whole'],['block','batch'],['of'],['tokens'],['at'],['once,'],['so'],['a'],['small'],['drafter'],['can'],['propose','guess'],['the'],['block'],['and'],['a'],['judge'],['keeps','checks'],['only'],['the'],['tokens'],['it'],['trusts.']],
      [['Against'],['the'],['30B'],["model's"],['own'],['block','token'],['decoding,'],['passes'],['per'],['block'],['fall'],['from'],['12.8'],['to'],['7.6','8.1'],['and'],['throughput'],['rises'],['1.35×','1.5×'],['at'],['the'],['same'],['accuracy.']],
      [['Research'],['and'],['engineering'],['is'],['my'],['moat:','edge:'],['a'],['method'],['is'],['only'],['real'],['once'],['the'],['evaluation','benchmark'],['says'],['it'],['is.']]
    ];
    var k = 5, kTarget = 5, timers = [], si = 0, pos = 0, spans = [], tokensOut = 0, bigCalls = 0, running = false;
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function setK(v) { k = Math.max(1, Math.min(8, Math.round(v))); kIn.value = k; kOut.textContent = k; }
    function readout() {
      var saved = bigCalls ? Math.max(0, Math.round(100 * (1 - bigCalls / Math.max(1, tokensOut)))) : 0;
      stat.textContent = 'large-model calls saved: ' + saved + '%' + (tokensOut ? ' · ' + tokensOut + ' tokens / ' + bigCalls + ' calls' : '');
    }
    function mk(text, cls) { var s = document.createElement('span'); s.className = 'tok ' + cls; s.textContent = text; return s; }
    function startSentence() {
      line.textContent = ''; spans = []; pos = 0;
      step();
    }
    function step() {
      var sent = SENTS[si];
      if (pos >= sent.length) { later(function () { si = (si + 1) % SENTS.length; tokensOut = 0; bigCalls = 0; readout(); startSentence(); }, 2200); return; }
      var block = sent.slice(pos, pos + k), drafted = [];
      // drafter proposes k tokens (wrong ones where it would be wrong)
      block.forEach(function (t, i) {
        var s = mk(t[1] || t[0], 'draft'); if (i) line.appendChild(document.createTextNode(' ')); else if (spans.length) line.appendChild(document.createTextNode(' '));
        line.appendChild(s); drafted.push(s);
      });
      bigCalls += 1; // one verifier pass per block
      // judge sweeps left to right
      var rejAt = -1;
      block.forEach(function (t, i) {
        later(function () {
          if (rejAt >= 0) return;
          if (t[1]) { rejAt = i; drafted[i].className = 'tok rej'; }
          else { drafted[i].className = 'tok ok'; tokensOut += 1; readout(); }
        }, 260 + i * 75);
      });
      later(function () {
        if (rejAt < 0) { // whole block accepted
          pos += block.length; spans = spans.concat(drafted);
          later(step, 160);
          return;
        }
        // drop everything after the rejection, type the corrected token
        for (var j = rejAt + 1; j < drafted.length; j++) drafted[j].className = 'tok drop';
        later(function () {
          for (var j = drafted.length - 1; j > rejAt; j--) { var n = drafted[j]; if (n.previousSibling && n.previousSibling.nodeType === 3) n.previousSibling.remove(); n.remove(); }
          var fix = mk(block[rejAt][0], 'fix'); line.appendChild(document.createTextNode(' ')); line.appendChild(fix);
          tokensOut += 1; readout();
          later(function () { drafted[rejAt].className = 'tok drop'; }, 500);
          later(function () { var n = drafted[rejAt]; if (n.previousSibling && n.previousSibling.nodeType === 3) n.previousSibling.remove(); n.remove(); fix.className = 'tok ok'; }, 800);
          pos += rejAt + 1; spans = spans.concat(drafted.slice(0, rejAt), [fix]);
          later(step, 900);
        }, 320);
      }, 260 + block.length * 75 + 120);
      // settle older accepted tokens so only the newest block carries the accent underline
      spans.forEach(function (s) { if (s.classList.contains('ok')) s.classList.add('settle'); });
    }
    function start() { if (running) return; running = true; clearTimers(); tokensOut = 0; bigCalls = 0; readout(); startSentence(); }
    function stop() { running = false; clearTimers(); }
    kIn.addEventListener('input', function () { setK(+kIn.value); kTarget = k; });
    replay.addEventListener('click', function () { stop(); si = 0; start(); });
    if (REDUCE) { readout(); stat.textContent = 'large-model calls saved: 37% (static)'; return; }
    if (FINE) {
      var hero = $('.hero');
      hero.addEventListener('pointermove', function (e) {
        var r = line.getBoundingClientRect(); if (e.clientY < r.top - 80 || e.clientY > r.bottom + 80) return;
        kTarget = 1 + 7 * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      });
      setInterval(function () { if (Math.abs(kTarget - k) >= 0.5) setK(k + (kTarget > k ? 1 : -1)); }, 220);
    }
    var seen = false;
    new IntersectionObserver(function (en) { if (en[0].isIntersecting) { if (!seen) { seen = true; start(); } else if (!running) start(); } else stop(); }).observe(line);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (seen) start(); });
  })();

  /* ---- KV-cache eviction mosaic ---- */
  (function () {
    var c = $('#kv'); if (!c || REDUCE) return; var ctx = c.getContext('2d'); if (!ctx) return;
    var COLS = 72, ROWS = 12, N = 0, BUDGET = 0, state, score, head = 0, alive = 0, raf = 0, last = 0, vis = false, w = 0, h = 0, dpr = 1;
    function reset() {
      N = COLS * ROWS; BUDGET = Math.round(N * 0.68); state = new Uint8Array(N); score = new Float32Array(N); head = 0; alive = 0;
      for (var i = 0; i < N * 0.95; i++) addToken();
    }
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); var r = c.getBoundingClientRect(); w = r.width; h = r.height;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var rows = Math.max(4, Math.round(COLS * h / Math.max(1, w))); if (rows !== ROWS || !state) { ROWS = rows; reset(); }
      paint();
    }
    function addToken() {
      var i = head % N; if (state[i] === 1 || state[i] === 2) alive--;
      var prot = (i % COLS) < 3 || Math.random() < 0.08; // sink, system and tool-schema tokens are protected
      state[i] = prot ? 2 : 1; score[i] = prot ? 1 : Math.random() * 0.8; alive++; head++;
      while (alive > BUDGET) { var best = -1, bs = 9; for (var j = 0; j < N; j++) if (state[j] === 1 && score[j] < bs) { bs = score[j]; best = j; } if (best < 0) break; state[best] = 3; alive--; }
    }
    function paint() {
      ctx.clearRect(0, 0, w, h);
      var cw = w / COLS, ch = h / ROWS, pad = Math.max(1, Math.min(cw, ch) * 0.2);
      for (var i = 0; i < N; i++) {
        var s = state[i]; if (!s) continue;
        var x = (i % COLS) * cw + pad / 2, y = Math.floor(i / COLS) * ch + pad / 2;
        if (s === 3) ctx.fillStyle = 'rgba(255,255,255,0.06)';
        else if (s === 2) ctx.fillStyle = 'rgba(25,198,165,' + (0.55 + 0.45 * score[i]) + ')';
        else ctx.fillStyle = 'rgba(233,232,227,' + (0.22 + 0.6 * score[i]) + ')';
        ctx.fillRect(x, y, cw - pad, ch - pad);
      }
      var hi = head % N, hx = (hi % COLS) * cw, hy = Math.floor(hi / COLS) * ch; ctx.fillStyle = '#8fe6d3'; ctx.fillRect(hx, hy, Math.max(2, cw * 0.14), ch);
    }
    function tick(t) { raf = requestAnimationFrame(tick); if (t - last < 120) return; last = t; for (var i = 0; i < N; i++) if (state[i] === 1) score[i] = Math.max(0.02, score[i] - 0.004); addToken(); paint(); }
    function sync() { var run = vis && !document.hidden; if (run && !raf) raf = requestAnimationFrame(tick); if (!run && raf) { cancelAnimationFrame(raf); raf = 0; } }
    size(); new ResizeObserver(size).observe(c);
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; sync(); }, { rootMargin: '100px' }).observe(c);
    document.addEventListener('visibilitychange', sync);
  })();
})();
