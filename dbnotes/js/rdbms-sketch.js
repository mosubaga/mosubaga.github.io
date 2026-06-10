/* ============================================================
   DB Notes — p5.js artwork for the home page
   A small animated illustration of a relational database:
   three tables (customers, orders, products) joined by keys,
   with query "packets" travelling along the relationships.
   Purely decorative — no real database involved.
   ============================================================ */

var rdbmsSketch = function (p) {
  var holder;
  var packets = [];

  // Read a CSS variable so the artwork follows light/dark mode
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function canvasSize() {
    var w = holder ? holder.clientWidth : 800;
    var h = Math.max(240, Math.min(340, w * 0.42));
    return { w: w, h: h };
  }

  p.setup = function () {
    holder = document.getElementById("rdbms-art");
    var s = canvasSize();
    var c = p.createCanvas(s.w, s.h);
    c.parent("rdbms-art");

    // Packets travel along edge 0 (customers→orders) or 1 (products→orders)
    for (var i = 0; i < 6; i++) {
      packets.push({ edge: i % 2, t: i / 6, speed: 0.0025 + 0.0015 * (i % 3) });
    }
  };

  p.windowResized = function () {
    var s = canvasSize();
    p.resizeCanvas(s.w, s.h);
  };

  // A table card: header bar + field rows, first field is the key
  function drawTable(x, y, w, title, fields, headerCol, ink, line, surface) {
    var rowH = 22;
    var headH = 26;
    var h = headH + fields.length * rowH;

    p.noStroke();
    p.fill(surface);
    p.stroke(line);
    p.strokeWeight(1);
    p.rect(x, y, w, h, 10);

    p.noStroke();
    p.fill(headerCol);
    p.rect(x, y, w, headH, 10, 10, 0, 0);

    p.fill(255);
    p.textStyle(p.BOLD);
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(title, x + 10, y + headH / 2);

    p.textStyle(p.NORMAL);
    p.textSize(11);
    for (var i = 0; i < fields.length; i++) {
      var fy = y + headH + i * rowH;
      if (i > 0) {
        p.stroke(line);
        p.strokeWeight(1);
        p.line(x + 6, fy, x + w - 6, fy);
      }
      p.noStroke();
      // Key fields get a small accent dot
      p.fill(i === 0 ? headerCol : line);
      p.circle(x + 12, fy + rowH / 2, 5);
      p.fill(ink);
      p.text(fields[i], x + 22, fy + rowH / 2);
    }

    return h;
  }

  p.draw = function () {
    var bg = cssVar("--primary", "#F8E8E8");
    var line = cssVar("--line-strong", "#DCC4CC");
    var ink = cssVar("--ink-soft", "#6B5560");
    var accent = cssVar("--accent", "#C25D7B");
    var mysqlCol = cssVar("--mysql", "#4A7BA6");
    var pgCol = cssVar("--pg", "#8A6FAE");

    p.background(bg);

    var w = p.width;
    var h = p.height;
    var tw = Math.min(170, w * 0.26);
    var bob = Math.sin(p.frameCount * 0.02) * 3;

    // Table positions: customers (left), orders (centre), products (right)
    var cust = { x: w * 0.06, y: h * 0.16 + bob };
    var ord = { x: w * 0.5 - tw / 2, y: h * 0.42 - bob };
    var prod = { x: w * 0.94 - tw, y: h * 0.16 + bob };

    // Relationship lines (drawn first, under the tables)
    var a = { x: cust.x + tw, y: cust.y + 38 };
    var b = { x: ord.x, y: ord.y + 60 };
    var c2 = { x: prod.x, y: prod.y + 38 };
    var d = { x: ord.x + tw, y: ord.y + 82 };

    p.noFill();
    p.strokeWeight(2);
    p.stroke(mysqlCol);
    p.bezier(a.x, a.y, a.x + 50, a.y, b.x - 50, b.y, b.x, b.y);
    p.stroke(pgCol);
    p.bezier(c2.x, c2.y, c2.x - 50, c2.y, d.x + 50, d.y, d.x, d.y);

    // Query packets travelling along the relationships
    p.noStroke();
    for (var i = 0; i < packets.length; i++) {
      var k = packets[i];
      k.t += k.speed;
      if (k.t > 1) k.t = 0;
      var px, py;
      if (k.edge === 0) {
        px = p.bezierPoint(a.x, a.x + 50, b.x - 50, b.x, k.t);
        py = p.bezierPoint(a.y, a.y, b.y, b.y, k.t);
      } else {
        px = p.bezierPoint(c2.x, c2.x - 50, d.x + 50, d.x, k.t);
        py = p.bezierPoint(c2.y, c2.y, d.y, d.y, k.t);
      }
      p.fill(accent);
      p.circle(px, py, 7);
    }

    // Tables
    drawTable(cust.x, cust.y, tw, "customers", ["id  (PK)", "name", "email"], mysqlCol, ink, line, bg);
    drawTable(ord.x, ord.y, tw, "orders", ["id  (PK)", "customer_id (FK)", "product_id (FK)"], accent, ink, line, bg);
    drawTable(prod.x, prod.y, tw, "products", ["id  (PK)", "name", "price"], pgCol, ink, line, bg);

    // Caption inside the canvas
    p.noStroke();
    p.fill(ink);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(11);
    p.text("tables · keys · relationships", w / 2, h - 8);
  };
};

new p5(rdbmsSketch);
