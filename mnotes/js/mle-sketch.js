(() => {
  const container = document.getElementById("sketch-mle");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;
    const points = [42, 70, 85, 120, 150, 175, 190, 220];
    let estimate = 120;
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

    const gaussian = (x, mu, sigma) => {
      const z = (x - mu) / sigma;
      return Math.exp(-0.5 * z * z);
    };

    p.draw = () => {
      p.background("#fff8f1");
      const sampleMean = points.reduce((sum, v) => sum + v, 0) / points.length;
      estimate = p.lerp(estimate, sampleMean, 0.03);

      p.stroke("#b8d8ff");
      p.strokeWeight(2);
      p.line(20, h - 40, w - 20, h - 40);

      p.noStroke();
      p.fill("#ffb8e0");
      points.forEach((x) => {
        p.circle(x, h - 40, 10);
      });

      p.noFill();
      p.stroke("#4c4f6e");
      p.strokeWeight(2);
      p.beginShape();
      const sigma = 40 + 10 * Math.sin(t * 0.5);
      for (let x = 20; x <= w - 20; x += 4) {
        const y = gaussian(x, estimate, sigma);
        p.vertex(x, h - 40 - y * 120);
      }
      p.endShape();

      p.stroke("#b9f3d5");
      p.strokeWeight(3);
      p.line(estimate, h - 40, estimate, h - 170);

      p.noStroke();
      p.fill("#4c4f6e");
      p.textSize(12);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text("MLE", estimate, h - 175);

      t += 0.02;
    };
  }, container);
})();
