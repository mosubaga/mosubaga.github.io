// Three dancers under a spotlight that follows your pointer or finger.
new p5(function (p) {
  let holder;
  let spot = { x: 0, y: 0 };
  let orbit = [];

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
    spot = { x: p.width / 2, y: p.height * 0.45 };

    for (let i = 0; i < 18; i++) {
      orbit.push({ a: p.random(p.TWO_PI), r: p.random(16, 60), speed: p.random(0.01, 0.03) });
    }
  };

  function drawBackground() {
    for (let y = 0; y < p.height; y++) {
      const t = y / p.height;
      const c = p.lerpColor(p.color(4, 4, 6), p.color(18, 6, 20), t);
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
  }

  function dancer(x, y, s, rotation, tone) {
    p.push();
    p.translate(x, y);
    p.scale(s);
    p.rotate(rotation);
    p.noStroke();

    // Tutu / skirt
    p.fill(tone);
    p.beginShape();
    p.vertex(-30, 12);
    p.vertex(30, 12);
    p.vertex(16, -8);
    p.vertex(-16, -8);
    p.endShape(p.CLOSE);

    // Bodice
    p.fill(255, 255, 255, 235);
    p.rect(-9, -34, 18, 28, 6);

    // Arms raised in arabesque
    p.stroke(255, 255, 255, 235);
    p.strokeWeight(5);
    p.line(-9, -26, -34, -40);
    p.line(9, -26, 34, -40);
    p.noStroke();

    // Head
    p.fill(255, 224, 200);
    p.ellipse(0, -44, 16, 18);

    // Supporting leg + pointe
    p.fill(255, 224, 200);
    p.rect(-5, 12, 6, 30, 2);
    // Extended leg (arabesque line)
    p.push();
    p.translate(4, 16);
    p.rotate(p.PI * 0.62);
    p.rect(-3, 0, 6, 34, 2);
    p.pop();
    p.pop();
  }

  p.draw = function () {
    drawBackground();

    const targetX = p.constrain(p.mouseX, 40, p.width - 40);
    const targetY = p.height * 0.42;
    spot.x = p.lerp(spot.x, p.width > 0 && p.mouseX > 0 && p.mouseX < p.width ? targetX : p.width / 2, 0.06);
    spot.y = targetY;

    // Spotlight
    p.noStroke();
    p.fill(255, 255, 255, 18);
    p.ellipse(spot.x, spot.y, p.width * 0.8, p.height * 0.9);
    p.fill(251, 126, 253, 22);
    p.ellipse(spot.x, spot.y, p.width * 0.5, p.height * 0.55);

    // Three dancers across the stage
    const baseY = p.height * 0.66;
    const scaleUnit = p.min(p.width, p.height) / 300;
    const spin = p.frameCount * 0.01;

    dancer(p.width * 0.28, baseY, scaleUnit * 0.85, p.sin(spin * 0.6) * 0.08, p.color(255, 255, 255));
    dancer(p.width * 0.5, baseY - 10, scaleUnit * 1.05, 0, p.color(251, 126, 253));
    dancer(p.width * 0.72, baseY, scaleUnit * 0.85, -p.sin(spin * 0.6) * 0.08, p.color(255, 255, 255));

    // Orbiting sparkles around the center dancer
    for (const o of orbit) {
      o.a += o.speed;
      const x = p.width * 0.5 + p.cos(o.a) * o.r;
      const y = baseY - 30 + p.sin(o.a) * o.r * 0.6;
      const glow = 0.5 + 0.5 * p.sin(p.frameCount * 0.05 + o.a);
      p.fill(251, 126, 253, 180 * glow);
      p.ellipse(x, y, 3);
    }
  };

  p.windowResized = function () {
    const { w, h } = sizeFor(holder);
    p.resizeCanvas(w, h);
    spot = { x: p.width / 2, y: p.height * 0.45 };
  };
}, "sketch-holder");
