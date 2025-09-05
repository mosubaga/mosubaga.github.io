let functions = [];
let colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
let colorIndex = 0;
let zoom = 50;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');

    // Add initial function
    addFunction('sin(x)', false);
}

function draw() {
    background(255);
    translate(width / 2 + offsetX, height / 2 + offsetY);

    // Draw grid
    drawGrid();

    // Draw axes
    drawAxes();

    // Draw functions
    drawFunctions();

    // Draw axis labels
    drawLabels();
}

function drawGrid() {
    stroke(230);
    strokeWeight(1);

    let gridSpacing = zoom;
    if (gridSpacing < 20) gridSpacing *= 2;
    if (gridSpacing < 20) gridSpacing *= 2;
    if (gridSpacing < 20) gridSpacing *= 2;

    // Vertical grid lines
    for (let x = -width; x < width; x += gridSpacing) {
        line(x, -height, x, height);
    }

    // Horizontal grid lines
    for (let y = -height; y < height; y += gridSpacing) {
        line(-width, y, width, y);
    }
}

function drawAxes() {
    stroke(100);
    strokeWeight(2);

    // X-axis
    line(-width, 0, width, 0);
    // Y-axis
    line(0, -height, 0, height);

    // Axis arrows
    strokeWeight(1);
    // X-axis arrow
    line(width / 2 - 10, -5, width / 2, 0);
    line(width / 2 - 10, 5, width / 2, 0);
    // Y-axis arrow
    line(-5, -height / 2 + 10, 0, -height / 2);
    line(5, -height / 2 + 10, 0, -height / 2);
}

function drawLabels() {
    fill(100);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);

    let step = zoom;
    while (step < 30) step *= 2;

    // X-axis labels
    for (let x = -width / 2; x <= width / 2; x += step) {
        if (abs(x) > 10) {
            let worldX = (x / zoom).toFixed(1);
            text(worldX, x, 15);
        }
    }

    // Y-axis labels
    for (let y = -height / 2; y <= height / 2; y += step) {
        if (abs(y) > 10) {
            let worldY = (-y / zoom).toFixed(1);
            text(worldY, -25, y);
        }
    }

    // Origin
    text('0', -10, 15);
}

function drawFunctions() {
    for (let i = 0; i < functions.length; i++) {
        if (!functions[i].visible) continue;

        stroke(functions[i].color);
        strokeWeight(2);
        noFill();

        beginShape();
        let hasPoints = false;

        for (let screenX = -width / 2; screenX <= width / 2; screenX += 1) {
            let x = screenX / zoom;
            let y;

            try {
                y = evaluateFunction(functions[i].expression, x);
                if (!isNaN(y) && isFinite(y)) {
                    let screenY = -y * zoom;
                    if (abs(screenY) < height) {
                        vertex(screenX, screenY);
                        hasPoints = true;
                    }
                }
            } catch (e) {
                // Skip invalid points
            }
        }

        if (hasPoints) {
            endShape();
        }
    }
}

function evaluateFunction(expression, x) {
    // Replace mathematical functions and operators
    let code = expression
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/exp/g, 'Math.exp')
        .replace(/pow/g, 'Math.pow')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/x/g, `(${x})`);

    return Function('"use strict"; return (' + code + ')')();
}

function addFunction(expr = null, updateInput = true) {
    let expression = expr || document.getElementById('function-input').value.trim();
    if (!expression) return;

    functions.push({
        expression: expression,
        color: colors[colorIndex % colors.length],
        visible: true,
        id: Date.now()
    });

    colorIndex++;
    updateFunctionList();

    if (updateInput) {
        document.getElementById('function-input').value = '';
    }
}

function updateFunctionList() {
    let list = document.getElementById('function-list');
    list.innerHTML = '';

    functions.forEach((func, index) => {
        let item = document.createElement('div');
        item.className = 'function-item';
        item.style.backgroundColor = func.visible ? func.color + '40' : '#ddd';
        item.style.borderColor = func.color;
        item.textContent = func.expression;
        item.onclick = () => toggleFunction(index);
        list.appendChild(item);
    });
}

function toggleFunction(index) {
    functions[index].visible = !functions[index].visible;
    updateFunctionList();
}

function clearFunctions() {
    functions = [];
    updateFunctionList();
}

function resetView() {
    offsetX = 0;
    offsetY = 0;
    zoom = 50;
    document.getElementById('zoom-slider').value = zoom;
}

function updateZoom() {
    zoom = parseInt(document.getElementById('zoom-slider').value);
}

function mousePressed() {
    isDragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
}

function mouseDragged() {
    if (isDragging) {
        offsetX += mouseX - lastMouseX;
        offsetY += mouseY - lastMouseY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
}

function mouseReleased() {
    isDragging = false;
}

function mouseWheel(event) {
    zoom += event.delta * -0.5;
    zoom = constrain(zoom, 10, 200);
    document.getElementById('zoom-slider').value = zoom;
    return false;
}

// Allow Enter key to add function
document.getElementById('function-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addFunction();
    }
});