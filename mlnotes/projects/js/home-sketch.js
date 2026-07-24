// ML Pipeline animation – home page
let particles = [];
let tick = 0;

const STAGES = [
  { rel: 0.10, label: 'Raw Data',   sub: 'CSV / Database', sym: '⬡', r: [212,226,226] },
  { rel: 0.35, label: 'Features',   sub: 'Preprocessing',  sym: '≋', r: [232,212,220] },
  { rel: 0.62, label: 'Model',      sub: 'scikit-learn',   sym: '◈', r: [212,226,226] },
  { rel: 0.88, label: 'Prediction', sub: 'Output',         sym: '✓', r: [212,232,208] },
];

function getStages() {
  return STAGES.map(s => ({ ...s, x: width * s.rel, y: height / 2 }));
}

function setup() {
  const el = document.getElementById('home-canvas');
  const cnv = createCanvas(el.offsetWidth, 340);
  cnv.parent('home-canvas');
  frameRate(45);
  textFont('Varela Round');
}

function draw() {
  background(248, 248, 244);
  tick++;
  const stages = getStages();
  const cy = height / 2;

  // Dashed connector lines
  strokeWeight(1.8);
  drawingContext.setLineDash([6, 7]);
  for (let i = 0; i < stages.length - 1; i++) {
    const a = stages[i], b = stages[i + 1];
    stroke(76, 74, 77, 28);
    line(a.x + 56, cy, b.x - 56, cy);
  }
  drawingContext.setLineDash([]);

  // Chevron arrows mid-connector
  noStroke();
  fill(76, 74, 77, 55);
  textAlign(CENTER, CENTER);
  textSize(16);
  for (let i = 0; i < stages.length - 1; i++) {
    const mx = (stages[i].x + stages[i + 1].x) / 2;
    text('›', mx, cy);
  }

  // Stage boxes
  rectMode(CENTER);
  for (const s of stages) {
    // Soft shadow
    noStroke();
    fill(76, 74, 77, 10);
    rect(s.x + 2, cy + 4, 108, 78, 18);

    // Box fill
    fill(...s.r, 205);
    stroke(76, 74, 77, 36);
    strokeWeight(1.4);
    rect(s.x, cy, 108, 78, 18);

    // Symbol
    noStroke();
    fill(76, 74, 77, 185);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(s.sym, s.x, cy - 11);

    // Label
    textSize(11);
    fill(76, 74, 77, 215);
    text(s.label, s.x, cy + 7);

    // Sub-label
    textSize(9);
    fill(127, 123, 128, 155);
    text(s.sub, s.x, cy + 20);
  }

  // Spawn particle every 22 frames
  if (tick % 22 === 0) {
    const col = color(
      random([212, 232, 220]),
      random([212, 226, 232]),
      random([212, 226, 220]),
      200
    );
    particles.push({ x: stages[0].x, y: cy + random(-14, 14), si: 0, sp: random(2.6, 4.0), r: random(5, 9), c: col });
  }

  // Update & draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.si >= stages.length) { particles.splice(i, 1); continue; }
    const tx = stages[p.si].x;
    const dx = tx - p.x;
    const d = abs(dx);

    if (d < 54) {
      p.si++;
      if (p.si >= stages.length) { particles.splice(i, 1); continue; }
    }
    p.x += (dx / (d + 0.1)) * p.sp;

    // Glow halo
    noStroke();
    fill(red(p.c), green(p.c), blue(p.c), 45);
    ellipse(p.x, p.y, p.r * 3.8);
    fill(p.c);
    ellipse(p.x, p.y, p.r);
  }

  // Footer label
  noStroke();
  fill(127, 123, 128, 90);
  textAlign(CENTER, BOTTOM);
  textSize(10);
  text('Live ML Pipeline Simulation', width / 2, height - 12);
}

function windowResized() {
  const el = document.getElementById('home-canvas');
  if (el) { resizeCanvas(el.offsetWidth, 340); particles = []; }
}
