// Viola-Jones – Face Detection animation
let faces = [];
let scanY = 0;
let scanState = 0; // 0=scan, 1=show boxes, 2=pause
let stateTimer = 0;
let detectedFaces = [];

function setup() {
  const el = document.getElementById('det-canvas');
  const cnv = createCanvas(el.offsetWidth, 380);
  cnv.parent('det-canvas');
  frameRate(40);
  textFont('Varela Round');
  generateFaces();
}

function generateFaces() {
  faces = [];
  const count = 4;
  const positions = [
    { cx: 0.15, cy: 0.38 },
    { cx: 0.38, cy: 0.30 },
    { cx: 0.62, cy: 0.55 },
    { cx: 0.84, cy: 0.35 },
  ];
  for (const pos of positions) {
    const r = random(42, 54);
    faces.push({
      cx: pos.cx * width,
      cy: pos.cy * height,
      r,
      eyeOff: r * 0.28,
      detected: false,
      boxAlpha: 0,
    });
  }
  scanY = 0;
  scanState = 0;
  stateTimer = 0;
  detectedFaces = [];
}

function drawFace(f, scanLineY) {
  const withinScan = f.cy - f.r < scanLineY;
  const alpha = withinScan ? 220 : 80;

  // Head circle
  noStroke();
  fill(232, 212, 220, alpha);
  ellipse(f.cx, f.cy, f.r * 2, f.r * 2.1);

  // Eye sockets
  fill(255, 245, 242, alpha);
  ellipse(f.cx - f.eyeOff, f.cy - f.r * 0.15, f.r * 0.35, f.r * 0.22);
  ellipse(f.cx + f.eyeOff, f.cy - f.r * 0.15, f.r * 0.35, f.r * 0.22);

  // Pupils
  fill(76, 74, 77, alpha);
  ellipse(f.cx - f.eyeOff, f.cy - f.r * 0.15, f.r * 0.14, f.r * 0.14);
  ellipse(f.cx + f.eyeOff, f.cy - f.r * 0.15, f.r * 0.14, f.r * 0.14);

  // Nose
  fill(200, 180, 185, alpha);
  ellipse(f.cx, f.cy + f.r * 0.10, f.r * 0.16, f.r * 0.18);

  // Mouth arc
  noFill();
  stroke(180, 155, 160, alpha);
  strokeWeight(2);
  arc(f.cx, f.cy + f.r * 0.30, f.r * 0.6, f.r * 0.28, 0, PI);
}

function draw() {
  background(248, 248, 244);
  stateTimer++;

  const scanPx = map(scanY, 0, 1, 0, height);

  // Phase transitions
  if (scanState === 0) {
    scanY += 0.012;
    if (scanY > 1.05) { scanState = 1; stateTimer = 0; }

    // Detect faces as scan crosses them
    for (const f of faces) {
      if (!f.detected && (f.cy + f.r) / height < scanY) {
        f.detected = true;
        detectedFaces.push(f);
      }
    }
  } else if (scanState === 1 && stateTimer > 110) {
    scanState = 2; stateTimer = 0;
  } else if (scanState === 2 && stateTimer > 80) {
    generateFaces();
  }

  // Draw faces
  for (const f of faces) {
    drawFace(f, scanPx);
  }

  // Scanning line
  if (scanState === 0) {
    // Gradient stripe
    for (let dy = -22; dy < 22; dy++) {
      const a = map(abs(dy), 0, 22, 80, 0);
      stroke(159, 183, 184, a);
      strokeWeight(1);
      line(0, scanPx + dy, width, scanPx + dy);
    }
    // Bright line
    stroke(159, 183, 184, 200);
    strokeWeight(2.2);
    line(0, scanPx, width, scanPx);

    // Scanning label
    noStroke();
    fill(127, 123, 128, 150);
    textAlign(RIGHT, CENTER);
    textSize(10);
    text('Scanning…', width - 16, scanPx - 14);
  }

  // Detection bounding boxes
  for (const f of detectedFaces) {
    f.boxAlpha = min(f.boxAlpha + 8, 220);
    const bx = f.cx - f.r * 1.25;
    const by = f.cy - f.r * 1.35;
    const bw = f.r * 2.5;
    const bh = f.r * 2.7;

    // Box
    noFill();
    stroke(120, 180, 130, f.boxAlpha);
    strokeWeight(2.5);
    rect(bx, by, bw, bh, 6);

    // Corner decorators
    stroke(120, 180, 130, f.boxAlpha);
    strokeWeight(3);
    const cs = 12;
    // TL
    line(bx, by + cs, bx, by); line(bx, by, bx + cs, by);
    // TR
    line(bx + bw - cs, by, bx + bw, by); line(bx + bw, by, bx + bw, by + cs);
    // BL
    line(bx, by + bh - cs, bx, by + bh); line(bx, by + bh, bx + cs, by + bh);
    // BR
    line(bx + bw - cs, by + bh, bx + bw, by + bh); line(bx + bw, by + bh, bx + bw, by + bh - cs);

    // Label
    noStroke();
    fill(120, 180, 130, f.boxAlpha);
    textAlign(LEFT, BOTTOM);
    textSize(9.5);
    textStyle(BOLD);
    text('Face  99%', bx + 4, by - 4);
    textStyle(NORMAL);
  }

  // Counter badge
  if (detectedFaces.length > 0) {
    const badge = detectedFaces.length;
    noStroke();
    fill(159, 183, 184, 200);
    rect(14, 14, 160, 32, 16);
    fill(76, 74, 77, 220);
    textAlign(LEFT, CENTER);
    textSize(10.5);
    textStyle(BOLD);
    text('Faces detected: ' + badge, 26, 30);
    textStyle(NORMAL);
  }

  // Footer
  noStroke();
  fill(127, 123, 128, 90);
  textAlign(CENTER, BOTTOM);
  textSize(10);
  text('Viola-Jones Haar Cascade Simulation', width / 2, height - 8);
}

function windowResized() {
  const el = document.getElementById('det-canvas');
  if (el) { resizeCanvas(el.offsetWidth, 380); generateFaces(); }
}
