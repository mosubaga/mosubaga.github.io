(() => {
  const container = document.getElementById("sketch-braket");
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
      const originX = w * 0.2;
      const originY = h * 0.7;
      t += 0.01;

      const v1 = { x: 120, y: -80 };
      const angle = 0.6 + 0.2 * Math.sin(t);
      const v2 = { x: 120 * Math.cos(angle), y: -120 * Math.sin(angle) };

      p.strokeWeight(3);
      p.stroke("#b8d8ff");
      p.line(originX, originY, originX + v1.x, originY + v1.y);
      p.stroke("#ffb8e0");
      p.line(originX, originY, originX + v2.x, originY + v2.y);

      const dot = (v1.x * v2.x + v1.y * v2.y) / 140;
      p.stroke("#4c4f6e");
      p.line(originX + v2.x, originY + v2.y, originX + v2.x, originY + v2.y + dot);
      p.noStroke();
      p.fill("#b9f3d5");
      p.circle(originX + v2.x, originY + v2.y + dot, 12);
    };
  }, container);
})();
