(() => {
  const container = document.getElementById("sketch-causal");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;

    p.setup = () => {
      w = container.clientWidth;
      const canvas = p.createCanvas(w, h);
      canvas.parent(container);
      p.textFont("Space Mono");
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    function node(x, y, label, color) {
      p.fill(color);
      p.stroke("#22233b");
      p.strokeWeight(1);
      p.circle(x, y, 36);
      p.noStroke();
      p.fill("#22233b");
      p.textSize(12);
      p.text(label, x - 6, y + 4);
    }

    p.draw = () => {
      p.background("#f6fff9");
      const t = p.millis() * 0.001;
      const x1 = w * 0.2;
      const x2 = w * 0.5;
      const x3 = w * 0.8;
      const y1 = h * 0.5 + 10 * Math.sin(t);
      const y2 = h * 0.35;
      const y3 = h * 0.55;

      p.stroke("#4c4f6e");
      p.strokeWeight(2);
      p.line(x1 + 20, y1, x2 - 20, y2);
      p.line(x2 + 20, y2, x3 - 20, y3);
      p.line(x1 + 20, y1, x3 - 20, y3);

      p.noStroke();
      node(x1, y1, "X", "#b9f3d5");
      node(x2, y2, "M", "#b8d8ff");
      node(x3, y3, "Y", "#ffb8e0");
    };
  }, container);
})();
