let nodes = [];
let layers = [5, 8, 8, 4]; // Configuration of neurons per layer
let signals = [];

function setup() {
  // Attach to the specific container
  const container = document.getElementById('canvas-container');
  const w = container.offsetWidth;
  const h = 300; // Fixed height for the visualization
  const canvas = createCanvas(w, h);
  canvas.parent('canvas-container');

  initNodes();
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  resizeCanvas(container.offsetWidth, 300);
  initNodes();
}

function initNodes() {
  nodes = [];
  signals = [];
  const layerCount = layers.length;
  // Calculate spacing to center the network
  const layerGap = width / (layerCount + 0.5);

  for (let l = 0; l < layerCount; l++) {
    const nodeCount = layers[l];
    const nodeGap = height / (nodeCount + 1);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (l * layerGap) + (layerGap / 1.2),
        y: (i + 1) * nodeGap,
        layer: l
      });
    }
  }
}

function draw() {
  clear(); // Use transparent background to blend with site theme

  // Draw connections (Synapses)
  stroke(143, 211, 255, 100); // --accent-blue with opacity
  strokeWeight(1);

  for (let i = 0; i < nodes.length; i++) {
    const n1 = nodes[i];
    // Connect to all nodes in the immediate next layer
    for (let j = 0; j < nodes.length; j++) {
      const n2 = nodes[j];
      if (n2.layer === n1.layer + 1) {
        line(n1.x, n1.y, n2.x, n2.y);

        // Randomly spawn a signal traveling this connection
        if (frameCount % 5 === 0 && random() < 0.01) {
          signals.push({
            x: n1.x,
            y: n1.y,
            targetX: n2.x,
            targetY: n2.y,
            progress: 0,
            speed: random(0.02, 0.05)
          });
        }
      }
    }
  }

  // Update and draw signals (Data Flow)
  noStroke();
  fill(255, 142, 199); // --accent-pink
  for (let i = signals.length - 1; i >= 0; i--) {
    const s = signals[i];
    s.progress += s.speed;

    // Linear interpolation for movement
    const cx = lerp(s.x, s.targetX, s.progress);
    const cy = lerp(s.y, s.targetY, s.progress);

    ellipse(cx, cy, 6, 6);

    if (s.progress >= 1) {
      signals.splice(i, 1);
    }
  }

  // Draw Neurons
  for (let n of nodes) {
    stroke(124, 115, 136); // --text-muted (approx)
    strokeWeight(1);
    fill(255);
    ellipse(n.x, n.y, 14, 14);

    // Inner core
    noStroke();
    fill(143, 211, 255); // --accent-blue
    ellipse(n.x, n.y, 8, 8);
  }
}

