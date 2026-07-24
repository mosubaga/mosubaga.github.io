// Logistic Regression – Fraud Detection animation
let legit = [], fraud = [];
let boundaryX = -0.1;  // decision boundary sweeps right
let phase = 0;         // 0=show dots, 1=draw boundary, 2=new transaction, 3=reset
let phaseTimer = 0;
let newTx = null;

function setup() {
  const el = document.getElementById('fraud-canvas');
  const cnv = createCanvas(el.offsetWidth, 360);
  cnv.parent('fraud-canvas');
  frameRate(40);
  textFont('Varela Round');
  generateData();
}

function generateData() {
  legit = [];
  fraud = [];
  for (let i = 0; i < 60; i++) {
    legit.push({ x: random(0.05, 0.52), y: random(0.1, 0.9) });
  }
  for (let i = 0; i < 28; i++) {
    fraud.push({ x: random(0.48, 0.95), y: random(0.1, 0.9) });
  }
  boundaryX = -0.1;
  phase = 0;
  phaseTimer = 0;
  newTx = null;
}

function px(v) { return 48 + v * (width - 68); }
function py(v) { return height - 36 - v * (height - 70); }

function drawAxes() {
  stroke(76, 74, 77, 45);
  strokeWeight(1.3);
  line(46, 28, 46, height - 34);
  line(46, height - 34, width - 12, height - 34);
  noStroke();
  fill(127, 123, 128, 145);
  textSize(9.5);
  textAlign(CENTER, BOTTOM);
  text('Transaction Risk Score', width / 2, height - 2);
  push(); translate(14, height / 2); rotate(-HALF_PI);
  textAlign(CENTER, CENTER);
  text('Transaction Amount', 0, 0);
  pop();
}

function drawLegend() {
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(10);

  fill(159, 183, 184, 200); ellipse(width - 110, 22, 10); fill(76, 74, 77, 160); text('Legitimate', width - 102, 22);
  fill(232, 150, 150, 200); ellipse(width - 110, 38, 10); fill(76, 74, 77, 160); text('Fraudulent', width - 102, 38);
}

function draw() {
  background(248, 248, 244);
  phaseTimer++;

  if (phase === 0 && phaseTimer > 55)  { phase = 1; phaseTimer = 0; }
  if (phase === 1 && boundaryX > 1.1)  { phase = 2; phaseTimer = 0; }
  if (phase === 2 && phaseTimer > 100) { phase = 3; phaseTimer = 0; }
  if (phase === 3 && phaseTimer > 50)  { generateData(); }

  drawAxes();
  drawLegend();

  const legitCount  = phase === 0 ? floor(map(phaseTimer, 0, 52, 0, legit.length)) : legit.length;
  const fraudCount  = phase === 0 ? floor(map(phaseTimer, 0, 52, 0, fraud.length)) : fraud.length;

  // Gradient background zones (once boundary visible)
  if (phase >= 1) {
    const bx = px(constrain(boundaryX, 0, 1));
    noStroke();
    fill(212, 226, 226, 35);
    rect(48, 28, bx - 48, height - 62);
    fill(232, 212, 220, 35);
    rect(bx, 28, width - bx - 12, height - 62);
  }

  // Legitimate dots
  for (let i = 0; i < legitCount; i++) {
    const d = legit[i];
    noStroke();
    fill(159, 183, 184, 190);
    ellipse(px(d.x), py(d.y), 9, 9);
  }

  // Fraud dots
  for (let i = 0; i < fraudCount; i++) {
    const d = fraud[i];
    noStroke();
    fill(220, 120, 120, 190);
    ellipse(px(d.x), py(d.y), 9, 9);
  }

  // Animated decision boundary
  if (phase >= 1 && boundaryX < 1.1) {
    boundaryX += 0.016;
    const bx = px(constrain(boundaryX, 0, 1));
    stroke(76, 74, 77, 180);
    strokeWeight(2.5);
    drawingContext.setLineDash([]);
    line(bx, 28, bx, height - 34);

    // Label
    noStroke();
    fill(76, 74, 77, 160);
    textAlign(CENTER, TOP);
    textSize(9.5);
    text('Decision\nBoundary', bx, 30);
  }

  // New transaction appearing
  if (phase === 2) {
    if (!newTx) newTx = { x: 0.72, y: 0.60 };
    const alpha = map(phaseTimer, 0, 25, 0, 255);
    const label = newTx.x > 0.5 ? 'FRAUD' : 'Legitimate';
    const col = newTx.x > 0.5 ? color(220, 80, 80, alpha) : color(120, 180, 180, alpha);

    noStroke();
    fill(red(col), green(col), blue(col), alpha * 0.35);
    ellipse(px(newTx.x), py(newTx.y), 28);
    fill(col);
    ellipse(px(newTx.x), py(newTx.y), 13);

    fill(76, 74, 77, alpha);
    textAlign(LEFT, CENTER);
    textSize(11);
    textStyle(BOLD);
    text('→ ' + label, px(newTx.x) + 14, py(newTx.y));
    textStyle(NORMAL);
  }

  // Status label
  noStroke();
  fill(127, 123, 128, 105);
  textAlign(LEFT, TOP);
  textSize(10);
  const labels = ['Loading transactions…', 'Drawing decision boundary…', 'New transaction detected!', ''];
  text(labels[phase] || '', 52, 14);
}

function windowResized() {
  const el = document.getElementById('fraud-canvas');
  if (el) { resizeCanvas(el.offsetWidth, 360); generateData(); }
}
