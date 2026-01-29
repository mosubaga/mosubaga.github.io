(() => {
  const container = document.getElementById("sketch-gp");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;
    let t = 0;

    const samples = [
      { x: 0.15, y: 0.55 },
      { x: 0.45, y: 0.72 },
      { x: 0.75, y: 0.48 }
    ];

    p.setup = () => {
      w = container.clientWidth;
      const canvas = p.createCanvas(w, h);
      canvas.parent(container);
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    const curveY = (x) => {
      return 0.5 + 0.18 * Math.sin(x * 6 + t) + 0.08 * Math.cos(x * 12 - t * 0.8);
    };

    p.draw = () => {
      p.background("#f6fff9");

      p.noStroke();
      p.fill("rgba(184, 216, 255, 0.35)");
      p.beginShape();
      for (let x = 0; x <= w; x += 6) {
        const nx = x / w;
        const mean = curveY(nx);
        const band = 0.18 - 0.12 * Math.exp(-Math.pow(nx - 0.45, 2) * 10);
        p.vertex(x, h * (mean - band));
      }
      for (let x = w; x >= 0; x -= 6) {
        const nx = x / w;
        const mean = curveY(nx);
        const band = 0.18 - 0.12 * Math.exp(-Math.pow(nx - 0.45, 2) * 10);
        p.vertex(x, h * (mean + band));
      }
      p.endShape(p.CLOSE);

      p.noFill();
      p.stroke("#4c4f6e");
      p.strokeWeight(2);
      p.beginShape();
      for (let x = 0; x <= w; x += 6) {
        const nx = x / w;
        const mean = curveY(nx);
        p.vertex(x, h * mean);
      }
      p.endShape();

      p.noStroke();
      p.fill("#ffb8e0");
      samples.forEach((pt) => {
        p.circle(pt.x * w, pt.y * h, 10);
      });

      p.noStroke();
      p.fill("rgba(185, 243, 213, 0.6)");
      p.circle(w * 0.2, h * 0.2, 26);
      p.circle(w * 0.85, h * 0.75, 32);

      t += 0.01;
    };
  }, container);
})();
