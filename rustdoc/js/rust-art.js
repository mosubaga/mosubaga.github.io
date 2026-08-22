/* =====================================================================
   rust-art.js — "The Ownership Flow"
   A generative p5.js piece that visualises how Rust actually moves data
   around: every value has exactly one owner, borrows radiate out of that
   owner (many shared, or one exclusive mutable), values move between
   scopes, and each one is dropped when its scope ends.

   Written in p5 instance mode so it never touches the global namespace.
   Mounted into #rust-art-canvas by index.html.
   ===================================================================== */

(function () {
    "use strict";

    var MOUNT_ID = "rust-art-canvas";

    // Palette, kept in step with css/style.css.
    var PALETTE = {
        paper: "#ffffff",
        wash: "#f7faf0",
        ink: "#322c20",
        muted: "#5f6a4c",
        faint: "#c9d6b4",
        sage: "#5f8f3e",
        sageSoft: "#a9cd88",
        ember: "#c05f2c",
        emberSoft: "#e6a681",
        gold: "#b4791c",
        slate: "#3f7a9c"
    };

    // Scope names shown under each node, borrowed from a plausible program.
    var SCOPE_NAMES = ["main", "parse", "render", "worker", "cache", "encode", "collect"];

    // Values that get allocated, moved, borrowed and dropped.
    var VALUE_NAMES = ["buf", "cfg", "conn", "img", "rows", "msg", "tree"];

    var sketch = function (p) {
        var mount;
        var nodes = [];
        var values = [];
        var effects = [];
        var status = { text: "", kind: "idle", until: 0 };

        var W = 900;
        var H = 420;
        var cx = 0;
        var cy = 0;
        var radius = 0;
        var nextEventAt = 0;
        var reducedMotion = false;
        var paused = false;
        var t0 = 0;

        /* --------------------------------------------------------------
           Setup & layout
           -------------------------------------------------------------- */

        function measure() {
            var width = mount ? mount.clientWidth : 900;
            W = Math.max(300, width);
            // Shorter, wider band on desktop; taller on narrow screens so
            // the lattice does not get squashed on an iPad in portrait.
            var ratio = W < 620 ? 0.82 : W < 900 ? 0.62 : 0.5;
            H = Math.round(Math.max(280, Math.min(520, W * ratio)));
            cx = W / 2;
            cy = H / 2 - (W < 620 ? 6 : 10);
            radius = Math.min(W, H) * (W < 620 ? 0.33 : 0.36);
        }

        function buildScene() {
            nodes = [];
            values = [];
            effects = [];

            var count = W < 620 ? 5 : 7;
            for (var i = 0; i < count; i++) {
                var angle = (p.TWO_PI * i) / count - p.HALF_PI;
                nodes.push({
                    name: SCOPE_NAMES[i % SCOPE_NAMES.length],
                    angle: angle,
                    // A little radial jitter keeps the ring from looking mechanical.
                    r: radius * p.random(0.9, 1.06),
                    pulse: 0,
                    ghost: 0
                });
            }

            var valueCount = W < 620 ? 2 : 3;
            for (var v = 0; v < valueCount; v++) {
                values.push({
                    name: VALUE_NAMES[v % VALUE_NAMES.length],
                    owner: (v * 2) % nodes.length,
                    tint: [PALETTE.sage, PALETTE.ember, PALETTE.slate][v % 3],
                    // Travel animation state for a move.
                    moving: null,
                    alpha: 1,
                    spin: p.random(p.TWO_PI)
                });
            }

            nextEventAt = 900;
            setStatus("// borrow checker: ready", "idle", 2200);
        }

        function nodePos(node) {
            // Slow global drift so the whole lattice breathes.
            var drift = reducedMotion ? 0 : p.millis() * 0.00006;
            var a = node.angle + drift;
            return { x: cx + Math.cos(a) * node.r, y: cy + Math.sin(a) * node.r * 0.82 };
        }

        function setStatus(text, kind, ms) {
            status.text = text;
            status.kind = kind;
            status.until = p.millis() + (ms || 2000);
        }

        /* --------------------------------------------------------------
           Events — the story the piece tells
           -------------------------------------------------------------- */

        function scheduleEvent() {
            var value = p.random(values.filter(function (v) { return !v.moving && v.alpha > 0.9; }));
            if (!value) {
                nextEventAt = p.millis() + 600;
                return;
            }

            var roll = p.random();
            if (roll < 0.34) {
                startMove(value);
            } else if (roll < 0.68) {
                startSharedBorrows(value);
            } else if (roll < 0.88) {
                startMutableBorrow(value);
            } else {
                startDrop(value);
            }

            nextEventAt = p.millis() + p.random(1500, 2400);
        }

        function startMove(value) {
            var target = p.floor(p.random(nodes.length));
            if (target === value.owner) target = (target + 1) % nodes.length;

            value.moving = { from: value.owner, to: target, start: p.millis(), dur: 1100 };
            nodes[value.owner].ghost = 1;
            setStatus("let " + nodes[target].name + "_" + value.name + " = " + value.name +
                ";   // value moved — old binding is dead", "move", 2400);
        }

        function startSharedBorrows(value) {
            var readers = [];
            var wanted = p.floor(p.random(2, 4));
            for (var i = 0; i < nodes.length && readers.length < wanted; i++) {
                var idx = p.floor(p.random(nodes.length));
                if (idx !== value.owner && readers.indexOf(idx) === -1) readers.push(idx);
            }
            effects.push({
                type: "shared",
                value: value,
                targets: readers,
                start: p.millis(),
                dur: 1900
            });
            setStatus("let r = &" + value.name + ";   // " + readers.length +
                " shared borrows may coexist", "shared", 2100);
        }

        function startMutableBorrow(value) {
            var target = p.floor(p.random(nodes.length));
            if (target === value.owner) target = (target + 1) % nodes.length;
            effects.push({
                type: "mut",
                value: value,
                targets: [target],
                start: p.millis(),
                dur: 1700
            });
            setStatus("let m = &mut " + value.name +
                ";   // exclusive — no other borrow allowed", "mut", 2000);
        }

        function startDrop(value) {
            effects.push({ type: "drop", value: value, start: p.millis(), dur: 1400 });
            setStatus("}   // scope ends: drop(" + value.name + ") frees the allocation", "drop", 2200);
        }

        /* --------------------------------------------------------------
           Drawing helpers
           -------------------------------------------------------------- */

        function hexagon(x, y, r, rotation) {
            p.push();
            p.translate(x, y);
            p.rotate(rotation || 0);
            p.beginShape();
            for (var i = 0; i < 6; i++) {
                var a = (p.TWO_PI * i) / 6 - p.HALF_PI;
                p.vertex(Math.cos(a) * r, Math.sin(a) * r);
            }
            p.endShape(p.CLOSE);
            p.pop();
        }

        function easeInOut(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        // A curved connector that bows away from the centre, so lines
        // between neighbouring nodes never overlap the node bodies.
        function arcBetween(a, b, bow) {
            var mx = (a.x + b.x) / 2;
            var my = (a.y + b.y) / 2;
            var dx = mx - cx;
            var dy = my - cy;
            var len = Math.sqrt(dx * dx + dy * dy) || 1;
            var ctrlX = mx + (dx / len) * bow;
            var ctrlY = my + (dy / len) * bow;
            p.beginShape();
            p.vertex(a.x, a.y);
            p.quadraticVertex(ctrlX, ctrlY, b.x, b.y);
            p.endShape();
            return { x: ctrlX, y: ctrlY };
        }

        function drawBackdrop() {
            // Soft white-to-wash vertical wash, then a faint hex lattice.
            p.noStroke();
            for (var y = 0; y < H; y += 2) {
                var amt = y / H;
                p.fill(p.lerpColor(p.color(PALETTE.paper), p.color(PALETTE.wash), amt));
                p.rect(0, y, W, 2);
            }

            p.noFill();
            p.stroke(p.color(201, 216, 180, 46));
            p.strokeWeight(1);
            var step = 46;
            for (var gx = step / 2; gx < W + step; gx += step * 1.5) {
                for (var gy = step / 2; gy < H + step; gy += step * 0.87) {
                    var offset = (Math.round(gy / (step * 0.87)) % 2) * (step * 0.75);
                    hexagon(gx + offset, gy, step * 0.42, 0);
                }
            }
        }

        function drawRing() {
            // The dotted orbit the scopes sit on: the program's call graph.
            p.noFill();
            p.stroke(p.color(PALETTE.faint));
            p.strokeWeight(1.2);
            p.drawingContext.setLineDash([2, 9]);
            p.ellipse(cx, cy, radius * 2.02, radius * 2.02 * 0.82);
            p.drawingContext.setLineDash([]);
        }

        function drawEffects() {
            var now = p.millis();

            for (var i = effects.length - 1; i >= 0; i--) {
                var fx = effects[i];
                var t = (now - fx.start) / fx.dur;
                if (t >= 1) {
                    if (fx.type === "drop") {
                        // Re-allocate the value in a fresh scope: the
                        // program keeps running, the old memory is gone.
                        fx.value.owner = p.floor(p.random(nodes.length));
                        fx.value.alpha = 1;
                    }
                    effects.splice(i, 1);
                    continue;
                }

                var ownerPos = nodePos(nodes[fx.value.owner]);
                // Fade in, hold, fade out.
                var envelope = Math.sin(t * Math.PI);

                if (fx.type === "shared") {
                    p.noFill();
                    for (var s = 0; s < fx.targets.length; s++) {
                        var target = nodePos(nodes[fx.targets[s]]);
                        var c = p.color(PALETTE.sage);
                        c.setAlpha(150 * envelope);
                        p.stroke(c);
                        p.strokeWeight(1.6);
                        arcBetween(ownerPos, target, 26);

                        // A token sliding along the borrow shows direction.
                        var travel = easeInOut(Math.min(1, t * 1.6));
                        var tx = p.lerp(ownerPos.x, target.x, travel);
                        var ty = p.lerp(ownerPos.y, target.y, travel);
                        var dot = p.color(PALETTE.sage);
                        dot.setAlpha(210 * envelope);
                        p.noStroke();
                        p.fill(dot);
                        p.circle(tx, ty, 6);
                        p.noFill();
                    }
                } else if (fx.type === "mut") {
                    var mTarget = nodePos(nodes[fx.targets[0]]);
                    var mc = p.color(PALETTE.ember);
                    mc.setAlpha(180 * envelope);
                    p.noFill();
                    p.stroke(mc);
                    p.strokeWeight(3.4);
                    arcBetween(ownerPos, mTarget, 30);

                    // Exclusivity ring: while &mut is alive, the owner is
                    // sealed off and nothing else may touch it.
                    var ring = p.color(PALETTE.ember);
                    ring.setAlpha(110 * envelope);
                    p.stroke(ring);
                    p.strokeWeight(1.4);
                    p.drawingContext.setLineDash([3, 6]);
                    p.circle(ownerPos.x, ownerPos.y, 62 + 8 * Math.sin(now * 0.006));
                    p.drawingContext.setLineDash([]);
                } else if (fx.type === "drop") {
                    fx.value.alpha = 1 - t;
                    var d = p.color(PALETTE.muted);
                    d.setAlpha(120 * (1 - t));
                    p.noFill();
                    p.stroke(d);
                    p.strokeWeight(1.5);
                    p.circle(ownerPos.x, ownerPos.y, 40 + t * 90);
                }
            }
        }

        function drawNodes() {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var pos = nodePos(node);
                var owned = values.some(function (v) {
                    return v.owner === i && v.alpha > 0.05 && !v.moving;
                });

                node.ghost = Math.max(0, node.ghost - 0.012);
                node.pulse = Math.max(0, node.pulse - 0.02);

                // Outer glow for scopes that currently own something.
                if (owned) {
                    p.noStroke();
                    var glow = p.color(PALETTE.sageSoft);
                    glow.setAlpha(40);
                    p.fill(glow);
                    p.circle(pos.x, pos.y, 62);
                }

                // Scope body: a white-filled hexagon, the "stack frame".
                p.stroke(owned ? p.color(PALETTE.sage) : p.color(PALETTE.faint));
                p.strokeWeight(owned ? 2 : 1.3);
                p.fill(255, 255, 255, node.ghost > 0 ? 190 : 245);
                hexagon(pos.x, pos.y, 22, 0);

                // "Moved out" scopes are struck through: the binding is
                // still there, but reading it is a compile error.
                if (node.ghost > 0.02) {
                    var strike = p.color(PALETTE.ember);
                    strike.setAlpha(200 * node.ghost);
                    p.stroke(strike);
                    p.strokeWeight(2);
                    p.line(pos.x - 12, pos.y + 12, pos.x + 12, pos.y - 12);
                }

                // Scope label
                p.noStroke();
                p.fill(p.color(PALETTE.muted));
                p.textAlign(p.CENTER, p.TOP);
                p.textSize(W < 620 ? 10 : 11);
                p.text(node.name + "()", pos.x, pos.y + 28);
            }
        }

        function drawValues() {
            var now = p.millis();

            for (var i = 0; i < values.length; i++) {
                var value = values[i];
                if (value.alpha <= 0.02) continue;

                var pos;
                if (value.moving) {
                    var t = (now - value.moving.start) / value.moving.dur;
                    if (t >= 1) {
                        value.owner = value.moving.to;
                        nodes[value.owner].pulse = 1;
                        value.moving = null;
                        pos = nodePos(nodes[value.owner]);
                    } else {
                        var from = nodePos(nodes[value.moving.from]);
                        var to = nodePos(nodes[value.moving.to]);
                        var e = easeInOut(t);
                        // Bow the move path outward so it reads as a
                        // transfer, not a straight-line borrow.
                        var mx = (from.x + to.x) / 2 + (cx - (from.x + to.x) / 2) * 0.35;
                        var my = (from.y + to.y) / 2 + (cy - (from.y + to.y) / 2) * 0.35;
                        pos = {
                            x: p.lerp(p.lerp(from.x, mx, e), p.lerp(mx, to.x, e), e),
                            y: p.lerp(p.lerp(from.y, my, e), p.lerp(my, to.y, e), e)
                        };

                        // Trail behind the moving value.
                        var trail = p.color(value.tint);
                        trail.setAlpha(70);
                        p.noStroke();
                        p.fill(trail);
                        p.circle(p.lerp(from.x, pos.x, 0.72), p.lerp(from.y, pos.y, 0.72), 9);
                    }
                } else {
                    pos = nodePos(nodes[value.owner]);
                }

                value.spin += reducedMotion ? 0 : 0.006;

                // The value itself: a small filled hexagon "allocation".
                var body = p.color(value.tint);
                body.setAlpha(235 * value.alpha);
                p.fill(body);
                p.stroke(255, 255, 255, 235 * value.alpha);
                p.strokeWeight(2);
                hexagon(pos.x, pos.y - 1, 10, value.spin);

                // Its name, so the status line below can be followed.
                p.noStroke();
                var label = p.color(PALETTE.ink);
                label.setAlpha(230 * value.alpha);
                p.fill(label);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.textSize(W < 620 ? 10 : 11);
                p.text(value.name, pos.x, pos.y - 15);
            }
        }

        function drawStatus() {
            var active = p.millis() < status.until;
            var colors = {
                idle: PALETTE.muted,
                shared: PALETTE.sage,
                mut: PALETTE.ember,
                move: PALETTE.gold,
                drop: PALETTE.slate
            };

            p.noStroke();
            p.fill(255, 255, 255, 225);
            p.rect(0, H - 34, W, 34);
            p.stroke(p.color(PALETTE.faint));
            p.strokeWeight(1);
            p.line(0, H - 34, W, H - 34);

            p.noStroke();
            var c = p.color(active ? colors[status.kind] : PALETTE.faint);
            p.fill(c);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(W < 620 ? 10.5 : 12.5);
            p.textFont("monospace");
            p.text(active ? status.text : "// safe by construction, checked at compile time",
                16, H - 16, W - 32);
            p.textFont("sans-serif");
        }

        /* --------------------------------------------------------------
           p5 lifecycle
           -------------------------------------------------------------- */

        p.setup = function () {
            mount = document.getElementById(MOUNT_ID);
            reducedMotion = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            measure();
            var canvas = p.createCanvas(W, H);
            canvas.parent(MOUNT_ID);
            p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
            p.randomSeed(Date.now() % 100000);
            buildScene();
            t0 = p.millis();

            if (reducedMotion) {
                // Draw one composed frame and stop: no motion at all.
                p.redraw();
                p.noLoop();
            }
        };

        p.draw = function () {
            drawBackdrop();
            drawRing();
            drawEffects();
            drawNodes();
            drawValues();
            drawStatus();

            if (!reducedMotion && !paused && p.millis() > nextEventAt) {
                scheduleEvent();
            }
        };

        p.windowResized = function () {
            var previousCount = nodes.length;
            measure();
            p.resizeCanvas(W, H);

            var wantedCount = W < 620 ? 5 : 7;
            if (wantedCount !== previousCount) {
                // The layout genuinely changed shape — start over.
                buildScene();
            } else {
                // Same lattice, new dimensions: rescale in place so the
                // animation in flight is not interrupted by a resize.
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].r = radius * p.random(0.9, 1.06);
                }
            }
            if (reducedMotion) p.redraw();
        };

        // Exposed so the buttons under the canvas can drive the sketch.
        p.artControls = {
            toggle: function () {
                paused = !paused;
                if (paused) p.noLoop(); else p.loop();
                return paused;
            },
            regenerate: function () {
                p.randomSeed(Date.now() % 100000);
                measure();
                buildScene();
                if (!p.isLooping()) p.redraw();
            },
            isPaused: function () {
                return paused;
            }
        };

        window.rustArt = p.artControls;
    };

    function boot() {
        if (typeof window.p5 === "undefined") return;
        if (!document.getElementById(MOUNT_ID)) return;
        new window.p5(sketch);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
