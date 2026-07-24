// Random Forest – Customer Churn Prediction animation
let customers = [];
let trees = [];
let phase = 0;
let phaseTimer = 0;
let votes = [];
let finalResult = null;

const N_TREES = 5;

function setup() {
  const el = document.getElementById('churn-canvas');
  const cnv = createCanvas(el.offsetWidth, 360);
  cnv.parent('churn-canvas');
  frameRate(40);
  textFont('Varela Round');
  initScene();
}

function initScene() {
  customers = [];
  const centerX = width * 0.12;
  for (let i = 0; i < 6; i++) {
    customers.push({
      x: centerX + random(-18, 18),
      y: 60 + i * 46,
      churn: i < 2,
      classified: false,
      alpha: 0,
    });
  }

  trees = [];
  const spacing = (width * 0.7) / (N_TREES + 1);
  for (let t = 0; t < N_TREES; t++) {
    trees.push({
      x: width * 0.27 + spacing * t,
      y: height / 2,
      vote: random() > 0.55 ? 'Churn' : 'Stay',
      alpha: 0,
      grow: 0,
    });
  }

  phase = 0;
  phaseTimer = 0;
  votes = [];
  finalResult = null;
}

function drawTree(tx, ty, grow, alpha) {
  const h = 70 * grow;
  // Trunk
  stroke(159, 183, 184, alpha);
  strokeWeight(3);
  line(tx, ty + 10, tx, ty + 10 - h * 0.45);

  // Branches
  strokeWeight(2);
  line(tx, ty + 10 - h * 0.3, tx - h * 0.25, ty + 10 - h * 0.62);
  line(tx, ty + 10 - h * 0.3, tx + h * 0.25, ty + 10 - h * 0.62);

  // Foliage blobs
  noStroke();
  fill(212, 226, 226, alpha * 0.7);
  ellipse(tx, ty + 10 - h * 0.8, h * 0.55, h * 0.48);
  ellipse(tx - h * 0.24, ty + 10 - h * 0.7, h * 0.38, h * 0.34);
  ellipse(tx + h * 0.24, ty + 10 - h * 0.7, h * 0.38, h * 0.34);
}

function drawPersonIcon(px, py, churned, alpha) {
  const col = churned ? color(220, 120, 120, alpha) : color(159, 183, 184, alpha);
  noStroke();

  // Head
  fill(col);
  ellipse(px, py - 12, 18, 18);

  // Body
  fill(col);
  beginShape();
  vertex(px - 10, py + 2);
  vertex(px + 10, py + 2);
  vertex(px + 8, py + 22);
  vertex(px - 8, py + 22);
  endShape(CLOSE);
}

function draw() {
  background(248, 248, 244);
  phaseTimer++;

  // Phase machine
  if (phase === 0 && phaseTimer > 35) { phase = 1; phaseTimer = 0; }
  if (phase === 1 && phaseTimer > 160) { phase = 2; phaseTimer = 0; }
  if (phase === 2 && phaseTimer > 80)  { phase = 3; phaseTimer = 0; }
  if (phase === 3 && phaseTimer > 120) { initScene(); }

  // Ramp customer alpha
  for (const c of customers) {
    if (phase >= 0) c.alpha = min(c.alpha + 5, 220);
  }

  // Grow trees
  for (let i = 0; i < N_TREES; i++) {
    const t = trees[i];
    if (phase >= 1) {
      const delay = i * 20;
      t.grow = constrain(map(phaseTimer - delay, 0, 50, 0, 1), 0, 1);
      t.alpha = constrain(map(phaseTimer - delay, 0, 50, 0, 220), 0, 220);
    }
  }

  // Arrow from customers to trees
  if (phase >= 1) {
    stroke(76, 74, 77, 30);
    strokeWeight(1.5);
    drawingContext.setLineDash([5, 6]);
    for (const c of customers) {
      for (const t of trees) {
        line(c.x + 14, c.y + 5, t.x - 26, t.y);
      }
    }
    drawingContext.setLineDash([]);
  }

  // Draw trees
  for (const t of trees) {
    drawTree(t.x, t.y, t.grow, t.alpha);
  }

  // Draw tree votes
  if (phase >= 2) {
    for (let i = 0; i < N_TREES; i++) {
      const t = trees[i];
      const vAlpha = map(phaseTimer, 0, 40, 0, 220);
      const col = t.vote === 'Churn' ? color(220, 120, 120, vAlpha) : color(120, 180, 130, vAlpha);
      noStroke();
      fill(col);
      textAlign(CENTER, CENTER);
      textSize(10);
      textStyle(BOLD);
      text(t.vote, t.x, t.y + 52);
      textStyle(NORMAL);
    }
  }

  // Draw customers
  for (const c of customers) {
    drawPersonIcon(c.x, c.y, c.churn, c.alpha);
  }

  // Customer panel label
  noStroke();
  fill(127, 123, 128, 150);
  textAlign(CENTER, BOTTOM);
  textSize(9.5);
  text('Customers', width * 0.12, height - 12);

  // Trees label
  noStroke();
  fill(127, 123, 128, 150);
  textSize(9.5);
  textAlign(CENTER, BOTTOM);
  text('Random Forest (5 trees)', width * 0.60, height - 12);

  // Final verdict
  if (phase >= 3) {
    const churnVotes = trees.filter(t => t.vote === 'Churn').length;
    const verdict = churnVotes > N_TREES / 2 ? 'HIGH CHURN RISK' : 'LIKELY TO STAY';
    const vCol = churnVotes > N_TREES / 2 ? color(220, 100, 100) : color(100, 180, 130);
    const a = map(phaseTimer, 0, 30, 0, 255);

    // Box
    fill(red(vCol), green(vCol), blue(vCol), a * 0.15);
    stroke(red(vCol), green(vCol), blue(vCol), a * 0.5);
    strokeWeight(2);
    rect(width - 160, height / 2 - 36, 148, 64, 14);

    noStroke();
    fill(red(vCol), green(vCol), blue(vCol), a);
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(BOLD);
    text(verdict, width - 86, height / 2 - 10);
    textStyle(NORMAL);
    textSize(10);
    fill(127, 123, 128, a);
    text(churnVotes + '/' + N_TREES + ' trees voted churn', width - 86, height / 2 + 12);

    fill(127, 123, 128, min(a, 150));
    textSize(9.5);
    text('Majority Vote', width - 86, height / 2 - 26);
  }

  // Connector arrow to result
  if (phase >= 2) {
    const aAlpha = map(phaseTimer, 0, 30, 0, 100);
    stroke(76, 74, 77, aAlpha);
    strokeWeight(1.8);
    drawingContext.setLineDash([]);
    line(width * 0.83 + 4, height / 2, width - 164, height / 2);
    noStroke();
    fill(76, 74, 77, aAlpha);
    triangle(width - 164, height / 2 - 5, width - 156, height / 2, width - 164, height / 2 + 5);
  }
}

function windowResized() {
  const el = document.getElementById('churn-canvas');
  if (el) { resizeCanvas(el.offsetWidth, 360); initScene(); }
}
