(() => {
  const container = document.getElementById("sketch-bayes");
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
      p.noStroke();
      p.textFont("Space Mono");
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.background("#fff7fb");
      const t = p.millis() * 0.001;

      const prior = 38 + 6 * Math.sin(t);
      const likelihood = 54 + 6 * Math.sin(t + 1.4);
      const posterior = 62 + 6 * Math.sin(t + 2.4);

      const centerY = h * 0.55;
      const gap = w / 4;
      const startX = w * 0.2;

      p.fill("#ffb8e0");
      p.circle(startX, centerY, prior);
      p.fill("#b8d8ff");
      p.circle(startX + gap, centerY, likelihood);
      p.fill("#b9f3d5");
      p.circle(startX + gap * 2, centerY, posterior);

      p.fill("#22233b");
      p.textSize(12);
      p.text("Prior", startX - 16, centerY + 50);
      p.text("Likelihood", startX + gap - 28, centerY + 50);
      p.text("Posterior", startX + gap * 2 - 22, centerY + 50);
    };
  }, container);
})();
