function setup() {
  let canvas = createCanvas(400, 200);
  canvas.parent('canvas-container');
  canvas.style('border-radius', '20px');
  textFont('Fredoka');
  textAlign(CENTER, CENTER);
}

function setGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function draw() {
  let color1 = color(220, 234, 245);
  let color2 = color(255, 231, 245);
  setGradient(0, 0, width, height, color1, color2);

  noStroke();
  fill(139, 90, 159);
  textSize(24);
  text("Your Financial Mix 🧩", width / 2, height / 2 - 40);

  // Pie chart representation
  noStroke();
  fill(255, 210, 236);
  arc(width/2, height/2 + 20, 80, 80, 0, PI + QUARTER_PI);
  fill(233, 206, 242);
  arc(width/2, height/2 + 20, 80, 80, PI + QUARTER_PI, TWO_PI);

  fill(107, 78, 113);
  textSize(16);
  text("Portfolio = Balanced Strategy", width / 2, height / 2 + 75);
}
