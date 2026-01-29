(() => {
  const container = document.getElementById("sketch-naivebayes");
  if (!container || typeof p5 === "undefined") {
    return;
  }

  new p5((p) => {
    let w = 0;
    const h = 240;
    let t = 0;

    const classes = [
      { label: "Spam", color: "#ffb8e0" },
      { label: "Not", color: "#b9f3d5" }
    ];

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
      const centerX = w * 0.5;
      const baseY = h * 0.75;
      const offsets = [-90, 90];

      classes.forEach((cls, idx) => {
        const x = centerX + offsets[idx];
        p.noStroke();
        p.fill(cls.color);
        p.circle(x, baseY, 50);

        p.fill("#4c4f6e");
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        p.text(cls.label, x, baseY);
      });

      const features = ["free", "meeting", "urgent", "offer"];
      features.forEach((word, i) => {
        const x = w * (0.2 + 0.2 * i);
        const y = h * 0.25 + 10 * Math.sin(t + i * 0.7);

        p.noStroke();
        p.fill("#b8d8ff");
        p.roundedRect(x - 22, y - 12, 44, 24, 8);

        p.fill("#4c4f6e");
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(10);
        p.text(word, x, y);

        classes.forEach((_, idx) => {
          const targetX = centerX + offsets[idx];
          const targetY = baseY - 30;
          p.stroke("rgba(76, 79, 110, 0.4)");
          p.strokeWeight(1.2);
          const midX = (x + targetX) / 2;
          const midY = (y + targetY) / 2 - 20 * Math.sin(t + i + idx);
          p.noFill();
          p.beginShape();
          p.vertex(x, y + 10);
          p.quadraticVertex(midX, midY, targetX, targetY);
          p.endShape();
        });
      });

      t += 0.02;
    };
  }, container);
})();
