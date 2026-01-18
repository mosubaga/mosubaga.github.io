(() => {
  const container = document.getElementById("sketch-stochastic");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;
    const path = [];

    p.setup = () => {
      w = container.clientWidth;
      const canvas = p.createCanvas(w, h);
      canvas.parent(container);
      path.length = 0;
      path.push({ x: w * 0.1, y: h * 0.5 });
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.background("#fdf6ff");
      const last = path[path.length - 1];
      const step = {
        x: Math.min(last.x + 6, w * 0.9),
        y: last.y + p.random(-14, 14)
      };
      path.push(step);
      if (step.x >= w * 0.9 || path.length > 120) {
        path.shift();
      }

      p.stroke("#b8d8ff");
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (const pt of path) {
        p.vertex(pt.x, pt.y);
      }
      p.endShape();

      p.noStroke();
      p.fill("#ffb8e0");
      p.circle(step.x, step.y, 12);
    };
  }, container);
})();
