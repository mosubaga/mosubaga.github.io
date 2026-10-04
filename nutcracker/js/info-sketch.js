// A theater curtain that slowly breathes open and closed, revealing a
// twinkling starlit stage behind it — a nod to the trivia you'll find below.
new p5(function (p) {
  let holder;
  let stars = [];

  function sizeFor(el) {
    const w = el.offsetWidth || 320;
    const h = p.constrain(w * 0.68, 260, 520);
    return { w, h };
  }

  p.setup = function () {
    holder = document.getElementById("sketch-holder");
    const { w, h } = sizeFor(holder);
    const cnv = p.createCanvas(w, h);
    cnv.parent(holder);
    p.pixelDensity(1);

    for (let i = 0; i < 50; i++) {
      stars.push({ x: p.random(p.width), y: p.random(p.height * 0.7), r: p.random(1, 2.8), phase: p.random(p.TWO_PI) });
    }
  };

  function drawStage() {
    // Stage back wall
    for (let y = 0; y < p.height; y++) {
      const t = y / p.height;
      const c = p.lerpColor(p.color(8, 4, 12), p.color(2, 2, 4), t);
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
    // Spotlight
    p.noStroke();
    p.fill(255, 255, 255, 20);
    p.ellipse(p.width / 2, p.height * 0.3, p.width * 0.9, p.height * 0.8);

    // Twinkling stars
    for (const s of stars) {
      const glow = 0.4 + 0.6 * p.sin(p.frameCount * 0.04 + s.phase);
      p.fill(255, 255, 255, 200 * glow);
      p.ellipse(s.x, s.y, s.r * (0.7 + glow));
    }

    // Stage floor
    p.fill(20, 10, 16);
    p.rect(0, p.height * 0.84, p.width, p.height * 0.16);
    p.stroke(251, 126, 253, 70);
    for (let x = 0; x < p.width; x += 28) {
      p.line(x, p.height * 0.84, x - 14, p.height);
    }
  }

  function curtainPanel(xEdge, dir, openAmount) {
    const w = p.width * 0.56 * (1 - openAmount);
    p.noStroke();
    for (let i = 0; i < w; i += 1) {
      const t = i / w;
      const shade = 70 + 70 * Math.sin(i * 0.25);
      p.fill(90 + shade * 0.5, 20 + shade * 0.15, 95 + shade * 0.5);
      const x = dir > 0 ? xEdge + i : xEdge - i;
      p.rect(x, 0, 1.2, p.height);
    }
    // Trim
    p.fill(255, 215, 235);
    const trimX = dir > 0 ? xEdge + w : xEdge - w;
    p.rect(trimX - (dir > 0 ? 4 : 0), 0, 4, p.height);
    // Swag along the bottom
    p.fill(60, 10, 64);
    const scallops = 6;
    for (let i = 0; i < scallops; i++) {
      const cx = dir > 0 ? xEdge + (w * (i + 0.5)) / scallops : xEdge - (w * (i + 0.5)) / scallops;
      p.ellipse(cx, p.height * 0.08, w / scallops + 10, 26);
    }
  }

  p.draw = function () {
    drawStage();

    const openAmount = 0.52 + 0.48 * p.sin(p.frameCount * 0.012);
    curtainPanel(0, 1, openAmount);
    curtainPanel(p.width, -1, openAmount);

    // Soft vignette
    p.noStroke();
    p.fill(0, 0, 0, 40);
    p.rect(0, 0, p.width, p.height * 0.06);
    p.rect(0, p.height * 0.94, p.width, p.height * 0.06);
  };

  p.windowResized = function () {
    const { w, h } = sizeFor(holder);
    p.resizeCanvas(w, h);
  };
}, "sketch-holder");
