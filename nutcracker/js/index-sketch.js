// Christmas Eve scene: a sparkling sugar-plum tree under falling snow.
new p5(function (p) {
  let holder;
  let snow = [];
  let lights = [];
  const NUM_SNOW = 90;
  const NUM_LIGHTS = 26;

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

    for (let i = 0; i < NUM_SNOW; i++) {
      snow.push({
        x: p.random(p.width),
        y: p.random(p.height),
        r: p.random(1.3, 3.4),
        speed: p.random(0.4, 1.4),
        drift: p.random(1000),
      });
    }

    // Lights scattered across the tree's triangular silhouette.
    for (let i = 0; i < NUM_LIGHTS; i++) {
      const row = p.random(1);
      lights.push({
        rowT: row,
        side: p.random(-1, 1),
        phase: p.random(p.TWO_PI),
      });
    }
  };

  function drawBackground() {
    for (let y = 0; y < p.height; y++) {
      const t = y / p.height;
      const c = p.lerpColor(
        p.color(10, 10, 14),
        p.color(26, 10, 28),
        t
      );
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
    p.noStroke();
    p.fill(251, 126, 253, 18);
    p.ellipse(p.width * 0.5, p.height * 0.18, p.width * 0.9, p.height * 0.6);
  }

  function treeGeometry() {
    const baseY = p.height * 0.92;
    const topY = p.height * 0.14;
    const baseW = p.width * 0.52;
    const cx = p.width * 0.5;
    return { baseY, topY, baseW, cx };
  }

  function pointOnTree(rowT, side) {
    const { baseY, topY, baseW, cx } = treeGeometry();
    const y = p.lerp(baseY, topY, rowT);
    const widthHere = p.lerp(baseW, 6, rowT);
    const x = cx + side * widthHere * 0.5;
    return { x, y };
  }

  p.draw = function () {
    drawBackground();

    // Trunk
    const { baseY, cx } = treeGeometry();
    p.noStroke();
    p.fill(40, 20, 30);
    p.rect(cx - 10, baseY - 4, 20, p.height * 0.06, 3);

    // Tree silhouette built from stacked triangular tiers.
    const tiers = 5;
    p.fill(14, 10, 16);
    p.stroke(251, 126, 253, 140);
    p.strokeWeight(1.2);
    for (let i = 0; i < tiers; i++) {
      const t0 = i / tiers;
      const t1 = (i + 1) / tiers + 0.06;
      const top = pointOnTree(Math.min(t1, 1), 0);
      const left = pointOnTree(t0, -1);
      const right = pointOnTree(t0, 1);
      p.triangle(top.x, top.y, left.x, left.y, right.x, right.y);
    }

    // Snow dusting on each tier edge
    p.noStroke();
    p.fill(255, 255, 255, 160);
    for (let i = 0; i < tiers; i++) {
      const t0 = i / tiers;
      const left = pointOnTree(t0, -1);
      const right = pointOnTree(t0, 1);
      for (let s = 0; s <= 6; s++) {
        const lx = p.lerp(left.x, pointOnTree(Math.min(t0 + 1 / tiers, 1), 0).x, s / 6);
        const ly = p.lerp(left.y, pointOnTree(Math.min(t0 + 1 / tiers, 1), 0).y, s / 6);
        p.ellipse(lx, ly + 2, 2.2, 1.6);
        const rx = p.lerp(right.x, pointOnTree(Math.min(t0 + 1 / tiers, 1), 0).x, s / 6);
        const ry = p.lerp(right.y, pointOnTree(Math.min(t0 + 1 / tiers, 1), 0).y, s / 6);
        p.ellipse(rx, ry + 2, 2.2, 1.6);
      }
    }

    // Twinkling pink / white lights
    for (const l of lights) {
      const pos = pointOnTree(l.rowT, l.side * 0.92);
      const glow = 0.5 + 0.5 * p.sin(p.frameCount * 0.05 + l.phase);
      const c = l.phase % 2 < 1 ? p.color(251, 126, 253) : p.color(255, 255, 255);
      p.noStroke();
      p.fill(p.red(c), p.green(c), p.blue(c), 90 * glow + 40);
      p.ellipse(pos.x, pos.y, 10 * glow + 4);
      p.fill(c);
      p.ellipse(pos.x, pos.y, 3.5);
    }

    // Glowing star on top
    const top = pointOnTree(1, 0);
    const starGlow = 0.6 + 0.4 * p.sin(p.frameCount * 0.06);
    p.noStroke();
    p.fill(255, 255, 255, 60 * starGlow);
    p.ellipse(top.x, top.y - 10, 42 * starGlow);
    p.fill(255, 255, 255);
    drawStar(top.x, top.y - 10, 5, 11, 5);

    // Falling snow
    p.fill(255, 255, 255, 210);
    for (const s of snow) {
      s.y += s.speed;
      s.x += p.sin((p.frameCount + s.drift) * 0.02) * 0.6;
      if (s.y > p.height) {
        s.y = -4;
        s.x = p.random(p.width);
      }
      p.ellipse(s.x, s.y, s.r);
    }
  };

  function drawStar(x, y, radius1, radius2, npoints) {
    const angle = p.TWO_PI / npoints;
    const halfAngle = angle / 2.0;
    p.beginShape();
    for (let a = -p.PI / 2; a < p.TWO_PI - p.PI / 2; a += angle) {
      let sx = x + p.cos(a) * radius2;
      let sy = y + p.sin(a) * radius2;
      p.vertex(sx, sy);
      sx = x + p.cos(a + halfAngle) * radius1;
      sy = y + p.sin(a + halfAngle) * radius1;
      p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
  }

  p.windowResized = function () {
    const { w, h } = sizeFor(holder);
    p.resizeCanvas(w, h);
  };
}, "sketch-holder");
