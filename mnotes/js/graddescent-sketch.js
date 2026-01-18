(() => {
  const container = document.getElementById("sketch-grad");
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
      p.background("#fdf6ff");
      p.noFill();
      p.stroke("#b8d8ff");
      for (let r = 30; r < h; r += 24) {
        p.ellipse(w * 0.55, h * 0.55, r * 2, r * 1.2);
      }

      t += 0.01;
      const x = w * 0.2 + (w * 0.35) * (1 - Math.exp(-t));
      const y = h * 0.2 + (h * 0.35) * (1 - Math.exp(-t));

      p.stroke("#4c4f6e");
      p.strokeWeight(2);
      p.line(w * 0.2, h * 0.2, x, y);
      p.noStroke();
      p.fill("#ffb8e0");
      p.circle(x, y, 16);
    };
  }, container);
})();
