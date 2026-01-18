(() => {
  const container = document.getElementById("sketch-fourier");
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
      p.noFill();
    };

    p.windowResized = () => {
      w = container.clientWidth;
      p.resizeCanvas(w, h);
    };

    p.draw = () => {
      p.background("#fff8f1");
      const t = p.millis() * 0.001;
      const mid = h * 0.5;
      const scale = h * 0.28;

      p.strokeWeight(2);
      p.stroke("#b8d8ff");
      p.beginShape();
      for (let x = 0; x <= w; x += 6) {
        const y = mid + scale * Math.sin((x * 0.015) + t);
        p.vertex(x, y);
      }
      p.endShape();

      p.stroke("#ffb8e0");
      p.beginShape();
      for (let x = 0; x <= w; x += 6) {
        const y = mid + scale * 0.6 * Math.sin((x * 0.03) - t * 1.2);
        p.vertex(x, y);
      }
      p.endShape();

      p.stroke("#4c4f6e");
      p.beginShape();
      for (let x = 0; x <= w; x += 6) {
        const y = mid +
          scale * Math.sin((x * 0.015) + t) +
          scale * 0.6 * Math.sin((x * 0.03) - t * 1.2);
        p.vertex(x, y);
      }
      p.endShape();
    };
  }, container);
})();
