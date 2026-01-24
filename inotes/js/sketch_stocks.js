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
  let color1 = color(246, 229, 252);
  let color2 = color(220, 234, 245);
  setGradient(0, 0, width, height, color1, color2);

  noStroke();
  fill(139, 90, 159);
  textSize(24);
  text("Owning a Piece of a Company 🏢", width / 2, height / 2 - 30);

  // Draw some "stocks" going up
  stroke(255, 210, 236);
  strokeWeight(4);
  noFill();
  beginShape();
  for(let x = 0; x < width; x += 20) {
    let y = height - 50 - noise(x * 0.01, frameCount * 0.01) * 100;
    vertex(x, y);
  }
  endShape();

  noStroke();
  fill(107, 78, 113);
  textSize(16);
  text("Stocks = Growth Potential", width / 2, height / 2 + 50);
}
