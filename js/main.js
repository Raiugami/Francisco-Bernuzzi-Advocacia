(function () {
  'use strict';

  /* ===== Configuração de contato (preencher quando o cliente enviar os dados) ===== */
  var CONFIG = {
    whatsapp: '5511945529277',          // só números, com DDI e DDD. Ex.: '5511999999999'
    mensagem: 'Olá, Dr. Francisco! Gostaria de agendar uma conversa.',
    email: '',
    telefone: '+55 11 94552-9277',
    endereco: '',
    oab: 'OAB/SP 115.442'                // Ex.: 'OAB/UF 00.000'
  };

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ===== Abertura (a cada visita; clique pula) ===== */
  var intro = $('#intro');
  if (reduce) {
    root.classList.add('no-intro');
  } else {
    root.style.setProperty('--hd', '2.45s');
    document.body.style.overflow = 'hidden';
    var closed = false;
    var closeIntro = function () {
      if (closed) return;
      closed = true;
      if (performance.now() < 2200) root.style.setProperty('--hd', '.3s');
      intro.classList.add('done');
      document.body.style.overflow = '';
    };
    setTimeout(closeIntro, 2300);
    intro.addEventListener('click', closeIntro);
  }

  /* ===== Contatos ===== */
  var waHref = CONFIG.whatsapp
    ? 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(CONFIG.mensagem)
    : '';
  $$('[data-wa]').forEach(function (a) {
    if (waHref) { a.href = waHref; a.target = '_blank'; a.rel = 'noopener'; }
    else { a.href = '#contato'; a.removeAttribute('target'); }
  });
  function fill(key, text, href) {
    var li = $('[data-contact="' + key + '"]');
    if (!li || !text) return;
    li.hidden = false;
    var a = $('a', li), b = $('b', li);
    if (a) { a.textContent = text; a.href = href; }
    if (b) b.textContent = text;
  }
  fill('email', CONFIG.email, 'mailto:' + CONFIG.email);
  fill('phone', CONFIG.telefone, 'tel:' + CONFIG.telefone.replace(/[^\d+]/g, ''));
  fill('address', CONFIG.endereco);
  fill('oab', CONFIG.oab);
  $('#year').textContent = new Date().getFullYear();

  /* ===== Header, progresso, FAB, parallax ===== */
  var header = $('#header'), bar = $('#progress'), fab = $('.wa-fab'), mark = $('#heroMark');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    fab.classList.toggle('show', y > innerHeight * 0.6);
    if (!reduce && mark && y < innerHeight * 1.2) mark.style.setProperty('--py', (y * 0.12) + 'px');
    updateQuote(); updateTimeline();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ===== Menu mobile ===== */
  var btn = $('#menuBtn'), nav = $('#nav');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ===== Link ativo no menu ===== */
  if ('IntersectionObserver' in window) {
    var links = $$('.nav a[href^="#"]:not(.nav-cta)');
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['topo', 'sobre', 'areas', 'atuacao', 'duvidas'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ===== Entrada ao rolar ===== */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ===== Contadores ===== */
  $$('.count').forEach(function (el) {
    var to = +el.dataset.to;
    if (reduce || !('IntersectionObserver' in window)) return;
    var co = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      co.disconnect();
      var t0 = performance.now(), dur = 1600;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    el.textContent = '0';
    co.observe(el);
  });

  /* ===== Painéis de áreas ===== */
  var panels = $('#panels'), items = $$('.panel', panels);
  var mqMobile = window.matchMedia('(max-width: 960px)');
  function openPanel(i) {
    panels.dataset.open = i;
    items.forEach(function (p, k) {
      var on = k === i;
      p.classList.toggle('is-open', on);
      $('.panel-btn', p).setAttribute('aria-expanded', on);
    });
  }
  panels.dataset.open = 0;
  items.forEach(function (p, i) {
    var b = $('.panel-btn', p);
    b.addEventListener('click', function () { openPanel(i); });
    if (finePointer) b.addEventListener('mouseenter', function () { if (!mqMobile.matches) openPanel(i); });
    p.addEventListener('pointermove', function (e) {
      var r = p.getBoundingClientRect();
      p.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      p.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
  });

  /* ===== Citação: palavras acendem com a rolagem ===== */
  var qt = $('#quoteText'), qWords = [];
  var qTxt = qt.textContent.trim();
  qt.setAttribute('aria-label', qTxt);
  qt.textContent = '';
  qTxt.split(/\s+/).forEach(function (w, i, arr) {
    var s = document.createElement('span');
    s.className = 'w'; s.textContent = w; s.setAttribute('aria-hidden', 'true');
    qt.appendChild(s);
    if (i < arr.length - 1) qt.appendChild(document.createTextNode(' '));
    qWords.push(s);
  });
  function updateQuote() {
    if (reduce) return;
    var r = qt.getBoundingClientRect();
    var p = (innerHeight * 0.85 - r.top) / (innerHeight * 0.55 + r.height * 0.5);
    p = Math.max(0, Math.min(1, p));
    var n = Math.round(p * qWords.length);
    qWords.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
  }

  /* ===== Linha do tempo desenhada na rolagem ===== */
  var tl = $('#timeline'), steps = $$('.step', tl);
  function updateTimeline() {
    var r = tl.getBoundingClientRect();
    var p = (innerHeight * 0.65 - r.top) / r.height;
    tl.style.setProperty('--tl', Math.max(0, Math.min(1, p)));
    steps.forEach(function (s) {
      var sr = s.getBoundingClientRect();
      s.classList.toggle('in', sr.top < innerHeight * 0.65);
    });
  }

  /* ===== Brilho do cursor, holofote do hero e botões magnéticos ===== */
  if (finePointer && !reduce) {
    var glow = $('#cursorGlow'), spot = $('#heroSpot'), hero = $('.hero');
    var gx = 0, gy = 0, pending = false;
    window.addEventListener('pointermove', function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!pending) {
        pending = true;
        requestAnimationFrame(function () {
          glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
          glow.classList.add('on');
          var r = hero.getBoundingClientRect();
          spot.style.setProperty('--mx', (gx - r.left) + 'px');
          spot.style.setProperty('--my', (gy - r.top) + 'px');
          pending = false;
        });
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });

    $$('.magnetic').forEach(function (m) {
      m.addEventListener('pointermove', function (e) {
        var r = m.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        m.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      m.addEventListener('pointerleave', function () { m.style.transform = ''; });
    });
  }

  /* ===== FAQ: um aberto por vez ===== */
  var dets = $$('.faq-list details');
  dets.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  onScroll();
})();
