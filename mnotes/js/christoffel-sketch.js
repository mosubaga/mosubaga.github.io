(() => {
  const container = document.getElementById("sketch-christoffel");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;
    let theta = 0;

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
      const cx = w * 0.5;
      const cy = h * 0.55;
      const radius = Math.min(w * 0.28, 85);
      theta += 0.012;

      p.noFill();
      p.stroke("#e5def7");
      p.strokeWeight(2);
      p.circle(cx, cy, radius * 2);

      const px = cx + radius * Math.cos(theta);
      const py = cy + radius * Math.sin(theta);

      const vecLen = 55;
      const erx = Math.cos(theta);
      const ery = Math.sin(theta);
      const etx = -Math.sin(theta);
      const ety = Math.cos(theta);

      p.strokeWeight(3);
      p.stroke("#b8d8ff");
      p.line(px, py, px + erx * vecLen, py + ery * vecLen);
      p.stroke("#ffb8e0");
      p.line(px, py, px + etx * vecLen, py + ety * vecLen);

      p.noStroke();
      p.fill("#4c4f6e");
      p.circle(px, py, 8);

      p.fill("#4c4f6e");
      p.textSize(13);
      p.textFont("monospace");
      p.text("e_r", px + erx * vecLen + 6, py + ery * vecLen);
      p.text("e_θ", px + etx * vecLen + 6, py + ety * vecLen);
    };
  }, container);
})();
