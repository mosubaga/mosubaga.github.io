// Gradient Boosting – Real Estate price prediction animation
let houses = [];
let curvePoints = [];
let treeCount = 0;
let phase = 0;    // 0=scatter, 1=tree growing, 2=curve, 3=predict
let phaseTimer = 0;
let predDot = null;

function setup() {
  const el = document.getElementById('re-canvas');
  const cnv = createCanvas(el.offsetWidth, 360);
  cnv.parent('re-canvas');
  frameRate(40);
  textFont('Varela Round');
  initHouses();
}

function initHouses() {
  houses = [];
  for (let i = 0; i < 55; i++) {
    const sqft = random(0.05, 0.95);
    const price = 0.15 + sqft * 0.6 + random(-0.12, 0.12);
    houses.push({ sqft, price: constrain(price, 0.05, 0.98) });
  }
  curvePoints = [];
  treeCount = 0;
  phase = 0;
  phaseTimer = 0;
  predDot = null;
}

// Map data coords [0,1] to canvas coords
function mx(v) { return 60 + v * (width - 90); }
function my(v) { return height - 40 - v * (height - 80); }

function drawAxes() {
  stroke(76, 74, 77, 55);
  strokeWeight(1.4);
  // Y axis
  line(58, 30, 58, height - 38);
  // X axis
  line(58, height - 38, width - 20, height - 38);

  // Labels
  noStroke();
  fill(127, 123, 128, 160);
  textSize(9.5);
  textAlign(CENTER, BOTTOM);
  text('Square Footage', width / 2, height - 4);
  textAlign(RIGHT, CENTER);
  push(); translate(18, height / 2); rotate(-HALF_PI); text('Price ($k)', 0, 0); pop();

  // Tick labels
  textAlign(CENTER, TOP);
  textSize(9);
  fill(127, 123, 128, 130);
  for (let i = 0; i <= 4; i++) {
    const v = i / 4;
    text(floor(500 + v * 4500), mx(v), height - 34);
  }
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= 4; i++) {
    const v = i / 4;
    text('$' + floor(100 + v * 900) + 'k', 54, my(v));
  }
}

function drawGBCurve(opacity) {
  // Smooth fitted curve (approx gradient boosted ensemble)
  noFill();
  stroke(159, 183, 184, opacity);
  strokeWeight(2.8);
  beginShape();
  for (let x = 0; x <= 1; x += 0.02) {
    const y = 0.16 + x * 0.58 + 0.03 * sin(x * TWO_PI * 1.5);
    curveVertex(mx(x), my(constrain(y, 0.02, 0.98)));
  }
  endShape();
}

function draw() {
  background(248, 248, 244);
  phaseTimer++;

  // Phase transitions
  if (phase === 0 && phaseTimer > 60)  { phase = 1; phaseTimer = 0; }
  if (phase === 1 && phaseTimer > 180) { phase = 2; phaseTimer = 0; }
  if (phase === 2 && phaseTimer > 90)  { phase = 3; phaseTimer = 0; }
  if (phase === 3 && phaseTimer > 120) { initHouses(); }

  drawAxes();

  // Scatter dots
  const dotCount = phase === 0
    ? floor(map(phaseTimer, 0, 58, 0, houses.length))
    : houses.length;

  for (let i = 0; i < dotCount; i++) {
    const h = houses[i];
    fill(159, 183, 184, 180);
    noStroke();
    ellipse(mx(h.sqft), my(h.price), 8, 8);
  }

  // Weak trees growing
  if (phase === 1) {
    const treesToShow = floor(map(phaseTimer, 0, 178, 0, 6));
    noStroke();
    fill(232, 212, 220, 80);
    for (let t = 0; t < treesToShow; t++) {
      const ox = (t - 2.5) * 0.05;
      noFill();
      stroke(232, 212, 220, 80);
      strokeWeight(1.5);
      beginShape();
      for (let x = 0; x <= 1; x += 0.04) {
        const y = 0.16 + x * 0.58 + ox + 0.04 * sin(x * PI + t);
        curveVertex(mx(x), my(constrain(y, 0.02, 0.98)));
      }
      endShape();
    }
  }

  // Ensemble curve fading in
  if (phase >= 2) {
    const op = phase === 2 ? map(phaseTimer, 0, 88, 0, 220) : 220;
    drawGBCurve(op);
  }

  // Prediction dot
  if (phase === 3) {
    if (!predDot) predDot = { sqft: 0.62, price: 0.52 };
    const alpha = map(phaseTimer, 0, 30, 0, 255);

    // Cross-hairs
    stroke(76, 74, 77, alpha * 0.35);
    strokeWeight(1);
    drawingContext.setLineDash([4, 5]);
    line(mx(predDot.sqft), my(0), mx(predDot.sqft), my(predDot.price));
    line(mx(0), my(predDot.price), mx(predDot.sqft), my(predDot.price));
    drawingContext.setLineDash([]);

    // Dot
    noStroke();
    fill(232, 180, 120, alpha);
    ellipse(mx(predDot.sqft), my(predDot.price), 14, 14);

    // Label
    fill(76, 74, 77, alpha);
    textAlign(LEFT, BOTTOM);
    textSize(11);
    text('$' + floor(0.16 + predDot.sqft * 0.58 > 0 ? (100 + (0.16 + predDot.sqft * 0.58) * 900) : 0) + 'k predicted', mx(predDot.sqft) + 10, my(predDot.price) - 6);
  }

  // Title
  noStroke();
  fill(127, 123, 128, 110);
  textAlign(RIGHT, TOP);
  textSize(10);
  const labels = ['Plotting training data…', 'Fitting weak learners…', 'Building ensemble curve…', 'Making prediction'];
  text(labels[phase] || labels[3], width - 18, 14);
}

function windowResized() {
  const el = document.getElementById('re-canvas');
  if (el) { resizeCanvas(el.offsetWidth, 360); initHouses(); }
}
