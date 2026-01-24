function setup() {
  let canvas = createCanvas(400, 200);
  canvas.parent('canvas-container');
  canvas.style('border-radius', '20px');
  textFont('Fredoka');
  textAlign(CENTER, CENTER);
  noStroke();
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
  let color1 = color(255, 231, 245); // Light Pink
  let color2 = color(246, 229, 252); // Light Purple
  setGradient(0, 0, width, height, color1, color2);

  noStroke();
  fill(139, 90, 159);
  textSize(24);
  text("Start Early, Grow Big! 🌱", width / 2, height / 2 - 20);

  let size = map(sin(frameCount * 0.05), -1, 1, 40, 60);
  fill(255, 210, 236);
  ellipse(width / 2, height / 2 + 40, size, size);
  fill(107, 78, 113);
  textSize(16);
  text("Your Future Self Will Thank You", width / 2, height / 2 + 40);
}
