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
  let color2 = color(246, 229, 252);
  setGradient(0, 0, width, height, color1, color2);

  noStroke();
  fill(139, 90, 159);
  textSize(24);
  text("Lending Money, Getting Interest 🏦", width / 2, height / 2 - 30);

  // Steady line for bonds
  stroke(107, 78, 113);
  strokeWeight(3);
  line(50, height/2 + 20, 350, height/2 + 20);

  noStroke();
  fill(107, 78, 113);
  textSize(16);
  text("Bonds = Stability", width / 2, height / 2 + 60);
}
