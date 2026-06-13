/**
 * Kawaii rain background — canvas particle effect
 * Inspired by innei.in
 *
 * Usage: <script src="rain.js"></script>  (just before </body>)
 *
 * Layers:
 *  1. Bokeh   — slow-drifting glowing orbs (radial gradient blobs)
 *  2. Rain    — thin semi-transparent streaks falling at varied speeds
 *  3. Ripples — expanding ellipse rings where drops hit the bottom
 */
(function () {
  'use strict';

  // ── Palette (mirrors --kawaii-* variables) ──────────────────────────────
  const [RR, GG, BB] = [203, 179, 224];  // --kawaii-border #cbb3e0
  const BOKEH_HUES = [
    { h: 270, s: 40, l: 82 },  // lavender  --kawaii-purple
    { h: 320, s: 50, l: 88 },  // blush     --kawaii-pink
    { h: 200, s: 45, l: 84 },  // sky       --kawaii-blue
    { h: 170, s: 40, l: 85 },  // mint      --kawaii-mint
  ];

  // ── Config ──────────────────────────────────────────────────────────────
  const CFG = {
    drops:      99,   // +10% from original 90
    bokeh:      10,
    dropAlpha:  0.55,
    bokehAlpha: 0.13,
    speed:      1.0,
  };

  const TAU = Math.PI * 2;

  // ── Canvas setup ────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '-1',
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  // ── State ────────────────────────────────────────────────────────────────
  let W = 0, H = 0, DPR = 1;
  let drops   = [];
  let orbs    = [];
  let sprites = [];  // pre-rendered bokeh sprites
  let ripples = [];

  // ── Factories ────────────────────────────────────────────────────────────
  function makeDrop(scatter) {
    return {
      x:     Math.random() * (W + 60) - 30,
      y:     scatter ? Math.random() * H : -60,
      len:   18 + 22 * Math.random(),
      vel:   130 + 140 * Math.random(),
      tilt:  0.06 + 0.05 * Math.random(),
      alpha: 0.25 + CFG.dropAlpha * Math.random(),
    };
  }

  function makeRipple(x, alpha) {
    return {
      x,
      y:           H - 20,         // sit 20px above bottom edge
      age:         0,
      duration:    1.5 + 0.9 * Math.random(),
      maxRadius:   30 + 28 * Math.random(),  // larger so it reads clearly
      alpha:       alpha * 0.9,
      second:      Math.random() < 0.4,
      secondDelay: 0.3 + 0.2 * Math.random(),
    };
  }

  function makeOrb() {
    const pal = BOKEH_HUES[Math.floor(Math.random() * BOKEH_HUES.length)];
    return {
      x:           Math.random() * W,
      y:           0.15 * H + Math.random() * H * 0.75,
      radius:      70 + 130 * Math.random(),
      aspect:      0.55 + 0.3 * Math.random(),
      hue:         pal.h + 20 * (Math.random() - 0.5),
      sat:         pal.s + 8  * (Math.random() - 0.5),
      light:       pal.l + 6  * (Math.random() - 0.5),
      baseAlpha:   0.06 + CFG.bokehAlpha * Math.random(),
      driftAmpX:   3 + 7 * Math.random(),
      driftAmpY:   2 + 4 * Math.random(),
      driftFreq:   0.25 + 0.3 * Math.random(),
      driftPhase:  Math.random() * TAU,
      breathFreq:  TAU / (7 + 7 * Math.random()),
      breathPhase: Math.random() * TAU,
    };
  }

  function buildSprite(orb) {
    const size   = Math.ceil(2 * orb.radius * DPR);
    const sprite = document.createElement('canvas');
    sprite.width  = size;
    sprite.height = Math.ceil(size * orb.aspect);
    const c  = sprite.getContext('2d');
    const cx = size / 2;
    const cy = sprite.height / 2;
    const g  = c.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    g.addColorStop(0,    `hsla(${orb.hue},${orb.sat}%,${orb.light}%,1)`);
    g.addColorStop(0.55, `hsla(${orb.hue},${orb.sat}%,${orb.light}%,0.45)`);
    g.addColorStop(1,    `hsla(${orb.hue},${orb.sat}%,${orb.light}%,0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, sprite.width, sprite.height);
    return sprite;
  }

  // ── Resize ───────────────────────────────────────────────────────────────
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W   = window.innerWidth;
    H   = window.innerHeight;
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);

    drops   = Array.from({ length: CFG.drops }, () => makeDrop(true));
    orbs    = Array.from({ length: CFG.bokeh }, makeOrb);
    sprites = orbs.map(buildSprite);
    ripples = [];
  }

  window.addEventListener('resize', resize);
  resize();

  // ── Animation loop ───────────────────────────────────────────────────────
  let lastTs = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastTs) / 1000, 0.05) * CFG.speed;
    lastTs = now;
    const t = now / 1000;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── Bokeh layer ──────────────────────────────────────────────────────
    for (let i = 0; i < orbs.length; i++) {
      const o      = orbs[i];
      const ox     = Math.sin(t * o.driftFreq       + o.driftPhase) * o.driftAmpX;
      const oy     = Math.cos(t * o.driftFreq * 0.8 + o.driftPhase) * o.driftAmpY;
      const breath = 0.55 + 0.45 * Math.sin(t * o.breathFreq + o.breathPhase);
      const alpha  = Math.min(1, o.baseAlpha * breath);
      if (alpha < 0.004) continue;

      const sp = sprites[i];
      ctx.globalAlpha = alpha;
      ctx.drawImage(sp, o.x + ox - sp.width / DPR / 2, o.y + oy - sp.height / DPR / 2,
                    sp.width / DPR, sp.height / DPR);
    }
    ctx.globalAlpha = 1;

    // ── Rain layer ───────────────────────────────────────────────────────
    ctx.lineWidth = 1;
    for (const d of drops) {
      d.y += d.vel * dt;
      d.x += d.tilt * d.vel * dt;

      // Tip (leading bottom point) of the streak
      const tipX = d.x + d.tilt * d.len;
      const tipY = d.y;

      if (tipY >= H) {
        // Spawn ripple at ground impact then recycle drop
        ripples.push(makeRipple(tipX, d.alpha));
        Object.assign(d, makeDrop(false));
        continue;  // skip drawing the just-reset drop this frame
      }

      const x0 = d.x;
      const y0 = d.y - d.len;
      const x1 = tipX;
      const y1 = tipY;

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0,   `rgba(${RR},${GG},${BB},0)`);
      grad.addColorStop(0.4, `rgba(${RR},${GG},${BB},${d.alpha})`);
      grad.addColorStop(1,   `rgba(${RR},${GG},${BB},${d.alpha * 0.6})`);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    // ── Ripple layer ─────────────────────────────────────────────────────
    ctx.lineWidth = 1.5;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.age += dt;

      if (rip.age >= rip.duration) {
        ripples.splice(i, 1);
        continue;
      }

      const p = rip.age / rip.duration;  // 0 → 1

      // Small splash dot at impact point (visible in first 25% of life)
      if (p < 0.25) {
        const splashAlpha = rip.alpha * (1 - p / 0.25);
        ctx.fillStyle = `rgba(${RR},${GG},${BB},${splashAlpha})`;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, 1.8 * (1 - p * 3), 0, TAU);
        ctx.fill();
      }

      // Primary expanding ellipse ring (flat perspective — wider than tall)
      const rx1 = rip.maxRadius * p;
      const ry1 = rx1 * 0.38;
      const a1  = rip.alpha * (1 - p) * 0.7;
      ctx.strokeStyle = `rgba(${RR},${GG},${BB},${a1})`;
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, Math.max(0.1, rx1), Math.max(0.1, ry1), 0, 0, TAU);
      ctx.stroke();

      // Second smaller delayed ring (40% chance)
      if (rip.second && rip.age > rip.secondDelay) {
        const p2  = Math.min(1, (rip.age - rip.secondDelay) / (rip.duration - rip.secondDelay));
        const rx2 = rip.maxRadius * 0.6 * p2;
        const ry2 = rx2 * 0.38;
        const a2  = rip.alpha * (1 - p2) * 0.4;
        ctx.strokeStyle = `rgba(${RR},${GG},${BB},${a2})`;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, Math.max(0.1, rx2), Math.max(0.1, ry2), 0, 0, TAU);
        ctx.stroke();
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
