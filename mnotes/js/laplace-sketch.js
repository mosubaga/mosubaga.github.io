(() => {
  const container = document.getElementById("sketch-laplace");
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
      p.background("#fff8f1");
      const mid = h * 0.7;
      t += 0.01;

      p.stroke("#4c4f6e");
      p.line(w * 0.1, mid, w * 0.9, mid);
      p.line(w * 0.1, mid, w * 0.1, h * 0.2);

      p.stroke("#ffb8e0");
      p.strokeWeight(2);
      p.beginShape();
      for (let x = 0; x <= w * 0.8; x += 6) {
        const y = mid - 120 * Math.exp(-0.015 * x) * (1 + 0.2 * Math.sin(t));
        p.vertex(w * 0.1 + x, y);
      }
      p.endShape();

      p.stroke("#b8d8ff");
      p.beginShape();
      for (let x = 0; x <= w * 0.8; x += 6) {
        const y = mid - 60 * Math.exp(-0.02 * x) * Math.cos(0.08 * x + t);
        p.vertex(w * 0.1 + x, y);
      }
      p.endShape();
    };
  }, container);
})();
