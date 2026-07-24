// KNN – Image Recognition / MNIST digit animation
const DIGITS = [
  // 8×8 bitmaps for 0–4 (simplified)
  [ 0,1,1,1,1,1,1,0,
    1,1,0,0,0,0,1,1,
    1,1,0,0,0,0,1,1,
    1,1,0,0,0,0,1,1,
    1,1,0,0,0,0,1,1,
    1,1,0,0,0,0,1,1,
    1,1,0,0,0,0,1,1,
    0,1,1,1,1,1,1,0 ],
  [ 0,0,0,1,1,0,0,0,
    0,0,1,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,0,1,1,0,0,0,
    0,0,1,1,1,1,1,0 ],
  [ 0,1,1,1,1,1,0,0,
    1,1,0,0,0,1,1,0,
    0,0,0,0,0,1,1,0,
    0,0,0,1,1,1,0,0,
    0,0,1,1,0,0,0,0,
    0,1,1,0,0,0,0,0,
    1,1,0,0,0,0,0,0,
    1,1,1,1,1,1,1,0 ],
  [ 0,1,1,1,1,1,0,0,
    1,0,0,0,0,1,1,0,
    0,0,0,0,0,1,1,0,
    0,0,1,1,1,1,0,0,
    0,0,0,0,0,1,1,0,
    0,0,0,0,0,1,1,0,
    1,0,0,0,0,1,1,0,
    0,1,1,1,1,1,0,0 ],
  [ 0,0,0,1,1,1,0,0,
    0,0,1,1,0,1,0,0,
    0,1,1,0,0,1,0,0,
    1,1,0,0,0,1,0,0,
    1,1,1,1,1,1,1,0,
    0,0,0,0,0,1,0,0,
    0,0,0,0,0,1,0,0,
    0,0,0,0,0,1,0,0 ],
];

const NAMES = ['Zero', 'One', 'Two', 'Three', 'Four'];
let currentDigit = 0;
let scanY = 0;
let scanState = 0; // 0=scan, 1=classify, 2=pause
let stateTimer = 0;
let classified = false;
let neighbors = [];

function setup() {
  const el = document.getElementById('img-canvas');
  const cnv = createCanvas(el.offsetWidth, 360);
  cnv.parent('img-canvas');
  frameRate(40);
  textFont('Varela Round');
  pickNeighbors();
}

function pickNeighbors() {
  neighbors = [];
  const used = new Set([currentDigit]);
  while (neighbors.length < 3) {
    const n = floor(random(DIGITS.length));
    if (!used.has(n)) { used.add(n); neighbors.push(n); }
  }
}

function drawDigitGrid(bitmap, ox, oy, cellSize, alpha) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const val = bitmap[r * 8 + c];
      if (val) {
        fill(76, 74, 77, alpha);
      } else {
        fill(240, 240, 238, alpha * 0.5);
      }
      noStroke();
      rect(ox + c * cellSize, oy + r * cellSize, cellSize - 1, cellSize - 1, 2);
    }
  }
}

function draw() {
  background(248, 248, 244);
  stateTimer++;

  const mainCell = 28;
  const mainGrid = 8 * mainCell;
  const ox = 52;
  const oy = (height - mainGrid) / 2;

  // State machine
  if (scanState === 0) {
    scanY += 2.8;
    if (scanY > mainGrid) { scanState = 1; stateTimer = 0; classified = false; }
  } else if (scanState === 1 && stateTimer > 55) {
    classified = true;
    if (stateTimer > 130) { scanState = 2; stateTimer = 0; }
  } else if (scanState === 2 && stateTimer > 80) {
    currentDigit = (currentDigit + 1) % DIGITS.length;
    scanY = 0;
    scanState = 0;
    classified = false;
    stateTimer = 0;
    pickNeighbors();
  }

  // Draw main digit
  drawDigitGrid(DIGITS[currentDigit], ox, oy, mainCell, 220);

  // Grid border
  noFill();
  stroke(159, 183, 184, 100);
  strokeWeight(1.5);
  rect(ox, oy, mainGrid, mainGrid, 4);

  // Scanning line
  if (scanState === 0) {
    noStroke();
    fill(159, 183, 184, 90);
    rect(ox, oy + scanY - 10, mainGrid, 18, 3);
    stroke(159, 183, 184, 200);
    strokeWeight(2);
    line(ox, oy + scanY, ox + mainGrid, oy + scanY);
  }

  // Pixel label
  noStroke();
  fill(127, 123, 128, 130);
  textAlign(CENTER, TOP);
  textSize(9.5);
  text('8 × 8 Input', ox + mainGrid / 2, oy + mainGrid + 8);

  // Arrow →  neighbors
  const arrowX = ox + mainGrid + 28;
  const arrowAlpha = classified ? 200 : map(stateTimer, 0, 54, 0, 200);
  stroke(76, 74, 77, arrowAlpha);
  strokeWeight(1.8);
  line(ox + mainGrid + 10, height / 2, arrowX, height / 2);
  noStroke();
  fill(76, 74, 77, arrowAlpha);
  triangle(arrowX, height / 2 - 5, arrowX + 8, height / 2, arrowX, height / 2 + 5);

  // Neighbors panel
  const neighCell = 14;
  const neighGridW = 8 * neighCell;
  const panelX = arrowX + 16;
  const spacing = (height - 40) / 3;

  for (let ni = 0; ni < 3; ni++) {
    const ny = 20 + ni * spacing;
    const alpha = classified ? 220 : map(stateTimer - ni * 12, 0, 45, 0, 220);
    drawDigitGrid(DIGITS[neighbors[ni]], panelX, ny, neighCell, constrain(alpha, 0, 220));

    // Distance line
    stroke(212, 226, 226, constrain(alpha, 0, 100));
    strokeWeight(1);
    drawingContext.setLineDash([4, 5]);
    line(panelX + neighGridW + 6, ny + neighGridW / 2, width - 20, ny + neighGridW / 2);
    drawingContext.setLineDash([]);

    // Neighbor label
    noStroke();
    fill(127, 123, 128, constrain(alpha, 0, 160));
    textAlign(LEFT, CENTER);
    textSize(9);
    text('d=' + nf(random(0.18, 0.42), 1, 2), panelX + neighGridW + 10, ny + neighGridW / 2);
  }

  // K=3 nearest text
  noStroke();
  fill(127, 123, 128, 130);
  textAlign(LEFT, TOP);
  textSize(10);
  text('k=3 nearest neighbors', panelX, 6);

  // Classification result
  if (classified) {
    const a = map(stateTimer, 0, 35, 0, 1);
    fill(76, 74, 77, 230 * a);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text('→ "' + NAMES[currentDigit] + '" (' + currentDigit + ')', width / 2 + 40, height - 22);
    textStyle(NORMAL);
  }
}

function windowResized() {
  const el = document.getElementById('img-canvas');
  if (el) { resizeCanvas(el.offsetWidth, 360); }
}
