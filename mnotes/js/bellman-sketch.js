(() => {
  const container = document.getElementById("sketch-bellman");
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

    const drawArrow = (x1, y1, x2, y2) => {
      p.stroke("#4c4f6e");
      p.strokeWeight(1.5);
      p.line(x1, y1, x2, y2);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const size = 6;
      p.push();
      p.translate(x2, y2);
      p.rotate(angle);
      p.line(0, 0, -size, -size * 0.6);
      p.line(0, 0, -size, size * 0.6);
      p.pop();
    };

    p.draw = () => {
      p.background("#fdf6ff");
      const cols = 5;
      const rows = 3;
      const xGap = w / (cols + 1);
      const yGap = h / (rows + 1);
      t += 0.015;

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const x = (c + 1) * xGap;
          const y = (r + 1) * yGap;
          const value = 0.5 + 0.5 * Math.sin(t + c * 0.9 + r * 0.6);
          const size = 18 + 8 * value;

          p.noStroke();
          p.fill(p.lerpColor(p.color("#b8d8ff"), p.color("#ffb8e0"), value));
          p.circle(x, y, size);

          if (c < cols - 1) {
            drawArrow(x + size * 0.35, y, x + xGap - size * 0.35, y);
          }
          if (r < rows - 1) {
            drawArrow(x, y + size * 0.35, x, y + yGap - size * 0.35);
          }
        }
      }

      p.noStroke();
      p.fill("rgba(185, 243, 213, 0.6)");
      p.circle(w * 0.15, h * 0.8, 40 + 6 * Math.sin(t * 1.2));
      p.circle(w * 0.85, h * 0.2, 34 + 6 * Math.cos(t * 1.1));
    };
  }, container);
})();
