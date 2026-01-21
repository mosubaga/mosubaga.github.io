(() => {
  const container = document.getElementById("sketch-calcvar");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 260;
    let paths = [];

    const palette = ["#ffb8e0", "#b8d8ff", "#b9f3d5", "#ffe2a8"];

    const makePaths = () => ([
      { amp: 20, freq: 1.0, phase: 0.2, color: palette[0], weight: 1.6 },
      { amp: 16, freq: 1.3, phase: 1.1, color: palette[1], weight: 1.4 },
      { amp: 12, freq: 1.6, phase: 2.2, color: palette[2], weight: 1.4 },
      { amp: 10, freq: 1.9, phase: 3.1, color: palette[3], weight: 1.2 }
    ]);

    const extremal = (x) => {
      const mid = w * 0.5;
      return h * 0.55 + 0.0016 * Math.pow(x - mid, 2);
    };

    p.setup = () => {
      w = container.clientWidth;
      const canvas = p.createCanvas(w, h);
      canvas.parent(container);
      p.textFont("Space Mono");
      paths = makePaths();
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.background("#fff7fb");
      const t = p.millis() * 0.001;

      p.stroke("rgba(34, 35, 59, 0.08)");
      p.strokeWeight(1);
      for (let x = w * 0.1; x <= w * 0.9; x += w * 0.1) {
        p.line(x, h * 0.2, x, h * 0.88);
      }

      const left = w * 0.1;
      const right = w * 0.9;

      paths.forEach((path, index) => {
        p.noFill();
        p.stroke(path.color);
        p.strokeWeight(path.weight);
        p.beginShape();
        const wobble = path.amp * (0.65 + 0.35 * Math.sin(t * 0.7 + index));
        for (let x = left; x <= right; x += 6) {
          const wave = wobble * Math.sin((x / w) * Math.PI * path.freq + path.phase + t * 0.4);
          p.vertex(x, extremal(x) + wave);
        }
        p.endShape();
      });

      p.stroke("#4c4f6e");
      p.strokeWeight(3);
      p.noFill();
      p.beginShape();
      for (let x = left; x <= right; x += 6) {
        p.vertex(x, extremal(x));
      }
      p.endShape();

      const travel = (Math.sin(t * 0.6) + 1) * 0.5;
      const px = p.lerp(left, right, travel);
      const py = extremal(px);

      p.noStroke();
      p.fill("#b9f3d5");
      p.circle(px, py, 14);

      p.fill("#ffb8e0");
      p.circle(left, extremal(left), 12);
      p.circle(right, extremal(right), 12);

      p.fill("#22233b");
      p.textSize(12);
      p.text("Euler-Lagrange", left, h * 0.18);
      p.text("d/dx (dF/dy') - dF/dy = 0", left, h * 0.26);
    };
  }, container);
})();
