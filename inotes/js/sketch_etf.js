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
  let color1 = color(255, 231, 245);
  let color2 = color(220, 234, 245);
  setGradient(0, 0, width, height, color1, color2);

  noStroke();
  fill(139, 90, 159);
  textSize(24);
  text("A Basket of Different Assets 🧺", width / 2, height / 2 - 40);

  // Draw different colored squares representing the "basket"
  let colors = ['#FFD2EC', '#E9CEF2', '#DCEAF5', '#FFE7F5'];
  for(let i = 0; i < 4; i++) {
    fill(colors[i]);
    rect(100 + i*50, height/2, 40, 40, 5);
  }

  noStroke();
  fill(107, 78, 113);
  textSize(16);
  text("ETFs = Instant Diversification", width / 2, height / 2 + 70);
}
