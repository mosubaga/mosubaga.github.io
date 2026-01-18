(() => {
  const container = document.getElementById("sketch-lagrange");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;
    let t = 0;

    p.setup = () => {
      w = container.clientWidth;
      const canvas = p.createCanvas(w, h);
      canvas.parent(container);
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.background("#f6fff9");
      p.noFill();
      p.stroke("#b8d8ff");
      p.strokeWeight(2);
      p.ellipse(w * 0.5, h * 0.5, 160, 120);

      p.stroke("#ffb8e0");
      p.beginShape();
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.2 + 0.002 * Math.pow(x - w * 0.5, 2);
        p.vertex(x, y);
      }
      p.endShape();

      t += 0.01;
      const angle = 1.2 + 0.3 * Math.sin(t);
      const cx = w * 0.5 + 80 * Math.cos(angle);
      const cy = h * 0.5 + 60 * Math.sin(angle);

      p.noStroke();
      p.fill("#b9f3d5");
      p.circle(cx, cy, 14);

      p.stroke("#4c4f6e");
      p.strokeWeight(2);
      p.line(cx, cy, cx + 28 * Math.cos(angle), cy + 28 * Math.sin(angle));
    };
  }, container);
})();
