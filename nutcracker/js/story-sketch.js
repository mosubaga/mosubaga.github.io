// The turning point of the story: the Nutcracker's magical transformation.
// Tap or click to send out a new burst of magic sparkles.
new p5(function (p) {
  let holder;
  let sparkles = [];
  let mice = [];
  let snow = [];

  function sizeFor(el) {
    const w = el.offsetWidth || 320;
    const h = p.constrain(w * 0.68, 260, 520);
    return { w, h };
  }

  // The figure's center and the half-size of a halo that traces its silhouette.
  function figureHalo() {
    const cx = p.width / 2;
    const cy = p.height * 0.58 + p.height * 0.08;
    const s = p.min(p.width, p.height) / 260;
    return { cx, cy, rx: 55 * s, ry: 95 * s };
  }

  // A ring of magic dust that appears around the figure's silhouette and
  // drifts gently outward/upward — a halo of sparkle, not a jet from a point.
  function spawnBurst(cx, cy, rx = 70, ry = 110) {
    for (let i = 0; i < 34; i++) {
      const a = p.random(p.TWO_PI);
      const spread = p.random(0.85, 1.15);
      const sx = cx + p.cos(a) * rx * spread;
      const sy = cy + p.sin(a) * ry * spread;
      const drift = p.random(0.2, 0.6);
      sparkles.push({
        x: sx,
        y: sy,
        vx: p.cos(a) * drift,
        vy: p.sin(a) * drift - 0.35,
        life: 255,
        pink: p.random(1) > 0.4,
      });
    }
  }

  p.setup = function () {
    holder = document.getElementById("sketch-holder");
    const { w, h } = sizeFor(holder);
    const cnv = p.createCanvas(w, h);
    cnv.parent(holder);
    p.pixelDensity(1);

    for (let i = 0; i < 60; i++) {
      snow.push({ x: p.random(p.width), y: p.random(p.height), r: p.random(1, 2.6), speed: p.random(0.3, 1) });
    }
    for (let i = 0; i < 6; i++) {
      mice.push({
        side: i % 2 === 0 ? -1 : 1,
        y: p.random(p.height * 0.55, p.height * 0.88),
        offset: p.random(1000),
        speed: p.random(0.3, 0.7),
      });
    }
    const halo = figureHalo();
    spawnBurst(halo.cx, halo.cy, halo.rx, halo.ry);
  };

  p.mousePressed = function () { spawnBurst(p.mouseX, p.mouseY, 40, 40); };
  p.touchStarted = function () {
    const halo = figureHalo();
    spawnBurst(halo.cx, halo.cy, halo.rx, halo.ry);
    return false;
  };

  function drawBackground() {
    for (let y = 0; y < p.height; y++) {
      const t = y / p.height;
      const c = p.lerpColor(p.color(6, 6, 10), p.color(24, 8, 26), t);
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
  }

  function drawNutcrackerPrince(cx, cy, s) {
    p.push();
    p.translate(cx, cy);
    p.scale(s);
    p.noStroke();

    // Legs
    p.fill(20, 20, 24);
    p.rect(-16, 40, 12, 46, 3);
    p.rect(4, 40, 12, 46, 3);

    // Coat
    p.fill(251, 126, 253);
    p.beginShape();
    p.vertex(-28, 42);
    p.vertex(28, 42);
    p.vertex(22, -18);
    p.vertex(-22, -18);
    p.endShape(p.CLOSE);

    // Coat trim
    p.fill(255);
    p.rect(-24, 28, 48, 8);

    // Arms
    p.fill(20, 20, 24);
    p.rect(-34, -8, 10, 38, 4);
    p.rect(24, -8, 10, 38, 4);

    // Head
    p.fill(255, 224, 200);
    p.ellipse(0, -36, 34, 38);

    // Hat
    p.fill(0);
    p.rect(-19, -66, 38, 20, 4);
    p.fill(251, 126, 253);
    p.rect(-19, -50, 38, 6);

    // Face
    p.fill(30);
    p.ellipse(-8, -36, 3.5);
    p.ellipse(8, -36, 3.5);
    p.fill(200, 60, 40);
    p.rect(-3, -28, 6, 10, 2);
    p.pop();
  }

  p.draw = function () {
    drawBackground();

    // Retreating mice silhouettes, fading toward the wings.
    p.noStroke();
    for (const m of mice) {
      const t = (p.frameCount * m.speed + m.offset) % 400;
      const x = m.side < 0 ? p.lerp(p.width * 0.4, -30, t / 400) : p.lerp(p.width * 0.6, p.width + 30, t / 400);
      const alpha = p.map(t, 0, 400, 180, 0);
      p.fill(10, 10, 10, alpha);
      p.ellipse(x, m.y, 22, 14);
      p.ellipse(x - m.side * 12, m.y - 4, 10, 8);
      p.triangle(x - m.side * 16, m.y - 2, x - m.side * 24, m.y - 10, x - m.side * 18, m.y + 4);
    }

    // Glowing spotlight behind the prince
    const cx = p.width / 2;
    const cy = p.height * 0.58;
    const pulse = 0.85 + 0.15 * p.sin(p.frameCount * 0.04);
    p.noStroke();
    p.fill(251, 126, 253, 28);
    p.ellipse(cx, cy, p.width * 0.75 * pulse, p.height * 0.75 * pulse);

    drawNutcrackerPrince(cx, cy + p.height * 0.08, p.min(p.width, p.height) / 260);

    // Magic sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.01;
      s.life -= 4;
      if (s.life <= 0) {
        sparkles.splice(i, 1);
        continue;
      }
      const c = s.pink ? p.color(251, 126, 253) : p.color(255, 255, 255);
      p.fill(p.red(c), p.green(c), p.blue(c), s.life);
      p.ellipse(s.x, s.y, 3.5);
    }
    if (p.frameCount % 90 === 0) {
      const halo = figureHalo();
      spawnBurst(halo.cx, halo.cy, halo.rx, halo.ry);
    }

    // Snow
    p.fill(255, 255, 255, 180);
    for (const s of snow) {
      s.y += s.speed;
      if (s.y > p.height) { s.y = -4; s.x = p.random(p.width); }
      p.ellipse(s.x, s.y, s.r);
    }
  };

  p.windowResized = function () {
    const { w, h } = sizeFor(holder);
    p.resizeCanvas(w, h);
  };
}, "sketch-holder");
