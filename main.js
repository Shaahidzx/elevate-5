(() => {
'use strict';

const E = window.ELEVATE;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const small = innerWidth < 720;
const motion = !!window.gsap && !!window.ScrollTrigger && !calm;
if (motion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0); // real time: on a slow device animations drop frames but still finish on schedule
} else root.classList.remove('play-intro'); // no animation library or reduced motion: no letter

const money = n => `${E.currency} ${n.toLocaleString('en-US')}`;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
const rand = (a, b) => a + Math.random() * (b - a);

// Wraps each character in a span, keeping words unbreakable and the text readable to screen readers.
function splitChars(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const chars = [];
  text.split(/(\s+)/).forEach(tok => {
    if (!tok.trim()) { el.append(' '); return; }
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    for (const ch of tok) {
      const s = document.createElement('span');
      s.className = 'c';
      s.textContent = ch;
      w.append(s);
      chars.push(s);
    }
    el.append(w);
  });
  return chars;
}

/* ---------- Art ---------- */

const QUILL = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#f7f1e2" stroke="#3a1650" stroke-width="1.2" d="M46 2C30 2 16 12 12 28C18 22 22 22 25 22C22 26 18 28 15 30C24 32 34 28 40 18C37 19 34 19 32 18C38 16 44 10 46 2Z"/><path stroke="#22134f" stroke-width="1.6" stroke-linecap="round" d="M34 12L3 45"/></svg>`;

const LANDMARK = {
  gate: 'M-36 30V-18l9-16 9 16V30M18 30V-18l9-16 9 16V30M-18 30V6a18 18 0 0 1 36 0V30M-18-12H18M-48 30H48M-8 30V8M8 30V8M0 30V-11',
  tower: 'M-16 34V-24H16V34M-23-24L0-54 23-24ZM-7-2a7 9 0 0 1 14 0V9H-7ZM-42 34H42M0-54V-66',
  forest: 'M-28 34V20M-46 20L-28-16-10 20ZM-42 2L-28-30-14 2M28 34V20M10 20L28-12 46 20ZM14 4L28-26 42 4M0 34V10M-16 10L0-34 16 10ZM-11-8L0-50 11-8M-50 34H50',
  peak: 'M-52 34L-14-30 4-2 18-22 52 34ZM-14-30L-23-12-13-16-7-9-1-12M18-22V-58L38-50 18-42M-30 10H-16M16 16H34',
};

function emblem(key, paint) {
  const fill = `fill="${paint}"`;
  return {
    lumen: `<path ${fill} d="M100 54L108 94L148 104L108 114L100 154L92 114L52 104L92 94Z"/><path ${fill} d="M72 76L97 99L128 76L105 104L128 132L97 109L72 132L91 104Z"/>`,
    forge: `<path ${fill} d="M52 96H146C146 114 130 122 116 122V136H130V154H68V136H84V122C68 122 54 112 52 96Z"/><circle ${fill} cx="84" cy="76" r="4.5"/><circle ${fill} cx="102" cy="64" r="6"/><circle ${fill} cx="120" cy="78" r="4"/>`,
    meridian: `<g fill="none" stroke="${paint}" stroke-width="5"><circle cx="100" cy="104" r="46"/><ellipse cx="100" cy="104" rx="20" ry="46"/><path d="M54 104H146M62 80H138M62 128H138"/></g>`,
    kindle: `<path ${fill} fill-rule="evenodd" d="M100 52C108 80 142 94 142 126C142 150 122 162 100 162C78 162 58 150 58 126C58 106 74 98 78 80C88 88 94 98 94 108C100 94 104 74 100 52ZM100 112C104 126 118 132 118 144C118 154 110 158 100 158C90 158 82 154 82 144C82 134 96 128 100 112Z"/>`,
  }[key];
}
function emblemSVG(key, size = 200) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.07}" viewBox="46 48 108 116" aria-hidden="true"><defs><linearGradient id="au-${key}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0bd"/><stop offset=".5" stop-color="#e8c26a"/><stop offset="1" stop-color="#9c6f24"/></linearGradient></defs><g transform="translate(1.5 2.5)" opacity=".55">${emblem(key, '#000')}</g>${emblem(key, `url(#au-${key})`)}</svg>`;
}
const crest = key => `<span class="seal-crest"><img src="images/seal-${key}.webp" alt="">${emblemSVG(key)}</span>`;

// A dark figure stands in until a real delegate photo is added in content.js.
function portraitArt(p) {
  if (p.photo) return `<img src="${p.photo}" alt="" loading="lazy">`;
  const hair = {
    short: { back: '', front: 'M78 128C72 78 100 64 122 64C150 64 168 86 162 128Z' },
    long: { back: 'M72 130C66 72 100 58 120 58C146 58 174 76 168 130C172 176 182 208 160 226Q120 238 80 226C58 208 68 176 72 130Z', front: '' },
    bun: { back: 'M100 74a20 20 0 1 1 40 0a20 20 0 1 1-40 0Z', front: '' },
  }[p.hair];
  return `<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><g class="p-torso"><rect x="104" y="166" width="32" height="50"/><path d="M12 304C18 234 66 206 120 206C174 206 222 234 228 304Z"/></g><g class="p-head"><path d="${hair.back}"/><ellipse cx="120" cy="130" rx="41" ry="50"/><path d="${hair.front}"/></g></svg>`;
}

/* ---------- Particles (sparks, dust, click ripples) ---------- */

const fx = (() => {
  const c = $('#fx'), x = c.getContext('2d');
  const dpr = 1; // soft glows look the same at 1x, and it is 4x fewer pixels on retina screens
  let W = 0, H = 0, running = false;
  const sparks = [], rings = [], motes = [];
  const sprites = {};
  const sprite = color => {
    if (sprites[color]) return sprites[color];
    const s = document.createElement('canvas'); s.width = s.height = 32;
    const g = s.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, '#fff'); r.addColorStop(.25, color); r.addColorStop(1, 'transparent');
    g.fillStyle = r; g.fillRect(0, 0, 32, 32);
    return sprites[color] = s;
  };
  const size = () => { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  addEventListener('resize', size); size();

  function frame() {
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    motes.forEach(m => {
      m.x += m.vx; m.y += m.vy; m.t += .012;
      if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); }
      x.globalAlpha = .18 + .22 * Math.abs(Math.sin(m.t));
      x.drawImage(sprite('#ffd98a'), m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
    });
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += s.g; s.vx *= .98; s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      x.globalAlpha = Math.min(1, s.life);
      const r = s.r * (.5 + s.life / 2);
      x.drawImage(sprite(s.color), s.x - r, s.y - r, r * 2, r * 2);
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += 3.4; r.a -= .04;
      if (r.a <= 0) { rings.splice(i, 1); continue; }
      x.globalAlpha = r.a; x.strokeStyle = '#ffd98a'; x.lineWidth = 1.6;
      x.beginPath(); x.arc(r.x, r.y, r.r, 0, 6.3); x.stroke();
    }
    x.globalAlpha = 1;
    if (motes.length || sparks.length || rings.length) requestAnimationFrame(frame);
    else { running = false; x.clearRect(0, 0, W, H); }
  }
  const go = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

  const api = {
    spark(px, py, color = '#ffd98a', spread = 1) {
      if (calm) return;
      sparks.push({ x: px, y: py, vx: rand(-1, 1) * spread, vy: rand(-1, .6) * spread, g: .03, r: rand(4, 9), life: rand(.5, 1), decay: rand(.018, .032), color });
      go();
    },
    burst(px, py, n = 40, color = '#ffd98a', power = 7) {
      if (calm) return;
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.28), v = rand(.3, 1) * power;
        sparks.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .09, r: rand(5, 12), life: rand(.7, 1.2), decay: rand(.012, .024), color });
      }
      go();
    },
    ring(px, py) { if (!calm) { rings.push({ x: px, y: py, r: 4, a: .75 }); go(); } },
  };
  if (!calm) {
    for (let i = 0; i < (small ? 12 : 30); i++) motes.push({ x: rand(0, W), y: rand(0, H), vx: rand(-.12, .12), vy: rand(-.28, -.08), r: rand(2, 5), t: rand(0, 6) });
    go();
  }
  return api;
})();

if (fine && !calm) {
  let lx = 0, ly = 0;
  addEventListener('pointermove', e => {
    if (Math.hypot(e.clientX - lx, e.clientY - ly) < 14) return;
    lx = e.clientX; ly = e.clientY;
    fx.spark(lx + 3, ly + 3, Math.random() < .3 ? '#b9a0ff' : '#ffd98a', .7);
  }, { passive: true });
}
addEventListener('pointerdown', e => fx.ring(e.clientX, e.clientY), { passive: true });

/* ---------- Music ---------- */

// Plays audio/theme.mp3 if the site has one, otherwise a local preview file that is never published.
const sound = (() => {
  const VOLUME = .8, MUFFLED_HZ = 900, btn = $('#soundToggle');
  let url = null, el, ctx, gain, filter, on = false, held = false, dipped = false;
  const ready = (async () => {
    for (const u of ['audio/theme.mp3', 'audio/local-preview.mp3']) {
      try { if ((await fetch(u, { method: 'HEAD' })).ok) { url = u; return true; } } catch (e) {}
    }
    return false;
  })();
  ready.then(has => { btn.hidden = !has; });

  const apply = (t = .25) => { if (gain) gain.gain.setTargetAtTime(on ? VOLUME * (held ? .35 : 1) * (dipped ? .4 : 1) : 0, ctx.currentTime, t); };
  const label = () => { btn.textContent = on ? 'Music on' : 'Music off'; btn.setAttribute('aria-pressed', on); };
  function setup() {
    if (ctx) return;
    el = new Audio(url);
    el.loop = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 20000; filter.Q.value = .4;
    gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(filter).connect(gain).connect(ctx.destination);
  }
  function start(muffled) {
    if (!url) return;
    setup();
    ctx.resume();
    if (muffled) filter.frequency.setValueAtTime(MUFFLED_HZ, ctx.currentTime);
    on = true;
    el.play().catch(() => { on = false; label(); });
    apply(1);
    store.set('e5-music', 'on');
    label();
  }
  function stop() {
    on = false;
    apply(.12);
    setTimeout(() => { if (!on) el.pause(); }, 500);
    store.set('e5-music', 'off');
    label();
  }
  const open = sec => {
    if (!ctx) return;
    const f = filter.frequency, t = ctx.currentTime;
    f.cancelScheduledValues(t);
    f.setValueAtTime(Math.max(f.value, 20), t);
    f.exponentialRampToValueAtTime(20000, t + sec);
  };
  btn.addEventListener('click', () => { if (on) stop(); else { start(false); open(.05); } });
  document.addEventListener('visibilitychange', () => { if (el && on) { if (document.hidden) el.pause(); else el.play().catch(() => {}); } });

  // Someone who had music on last time gets it back on their first click.
  const resume = e => {
    if (root.classList.contains('intro-on') || e.target.closest('#soundToggle')) return;
    removeEventListener('click', resume);
    if (!on && !ctx) start(false);
  };
  if (store.get('e5-music') === 'on') ready.then(has => { if (has) addEventListener('click', resume); });

  return {
    ready, start, open,
    hold(v) { held = v; apply(.4); },
    dip(ms) { dipped = true; apply(.08); setTimeout(() => { dipped = false; apply(.7); }, ms); },
    crack() {
      if (!on) return;
      const t = ctx.currentTime, b = ctx.createBuffer(1, ctx.sampleRate * .14, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4) * .5;
      const s = ctx.createBufferSource(); s.buffer = b;
      const lp = ctx.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 1800;
      s.connect(lp).connect(ctx.destination); s.start(t);
    },
  };
})();

/* ---------- Static content ---------- */

if (E.sample) $('#sampleRibbon').hidden = false;
$('#heroTag').textContent = `${E.datesLabel}. ${E.venue}.`;
$('#fDays').textContent = E.days;
$('#fDelegates').textContent = E.delegates;
$('#fDates').textContent = E.datesLabel;
$('#fVenue').textContent = E.venue;
$('#lDate').textContent = `The gates open on ${new Date(E.campStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'Asia/Colombo' })}. Bring courage. Leave the doubt at the door.`;
$('#patronLink').href = `mailto:${E.partnerEmail}?subject=${encodeURIComponent('Partnering with ELEVATE 5.0')}`;
$('#banners').innerHTML = E.partners.map(p => `<div class="banner-wrap"><img src="images/banner.webp" alt="" loading="lazy"><div class="banner-text"><b>${p.tier}</b><span>${p.name}</span></div></div>`).join('');
$('#scrolls').innerHTML = E.faq.map(f => `<details class="paper"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('');

// Native disclosure for the phone menu, always open on wide screens.
const menu = $('.menu'), wideNav = matchMedia('(min-width: 1000px)');
const syncMenu = () => { menu.open = wideNav.matches; };
wideNav.addEventListener('change', syncMenu); syncMenu();
$$('.menu a').forEach(a => a.addEventListener('click', syncMenu));

// Candles. Some start unlit so the easter egg has something to do.
$$('.candles').forEach(layer => {
  const depth = layer.dataset.depth;
  const cfg = { far: [small ? 4 : 9, 52], mid: [small ? 3 : 7, 96], near: [small ? 2 : 4, 170] }[depth];
  for (let i = 0; i < cfg[0]; i++) {
    const c = document.createElement('div');
    c.className = 'candle' + (Math.random() < .3 ? ' out' : '');
    const x = depth === 'far' ? rand(2, 98) : Math.random() < .5 ? rand(1, 13) : rand(87, 98); // big candles stay clear of the text
    const y = small && depth !== 'far' ? rand(10, 16) : rand(4, 88); // on phones the text fills the middle
    c.style.cssText = `--h:${Math.round(cfg[1] * (small ? .72 : 1) * rand(.85, 1.15))}px;left:${x}%;top:${y}%;--t:${rand(3.5, 7)}s;--d:-${rand(0, 6)}s;opacity:${depth === 'far' ? (small ? .35 : .6) : depth === 'mid' ? .85 : 1}`;
    c.innerHTML = `<img src="images/candle-${Math.random() < .5 ? 'a' : 'b'}.webp" alt="">`;
    layer.append(c);
  }
});

// Easter egg: type "illuminate" anywhere outside a form field.
let typed = '';
addEventListener('keydown', e => {
  if (e.target.matches('input,textarea,select') || e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-10);
  if (typed !== 'illuminate') return;
  typed = '';
  $$('.candle.out').forEach((c, i) => setTimeout(() => {
    c.classList.remove('out');
    const r = c.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top, 12, '#ffd98a', 3);
  }, i * 110));
});

// Hourglass countdown
const start = +new Date(E.countdownFrom), end = +new Date(E.campStart);
function tick() {
  const left = Math.max(0, end - Date.now());
  const s = Math.floor(left / 1000);
  $('#cD').textContent = Math.floor(s / 86400);
  $('#cH').textContent = String(Math.floor(s / 3600) % 24).padStart(2, '0');
  $('#cM').textContent = String(Math.floor(s / 60) % 60).padStart(2, '0');
  $('#cS').textContent = String(s % 60).padStart(2, '0');
  const frac = Math.min(1, left / (end - start));
  const top = 64 * frac, bottom = 64 * (1 - frac);
  $('#sandTop').setAttribute('y', 80 - top); $('#sandTop').setAttribute('height', top);
  $('#sandBottom').setAttribute('y', 144 - bottom); $('#sandBottom').setAttribute('height', bottom);
  if (!left) $('.stream').style.display = 'none';
}
tick(); setInterval(tick, 1000);

// Freeze the looping animations of any section that is off screen.
if (!calm) {
  const pause = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting)), { rootMargin: '100px' });
  $$('main > section').forEach(s => pause.observe(s));
}

/* ---------- Letter intro ---------- */

function heroIn() {
  const word = $('#titleWord');
  const chars = word.querySelector('.c') ? $$('.c', word) : splitChars(word);
  word.removeAttribute('aria-label');
  if (!motion) return;
  gsap.timeline()
    .from('#heroKicker', { autoAlpha: 0, y: 14, duration: .8 }, .15)
    .from(chars, { autoAlpha: 0, y: 34, rotationX: -70, duration: .9, stagger: .07, ease: 'back.out(1.5)' }, .3)
    .from('.title .v', { autoAlpha: 0, scale: .6, rotation: -24, duration: .8, ease: 'back.out(2)' }, 1)
    .from('#heroTag, #heroCta, #count, #sampleRibbon', { autoAlpha: 0, y: 16, duration: .8, stagger: .12 }, 1.15);
}

const siteParts = () => [$('#nav'), $('#top'), $('.foot'), $('#satchelBtn')];

function playIntro() {
  const intro = $('#intro'), stage = $('#stage'), owl = $('#introOwl'), letter = $('#letter'), flap = $('#flap'), seal = $('#seal'), prompt = $('#prompt'), address = $('#address'), gate = $('#gate'), dark = $('#introDark');
  root.classList.add('intro-on');
  siteParts().forEach(el => { el.inert = true; });
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const W = innerWidth || screen.width, H = innerHeight || screen.height, timelines = []; // embedded views can report 0 at load
  let finished = false;

  function finish(quick) {
    if (finished) return;
    finished = true;
    timelines.forEach(t => t.kill());
    store.set('e5-letter', '1');
    const name = $('#introName').value.trim();
    if (name && !$('#regForm').elements.name.value) $('#regForm').elements.name.value = name;
    siteParts().forEach(el => { el.inert = false; });
    sound.open(quick ? .4 : 2.2);
    gsap.to(intro, {
      autoAlpha: 0, duration: quick ? .35 : 1.1, onComplete() {
        root.classList.remove('intro-on', 'play-intro');
        intro.remove();
        ScrollTrigger.refresh();
      },
    });
    heroIn();
  }
  $('#skipIntro').addEventListener('click', () => finish(true));
  addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { removeEventListener('keydown', esc); finish(true); } });

  // Ragged paper edge for the letter.
  const pts = [], steps = 40, j = () => rand(0, 1.1).toFixed(2);
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps * 100).toFixed(1)}% ${j()}%`);
  for (let i = 0; i <= steps; i++) pts.push(`${100 - j()}% ${(i / steps * 100).toFixed(1)}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps * 100).toFixed(1)}% ${100 - j()}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${j()}% ${(i / steps * 100).toFixed(1)}%`);
  $('#letterSheet').style.clipPath = `polygon(${pts.join(',')})`;

  // The letter burns away from the centre and the hall takes over.
  $('#enterHall').addEventListener('click', () => {
    letter.style.clipPath = 'none';
    letter.classList.add('burning');
    const r = letter.getBoundingClientRect(), R = Math.hypot(r.width, r.height) / 2, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const burn = { v: -8 };
    gsap.to(burn, {
      v: 108, duration: 1.5, ease: 'power1.in', onUpdate() {
        letter.style.setProperty('--burn', `${burn.v}%`);
        for (let i = 0; i < 6; i++) {
          const a = rand(0, 6.28), x = cx + Math.cos(a) * R * burn.v / 100, y = cy + Math.sin(a) * R * burn.v / 100;
          if (burn.v > 0 && x > r.left && x < r.right && y > r.top && y < r.bottom) fx.spark(x, y, i % 3 ? '#ffb45e' : '#ffe2a8', 1.6);
        }
      },
    });
    gsap.to(dark, { opacity: 0, duration: 1.6 });
    gsap.delayedCall(.95, () => finish(false));
  });

  // Flight in, drop, owl leaves. Waits for the photos so nothing flies in blank.
  const decode = u => { const i = new Image(); i.src = u; return i.decode().catch(() => {}); };
  const artReady = Promise.race([Promise.all(['owl', 'envelope', 'seal', 'parchment'].map(n => decode(`images/${n}.webp`))), new Promise(r => setTimeout(r, 3000))]);
  function takeOff() {
    artReady.then(() => {
      if (finished) return;
      const startX = W * .62, startY = -H * .62, carryY = -H * .2;
      gsap.set(stage, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: startX, y: startY, scale: .16, rotation: -12, transformPerspective: 1400 });
      gsap.set(owl, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: startX, y: startY - 70, scale: .55 });
      const carryGap = owl.offsetHeight * .3 + stage.offsetHeight * .1; // talons just above the envelope
      const tilt = gsap.fromTo($('img', owl), { rotation: -5, y: -6 }, { rotation: 5, y: 6, duration: .65, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      timelines.push(tilt);
      const fly = gsap.timeline({ onComplete() { seal.disabled = false; seal.focus({ preventScroll: true }); } });
      timelines.push(fly);
      fly.to(stage, { x: 0, duration: 2.3, ease: 'power1.out' }, 0)
        .to(stage, { y: carryY, duration: 2.3, ease: 'sine.inOut' }, 0)
        .to(stage, { rotation: 0, duration: 2.3 }, 0)
        .to(owl, { x: 0, duration: 2.3, ease: 'power1.out' }, 0)
        .to(owl, { y: carryY - carryGap, scale: 1, duration: 2.3, ease: 'sine.inOut' }, 0)
        .to(stage, { y: 0, scale: 1, rotationX: 7, duration: 1.15, ease: 'power2.in' }, 2.4)
        .to(stage, { keyframes: { rotation: [0, -5, 3.5, -1.5, 0] }, duration: 1.15, ease: 'sine.inOut' }, 2.4)
        .to(owl, { x: -W * .75, y: -H * .8, scale: .35, duration: 1.7, ease: 'power2.in' }, 2.5)
        .set(owl, { autoAlpha: 0 })
        .to([prompt, address], { autoAlpha: 1, duration: .7 }, 3.4);
    });
  }

  // First click: the candle catches and the hall appears. Browsers only allow music after a click.
  const glow = $('#gateGlow');
  const flicker = gsap.to(glow, { opacity: .72, scale: .95, duration: .9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  timelines.push(flicker);
  sound.ready.then(has => { $('#noSound').hidden = !has; });
  $('#lightCandle').focus({ preventScroll: true });
  const begin = withSound => {
    flicker.kill();
    if (withSound) sound.start(true);
    const r = glow.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, 40, '#ffd98a', 4);
    const t = gsap.timeline();
    timelines.push(t);
    t.to(glow, { scale: 6, opacity: 0, duration: 1.5, ease: 'power2.out' }, 0)
      .to(gate, { autoAlpha: 0, duration: .8 }, .25)
      .to(dark, { opacity: .56, duration: 2.8, ease: 'sine.inOut' }, .2)
      .add(takeOff, 1.4);
  };
  $('#lightCandle').addEventListener('click', () => begin(true), { once: true });
  $('#noSound').addEventListener('click', () => begin(false), { once: true });

  seal.addEventListener('click', () => {
    seal.disabled = true;
    const r = seal.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, 70);
    fx.ring(r.left + r.width / 2, r.top + r.height / 2);
    sound.crack();
    sound.dip(1100);

    const name = $('#introName').value.trim();
    $('#lDear').textContent = `Dear ${name || 'Future Leader'},`;
    const chars = $$('.l-line').flatMap(splitChars);
    gsap.set(chars, { opacity: 0 });

    const E_H = stage.offsetHeight, L_H = letter.offsetHeight, s0 = .84;
    const visible = E_H * .92 / s0;
    gsap.set(letter, { transformOrigin: '50% 0', scale: s0, y: -E_H / 2 + 12, clipPath: `inset(0px 0px ${L_H - visible}px 0px)` });

    const quill = $('#letterQuill');
    quill.innerHTML = QUILL;
    const open = gsap.timeline();
    timelines.push(open);
    open.to([prompt, address], { autoAlpha: 0, duration: .3 }, 0)
      .to(stage, { rotationX: 0, duration: .5 }, 0)
      .to('.half.left', { x: -80, y: 280, rotation: -55, autoAlpha: 0, duration: 1.05, ease: 'power2.in' }, 0)
      .to('.half.right', { x: 80, y: 300, rotation: 48, autoAlpha: 0, duration: 1.05, ease: 'power2.in' }, 0)
      .to(flap, { rotationX: 180, duration: .75, ease: 'power2.inOut' }, .2)
      .set(flap, { zIndex: 0 }, .58)
      .set(letter, { visibility: 'visible' }, .7)
      .to(letter, { y: -E_H / 2 - E_H * .5, duration: .9, ease: 'power2.out' }, .85)
      .to('.env-back, .env-front, #flap', { y: H, autoAlpha: 0, duration: .9, ease: 'power2.in' }, 1.7)
      .to(stage, { y: H * .06, duration: 1 }, 1.7)
      .to(letter, { y: -L_H / 2, scale: 1, clipPath: 'inset(-90px -90px -90px -90px)', duration: 1, ease: 'power2.inOut' }, 1.7)
      .set(quill, { opacity: 1 }, 2.7)
      .add(() => {
        const write = gsap.to(chars, {
          opacity: 1, duration: .1,
          stagger: {
            each: .017,
            onStart() {
              const c = this.targets()[0];
              gsap.set(quill, { x: c.offsetLeft + c.offsetWidth, y: c.offsetTop + c.offsetHeight - 46 });
            },
          },
          onComplete() {
            gsap.to(quill, { opacity: 0, duration: .3 });
            gsap.to('.l-org', { opacity: .75, duration: .5 });
            gsap.to('#enterHall', { autoAlpha: 1, duration: .6, onComplete() { $('#enterHall').focus({ preventScroll: true }); } });
          },
        });
        timelines.push(write);
        letter.addEventListener('click', e => { if (!e.target.closest('button')) write.timeScale(8); });
      }, 2.75);
  }, { once: true });
}

if (root.classList.contains('play-intro')) playIntro(); else heroIn();

/* ---------- Scroll scenes ---------- */

$$('h2.ink').forEach(h => {
  const chars = splitChars(h);
  if (!motion) return;
  gsap.from(chars, {
    opacity: 0, y: 8, duration: .28, stagger: .022, ease: 'power1.out',
    scrollTrigger: { trigger: h, start: 'top 86%', once: true, onEnter: () => h.classList.add('lit') },
  });
});

if (motion) {
  const hero = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero .plate', { y: 70, ease: 'none', scrollTrigger: hero });
  gsap.to('[data-depth=far]', { y: 50, ease: 'none', scrollTrigger: hero });
  gsap.to('[data-depth=mid]', { y: 130, ease: 'none', scrollTrigger: hero });
  gsap.to('[data-depth=near]', { y: 250, ease: 'none', scrollTrigger: hero });

  gsap.matchMedia().add('(min-width: 1200px)', () => {
    gsap.set('.page.right', { autoAlpha: 0 });
    gsap.timeline({ scrollTrigger: { trigger: '.book', start: 'top 62%', once: true } })
      .set('.leaf', { visibility: 'visible' })
      .fromTo('.leaf', { rotationY: 0 }, { rotationY: -180, duration: 1.4, ease: 'power2.inOut' })
      .to('.page.right', { autoAlpha: 1, duration: .7 }, 1)
      .to('.leaf', { autoAlpha: 0, duration: .45 }, 1.25);
  });
  gsap.from('.banner-wrap', { yPercent: -105, opacity: 0, duration: 1, stagger: .09, ease: 'bounce.out', scrollTrigger: { trigger: '.rail', start: 'top 80%', once: true } });
  ScrollTrigger.batch('.item', { start: 'top 88%', once: true, onEnter: b => gsap.from(b.flatMap(i => [$('.float', i), $('.tag-card', i)]), { opacity: 0, duration: .9, stagger: .08 }) }); // opacity only, so the shelf stays one piece
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ---------- Map agenda ---------- */

function buildMap(portrait, pin) {
  const section = $('#agenda'), host = $('#map'), note = $('#mapNote');
  const W = portrait ? 500 : 1000, H = portrait ? 750 : 563;
  section.classList.toggle('pinned', pin);
  section.classList.toggle('portrait', portrait && pin);
  host.style.setProperty('--ar', `${W} / ${H}`);
  host.style.setProperty('--ar-n', W / H);
  host.style.setProperty('--map', `url(images/map-${portrait ? 'phone' : 'wide'}.webp)`);

  const n = E.agenda.length;
  const stops = E.agenda.map((d, i) => {
    const t = n > 1 ? i / (n - 1) : .5;
    return portrait ? { x: i % 2 ? 335 : 165, y: 140 + t * (H - 330) } : { x: 190 + t * (W - 380), y: i % 2 ? 185 : 365 };
  });
  const segment = (a, b) => {
    if (portrait) { const m = (a.y + b.y) / 2; return `C${a.x} ${m} ${b.x} ${m} ${b.x} ${b.y}`; }
    const m = (a.x + b.x) / 2; return `C${m} ${a.y} ${m} ${b.y} ${b.x} ${b.y}`;
  };
  let d = `M${stops[0].x} ${stops[0].y}`;
  const partial = stops.map((s, i) => { if (i) d += segment(stops[i - 1], s); return d; });

  const svgNS = 'http://www.w3.org/2000/svg';
  const measure = document.createElementNS(svgNS, 'path');
  const lengths = partial.map(p => { measure.setAttribute('d', p); return measure.getTotalLength(); });
  const L = lengths[lengths.length - 1];
  const fracs = lengths.map(l => l / L);

  const fs = portrait ? 27 : 17;
  const labelLines = label => {
    if (!portrait || label.length < 14) return [label];
    const w = label.split(' '), half = Math.ceil(w.length / 2);
    return [w.slice(0, half).join(' '), w.slice(half).join(' ')];
  };
  const stopsSvg = E.agenda.map((a, i) => `<g class="stop" transform="translate(${stops[i].x} ${stops[i].y})">
      <path class="ink-art" d="${LANDMARK[a.art]}"${portrait ? ' transform="scale(1.25)"' : ''}/>
      <text class="when" y="${portrait ? -82 : -66}" font-size="${fs - 1}">${a.when}</text>
      <text y="${portrait ? 80 : 62}" font-size="${fs}">${labelLines(a.label).map((l, k) => `<tspan x="0" dy="${k ? fs * 1.1 : 0}">${l}</tspan>`).join('')}</text></g>`).join('');
  const bw = portrait ? 240 : 160, bh = portrait ? 220 : 150;
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <path id="route" d="${d}" fill="none" stroke="#3a1c0a" stroke-opacity=".5" stroke-width="2" stroke-dasharray="${L}" stroke-dashoffset="${L}"/>
    <g id="feet"></g>${stopsSvg}
    <circle id="walker" r="${portrait ? 11 : 7}" fill="#3a1650" stroke="#e8c26a" stroke-width="2"/></svg>` +
    E.agenda.map((a, i) => `<button class="map-btn" type="button" aria-label="${a.when}: ${a.label}" style="left:${(stops[i].x - bw / 2) / W * 100}%;top:${(stops[i].y - bh / 2) / H * 100}%;width:${bw / W * 100}%;height:${bh / H * 100}%"></button>`).join('');

  const route = $('#route', host);
  const STEP = portrait ? 34 : 22, count = Math.round(L / STEP), feetEls = [], feetG = $('#feet', host);
  for (let i = 1; i < count; i++) {
    const p = route.getPointAtLength(i * STEP), q = route.getPointAtLength(Math.min(L, i * STEP + 1));
    const ang = Math.atan2(q.y - p.y, q.x - p.x), side = (i % 2 ? 6 : -6) * (portrait ? 1.6 : 1);
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'foot-print');
    g.setAttribute('transform', `translate(${p.x - Math.sin(ang) * side} ${p.y + Math.cos(ang) * side}) rotate(${ang * 180 / Math.PI}) scale(${portrait ? 1.6 : 1})`);
    g.innerHTML = '<ellipse rx="4.4" ry="2.4"/><circle cx="-6" r="1.7"/>';
    feetG.append(g); feetEls.push(g);
  }

  const stopEls = $$('.stop', host), walker = $('#walker', host);
  let active = -1, shown = 0;
  const setActive = i => {
    if (i === active) return;
    active = i;
    const a = E.agenda[i];
    note.innerHTML = `<p class="eyebrow">${a.when}</p><h3>${a.label}</h3><ol>${a.sessions.map(s => `<li>${s}</li>`).join('')}</ol>`;
    if (motion) gsap.fromTo(note, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 });
  };
  const apply = p => {
    route.setAttribute('stroke-dashoffset', L * (1 - p));
    const upto = Math.floor(p * feetEls.length);
    for (let i = Math.min(shown, upto); i < Math.max(shown, upto); i++) feetEls[i].style.opacity = i < upto ? .75 : 0;
    shown = upto;
    const pt = route.getPointAtLength(L * p);
    walker.setAttribute('cx', pt.x); walker.setAttribute('cy', pt.y);
    let last = 0;
    stopEls.forEach((el, i) => { const hit = p >= fracs[i] - .004; el.classList.toggle('reached', hit); if (hit) last = i; });
    setActive(last);
  };

  let st = null;
  if (pin) {
    apply(0);
    st = ScrollTrigger.create({ trigger: section, pin: true, anticipatePin: 1, start: 'top top', end: '+=240%', scrub: .5, onUpdate: self => apply(self.progress) });
  } else {
    apply(1);
    setActive(0);
  }
  $$('.map-btn', host).forEach((b, i) => b.addEventListener('click', () => {
    if (st) scrollTo({ top: st.start + (st.end - st.start) * Math.min(1, fracs[i] + .002), behavior: 'smooth' });
    else setActive(i);
  }));
  return () => { section.classList.remove('pinned', 'portrait'); };
}

if (motion) {
  gsap.matchMedia().add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)', tall: '(min-height: 600px)', short: '(max-height: 599px)' },
    ctx => buildMap(ctx.conditions.narrow, ctx.conditions.tall));
} else {
  buildMap(innerWidth < 900, false);
}

/* ---------- Living portraits ---------- */

(() => {
  const wall = $('#wall'), section = $('#portraits'), quote = $('#plaqueQuote'), cite = $('#plaqueName');
  wall.innerHTML = E.portraits.map((p, i) => `<button class="frame${i % 3 === 1 ? ' oval' : ''}" type="button" aria-label="Hear from ${p.name}, ${p.role}"><span class="canvas">${portraitArt(p)}</span><img class="gilt" src="images/frame-${i % 3 === 1 ? 'oval' : 'rect'}.webp" alt="" loading="lazy"></button>`).join('');
  const frames = $$('.frame', wall);
  let current = -1, writer, touched = false, inView = false;

  function speak(i) {
    if (i === current) return;
    current = i;
    frames.forEach((f, k) => f.classList.toggle('on', k === i));
    const p = E.portraits[i];
    quote.textContent = `“${p.quote}”`;
    cite.textContent = `${p.name} · ${p.role}`;
    if (!motion) return;
    writer && writer.kill();
    const chars = splitChars(quote);
    writer = gsap.from(chars, { opacity: 0, duration: .1, stagger: .012 });
  }
  frames.forEach((f, i) => {
    const pick = () => { touched = true; speak(i); };
    f.addEventListener('click', pick);
    f.addEventListener('focus', pick);
    if (fine) f.addEventListener('pointerenter', pick);
  });
  speak(0);

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: .3 }).observe(section);
  // Advances by itself only until the visitor touches a portrait.
  if (motion) setInterval(() => {
    if (touched || !inView || document.hidden) return;
    const next = (current + 1) % frames.length;
    speak(next);
    if (wall.scrollWidth > wall.clientWidth) wall.scrollTo({ left: frames[next].offsetLeft - (wall.clientWidth - frames[next].offsetWidth) / 2, behavior: 'smooth' });
  }, 8000);

  if (fine && motion) {
    let queued = false, ex = 0, ey = 0;
    const heads = $$('.p-head', wall);
    section.addEventListener('pointermove', e => {
      ex = e.clientX; ey = e.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const s = section.getBoundingClientRect();
        section.style.setProperty('--mx', `${ex - s.left}px`);
        section.style.setProperty('--my', `${ey - s.top}px`);
        heads.forEach(h => {
          const r = h.ownerSVGElement.getBoundingClientRect();
          const dx = Math.max(-1, Math.min(1, (ex - r.left - r.width / 2) / 500));
          const dy = Math.max(-1, Math.min(1, (ey - r.top - r.height / 2) / 500));
          h.style.transform = `translate(${dx * 7}px, ${dy * 4}px)`;
        });
      });
    }, { passive: true });
  }
})();

/* ---------- Sorting Flame ---------- */

let house = '';
function updateBadge() {
  $('#houseBadge').innerHTML = house
    ? `${crest(house)}${E.houses[house].name}`
    : '<a class="inline" style="color:#3a1650" href="#sorting">Not yet sorted</a>';
}
updateBadge();

(() => {
  const box = $('#sorting'), ritual = $('#ritual');
  const fire = $('#fire');
  ['base', ...Object.keys(E.houses)].forEach(k => {
    const src = `images/flame${k === 'base' ? '' : '-' + k}.webp`;
    fire.insertAdjacentHTML('beforeend', `<div class="fl" data-k="${k}"><img src="${src}" alt="" loading="lazy"><img src="${src}" alt="" loading="lazy"></div>`);
  });
  let answers = [];
  const setFlame = k => {
    box.style.setProperty('--flame', k === 'base' ? '#e8c26a' : E.houses[k].color);
    $$('.fl', fire).forEach(f => f.classList.toggle('on', f.dataset.k === k));
  };
  const shuffled = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

  function intro() {
    answers = [];
    setFlame('base');
    ritual.innerHTML = `<p class="progress">The ceremony</p><h3>Step up to the flame. It already knows, but it would like you to say so.</h3>
      <button class="btn brass" type="button" id="begin">Begin the sorting</button><br><button class="link" type="button" data-skip>Skip the sorting, take me to the form</button>`;
    $('#begin', ritual).addEventListener('click', () => ask(0, true));
  }

  function ask(i, focus) {
    const q = E.quiz[i];
    ritual.innerHTML = `<p class="progress">Question ${i + 1} of ${E.quiz.length}</p><h3 tabindex="-1">${q.q}</h3>` +
      shuffled(Object.keys(q.a)).map(k => `<button class="opt" type="button" data-h="${k}">${q.a[k]}</button>`).join('') +
      `<button class="link" type="button" data-skip>Skip the sorting</button>`;
    if (focus) $('h3', ritual).focus({ preventScroll: true });
    if (motion) gsap.from(ritual.children, { opacity: 0, x: 16, duration: .4, stagger: .06 });
    $$('.opt', ritual).forEach(b => b.addEventListener('click', () => {
      answers.push(b.dataset.h);
      const r = b.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, 14, E.houses[b.dataset.h].color, 3);
      setFlame(leader());
      if (i + 1 < E.quiz.length) ask(i + 1, true); else reveal();
    }));
  }

  // Most-chosen house. On a tie, the one picked most recently wins.
  function leader() {
    const score = {};
    answers.forEach((h, i) => { score[h] = score[h] || { n: 0, last: 0 }; score[h].n++; score[h].last = i; });
    return Object.keys(score).sort((a, b) => score[b].n - score[a].n || score[b].last - score[a].last)[0];
  }

  function reveal() {
    house = leader();
    updateBadge();
    const h = E.houses[house];
    setFlame(house);
    ritual.innerHTML = `<div class="result"><div class="crest">${crest(house)}</div>
      <p class="q">${h.quality}</p><h3 tabindex="-1">${h.name}</h3><p>${h.line}</p>
      <div class="act"><a class="btn brass" href="#regForm">Claim your seat</a><button class="btn plain" type="button" id="shareCard">Download share card</button></div>
      <button class="link" type="button" id="again">Ask the flame again</button></div>`;
    $('.result h3', ritual).focus({ preventScroll: true });
    $('#shareCard').addEventListener('click', shareCard);
    $('#again').addEventListener('click', () => { house = ''; updateBadge(); intro(); });
    if (motion) {
      const r = fire.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 2, 110, h.color, 11);
      gsap.fromTo(fire, { scale: 1, transformOrigin: '50% 100%' }, { scale: 1.45, duration: .35, yoyo: true, repeat: 1, ease: 'power2.out' });
      gsap.from('.result .crest', { scale: 0, rotationY: 540, duration: 1.3, ease: 'back.out(1.4)' });
      gsap.from('.result > :not(.crest)', { opacity: 0, y: 14, duration: .6, stagger: .12, delay: .8 });
    }
  }

  async function shareCard() {
    await Promise.all([document.fonts.load('900 96px "Cinzel Decorative"'), document.fonts.load('italic 46px "IM Fell English"'), document.fonts.load('700 40px Cinzel')]);
    const h = E.houses[house], c = document.createElement('canvas');
    c.width = 1080; c.height = 1920;
    const x = c.getContext('2d');
    const img = src => { const i = new Image(); i.src = src; return i.decode().then(() => i); };
    const [hall, waxSeal, mark] = await Promise.all([img('images/hero-phone.webp'), img(`images/seal-${house}.webp`), img('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(emblemSVG(house, 340)))]);
    x.drawImage(hall, 0, 0, 1080, 1920);
    x.fillStyle = 'rgba(8, 5, 18, .64)'; x.fillRect(0, 0, 1080, 1920);
    const glow = x.createRadialGradient(540, 800, 60, 540, 800, 620);
    glow.addColorStop(0, h.color + '77'); glow.addColorStop(1, h.color + '00');
    x.fillStyle = glow; x.fillRect(0, 0, 1080, 1920);
    x.drawImage(waxSeal, 190, 450, 700, 707);
    x.drawImage(mark, 370, 618, 340, 364);
    x.textAlign = 'center';
    x.fillStyle = '#e8c26a'; x.font = '700 44px Cinzel'; x.fillText('THE FLAME HAS SPOKEN', 540, 330);
    let size = 124;
    do { size -= 4; x.font = `900 ${size}px "Cinzel Decorative"`; } while (x.measureText(h.name).width > 960);
    x.fillStyle = h.color; x.fillText(h.name, 540, 1320);
    x.fillStyle = '#f1e9d6'; x.font = '700 42px Cinzel'; x.fillText(h.quality.toUpperCase(), 540, 1400);
    x.fillStyle = '#e8c26a'; x.font = '900 72px "Cinzel Decorative"'; x.fillText('ELEVATE 5.0', 540, 1700);
    x.fillStyle = '#f1e9d6'; x.font = 'italic 46px "IM Fell English"'; x.fillText('AIESEC in NSBM', 540, 1770);
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = `elevate-${house}.png`;
    a.click();
  }

  box.addEventListener('click', e => { if (e.target.closest('[data-skip]')) $('#regForm').scrollIntoView(); });
  intro();
})();

/* ---------- Emporium and satchel ---------- */

let cart = [];
try { cart = JSON.parse(store.get('e5-cart')) || []; } catch (e) {}
cart = cart.filter(l => E.merch.some(m => m.id === l.id && m.image));
const product = id => E.merch.find(m => m.id === id);
const cartTotal = () => cart.reduce((sum, l) => sum + product(l.id).price * l.qty, 0);

function payBlock(el, amount) {
  el.innerHTML = `<h4>Transfer ${money(amount)} to this account</h4><dl>
    <dt>Bank</dt><dd>${E.bank.bank}, ${E.bank.branch}</dd><dt>Account</dt><dd>${E.bank.account}</dd><dt>Name</dt><dd>${E.bank.holder}</dd></dl>`;
}
payBlock($('#regForm [data-pay]'), E.fee);

function renderCart() {
  store.set('e5-cart', JSON.stringify(cart));
  const count = cart.reduce((n, l) => n + l.qty, 0);
  $('#satchelCount').textContent = count;
  $('#satchelBtn').setAttribute('aria-label', `Open your satchel, ${count} item${count === 1 ? '' : 's'}`);
  $('#cartForm').hidden = !cart.length;
  $('#cartLines').innerHTML = !cart.length
    ? '<p class="empty">Your satchel is empty. The shelves are full.</p>'
    : cart.map((l, i) => `<div class="line"><div class="n">${product(l.id).name}${l.size ? `<small>${l.size}</small>` : ''}</div>
        <button class="step" type="button" data-step="-1" data-i="${i}" aria-label="One fewer ${product(l.id).name}">−</button><span>${l.qty}</span>
        <button class="step" type="button" data-step="1" data-i="${i}" aria-label="One more ${product(l.id).name}">+</button>
        <div>${money(product(l.id).price * l.qty)}</div></div>`).join('') + `<div class="total"><span>Total</span><span>${money(cartTotal())}</span></div>`;
  if (cart.length) payBlock($('#cartForm [data-pay]'), cartTotal());
}
$('#cartLines').addEventListener('click', e => {
  const b = e.target.closest('[data-step]');
  if (!b) return;
  const l = cart[+b.dataset.i];
  l.qty = Math.min(10, l.qty + +b.dataset.step);
  if (l.qty < 1) cart.splice(+b.dataset.i, 1);
  renderCart();
});

$('#shelves').innerHTML = E.merch.filter(m => m.image).map(m => `<article class="item" data-id="${m.id}">
  <div class="float"><img src="${m.image}" alt="${m.name}" loading="lazy"></div><div class="plank"></div>
  <div class="tag-card paper"><h3>${m.name}</h3><p>${m.note}</p><p class="price">${money(m.price)}</p>
  ${m.sizes ? `<select aria-label="${m.name} option">${m.sizes.map(s => `<option>${s}</option>`).join('')}</select>` : ''}
  <button class="btn wax" type="button">Add to satchel</button></div></article>`).join('');

$('#shelves').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const item = btn.closest('.item'), id = item.dataset.id, sel = $('select', item), size = sel ? sel.value : undefined;
  const line = cart.find(l => l.id === id && l.size === size);
  if (line) line.qty = Math.min(10, line.qty + 1); else cart.push({ id, size, qty: 1 });
  const bump = () => {
    renderCart();
    const t = $('#satchelBtn').getBoundingClientRect();
    fx.burst(t.left + t.width / 2, t.top + t.height / 2, 26, '#ffd98a', 4);
    if (motion) gsap.fromTo('#satchelBtn', { scale: 1.3 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
  };
  if (!motion) { bump(); return; }
  const from = $('.float', item), a = from.getBoundingClientRect(), b = $('#satchelBtn').getBoundingClientRect();
  const fly = from.cloneNode(true);
  fly.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;z-index:120;margin:0;animation:none;pointer-events:none`;
  fly.setAttribute('aria-hidden', 'true');
  document.body.append(fly);
  const dx = b.left + b.width / 2 - a.left - a.width / 2, dy = b.top + b.height / 2 - a.top - a.height / 2;
  gsap.timeline({ onComplete() { fly.remove(); bump(); } })
    .to(fly, { x: dx, duration: .85, ease: 'power1.in' }, 0)
    .to(fly, { y: dy, duration: .85, ease: 'back.in(2)' }, 0)
    .to(fly, { scale: .12, rotation: 340, duration: .85, ease: 'power2.in', onUpdate() {
      const r = fly.getBoundingClientRect();
      fx.spark(r.left + r.width / 2, r.top + r.height / 2, '#b9a0ff', 1.4);
    } }, 0);
});

const satchel = $('#satchel'), owlPost = $('#owlPost');
$('#satchelBtn').addEventListener('click', () => { renderCart(); satchel.showModal(); sound.hold(true); });
$$('dialog').forEach(d => {
  $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.addEventListener('close', () => sound.hold(false));
});
renderCart();

/* ---------- Forms ---------- */

const measureCtx = document.createElement('canvas').getContext('2d');
const quill = document.createElement('span');
quill.className = 'quill';
quill.innerHTML = QUILL;
function moveQuill(input) {
  const label = input.closest('.field');
  if (label && quill.parentNode !== label) label.append(quill);
  const cs = getComputedStyle(input);
  measureCtx.font = `${cs.fontStyle} ${cs.fontSize} ${cs.fontFamily}`;
  const end = input.tagName === 'TEXTAREA' ? input.clientWidth : measureCtx.measureText(input.value).width + 6;
  quill.style.left = Math.min(end, input.clientWidth - 26) + 'px';
}
document.addEventListener('focusin', e => { if (e.target.matches('.field input:not([type=file]), .field textarea')) moveQuill(e.target); });
document.addEventListener('focusout', e => { if (e.target.matches('.field input, .field textarea')) quill.remove(); });
document.addEventListener('input', e => {
  if (!e.target.matches('.field input:not([type=file]), .field textarea')) return;
  moveQuill(e.target);
  quill.classList.remove('scratch'); void quill.offsetWidth; quill.classList.add('scratch');
});

let blotId = 0;
function setError(input, msg) {
  const label = input.closest('label');
  const old = input._blot;
  if (old) { old.remove(); input._blot = null; input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
  if (!msg) return;
  const blot = document.createElement('em');
  blot.className = 'blot';
  blot.id = 'blot' + (++blotId);
  blot.textContent = msg;
  if (label.classList.contains('field')) label.append(blot); else label.after(blot);
  input._blot = blot;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', blot.id);
}
document.addEventListener('input', e => { if (e.target._blot) setError(e.target); });
document.addEventListener('change', e => { if (e.target._blot) setError(e.target); });

function slipProblem(input) {
  const f = input.files[0];
  if (!f) return input.dataset.msg;
  if (!/\.(jpe?g|png|pdf)$/i.test(f.name)) return 'The slip must be a JPG, PNG or PDF.';
  if (f.size > 5 * 1024 * 1024) return 'The slip must be 5 MB or smaller.';
  return '';
}
function validate(form) {
  let first = null;
  $$('input[data-msg], textarea[data-msg]', form).forEach(input => {
    const msg = input.type === 'file' ? slipProblem(input) : input.value.trim() === '' || !input.validity.valid ? input.dataset.msg : '';
    setError(input, msg);
    if (msg && !first) first = input;
  });
  if (first) first.focus();
  return !first;
}

const toBase64 = file => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1]);
  r.onerror = no;
  r.readAsDataURL(file);
});

function showOwlPost(kind, res) {
  $('#postRef').textContent = res.reference;
  $('.post-scroll p', owlPost).textContent = kind === 'merch' ? 'Your order reference' : 'Your enrolment reference';
  $('#postNote').textContent = res.preview
    ? 'Preview mode: nothing was sent. Add the backend address to content.js to go live.'
    : 'Keep this reference safe. Our team will check your slip and email you to confirm.';
  owlPost.showModal();
  sound.hold(true);
  if (!motion) return;
  gsap.fromTo('#postOwl', { x: -innerWidth * .7, y: -160, scale: .4 }, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'power2.out' });
  gsap.fromTo('.post-scroll', { y: 50, opacity: 0, scaleY: .3 }, { y: 0, opacity: 1, scaleY: 1, duration: .8, delay: .75, ease: 'back.out(1.4)' });
}

async function send(form, kind) {
  const btn = $('button[type=submit]', form), msg = $('.form-msg', form), label = btn.textContent;
  msg.textContent = '';
  if (!validate(form)) return;
  btn.disabled = true;
  btn.textContent = 'Sealing...';
  form._sid = form._sid || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`); // same id on retry, so a retry cannot double-save
  try {
    const f = form.elements;
    const body = { kind, submissionId: form._sid, website: f.website.value, name: f.name.value, email: f.email.value, phone: f.phone.value, slip: { data: await toBase64(f.slip.files[0]) } };
    if (kind === 'merch') body.items = cart.map(l => ({ id: l.id, size: l.size, qty: l.qty }));
    else Object.assign(body, { university: f.university.value, degree: f.degree.value, why: f.why.value, dietary: f.dietary.value, house });

    const res = E.endpoint
      ? await fetch(E.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(r => r.json())
      : { ok: true, reference: 'PREVIEW', preview: true };
    if (!res.ok) { msg.textContent = res.error; return; }

    form._sid = null;
    form.reset();
    if (kind === 'merch') { cart = []; renderCart(); satchel.close(); }
    showOwlPost(kind, res);
  } catch (e) {
    msg.textContent = 'The owl could not take off. Check your connection and try again. Your answers are still here.';
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}
$('#regForm').addEventListener('submit', e => { e.preventDefault(); send(e.target, 'registration'); });
$('#cartForm').addEventListener('submit', e => { e.preventDefault(); send(e.target, 'merch'); });

})();
