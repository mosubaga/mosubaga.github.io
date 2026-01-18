(() => {
  const container = document.getElementById("sketch-svd");
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
      p.noFill();
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.background("#fff7fb");
      const cx = w * 0.5;
      const cy = h * 0.5;
      t += 0.01;

      p.stroke("#b8d8ff");
      p.strokeWeight(2);
      p.ellipse(cx - 120, cy, 70, 70);

      p.push();
      p.translate(cx + 60, cy);
      p.rotate(0.6 + 0.2 * Math.sin(t));
      p.stroke("#ffb8e0");
      p.ellipse(0, 0, 130, 60);
      p.pop();

      p.stroke("#4c4f6e");
      p.line(cx - 80, cy, cx + 10, cy);
      p.triangle(cx + 10, cy, cx, cy - 6, cx, cy + 6);
    };
  }, container);
})();
