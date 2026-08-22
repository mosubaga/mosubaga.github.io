(function () {
    "use strict";

    var host = document.getElementById("go-artwork");
    if (!host || typeof window.p5 === "undefined") {
        return;
    }

    new window.p5(function (p) {
        var particles = [];
        var rails = [
            { label: "chan jobs", y: 0.36, phase: 0.0, color: "#00a896" },
            { label: "chan results", y: 0.64, phase: 0.42, color: "#ff6b9d" }
        ];
        var featureTiles = [
            { title: "go fmt", sub: "one style" },
            { title: "go test", sub: "fast loop" },
            { title: "modules", sub: "versions" },
            { title: "interfaces", sub: "behavior" }
        ];
        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function sketchWidth() {
            return Math.max(320, host.clientWidth || 900);
        }

        function sketchHeight() {
            return Math.max(window.innerWidth < 640 ? 220 : 280, Math.round(sketchWidth() * 0.34));
        }

        function resetParticles() {
            particles = [];
            for (var i = 0; i < 18; i += 1) {
                particles.push({
                    angle: p.TWO_PI * i / 18,
                    speed: 0.007 + (i % 5) * 0.0015,
                    radius: 52 + (i % 4) * 14,
                    size: 4 + (i % 3)
                });
            }
        }

        p.setup = function () {
            var canvas = p.createCanvas(sketchWidth(), sketchHeight());
            canvas.parent(host);
            p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
            p.textFont("'Varela Round', 'Segoe UI', sans-serif");
            resetParticles();
            if (reducedMotion) {
                p.noLoop();
            }
        };

        p.windowResized = function () {
            p.resizeCanvas(sketchWidth(), sketchHeight());
            if (reducedMotion) {
                p.redraw();
            }
        };

        function roundedPanel(x, y, w, h, radius, fillColor, strokeColor) {
            p.fill(fillColor);
            p.stroke(strokeColor);
            p.strokeWeight(1);
            p.rect(x, y, w, h, radius);
        }

        function drawBackground() {
            p.noStroke();
            p.background(255, 248, 252);
            for (var i = 0; i < p.width; i += 18) {
                var alpha = p.map(i, 0, p.width, 18, 4);
                p.fill(200, 138, 232, alpha);
                p.rect(i, 0, 8, p.height);
            }

            p.stroke(255, 229, 240, 190);
            p.strokeWeight(1);
            for (var y = 34; y < p.height; y += 38) {
                p.line(24, y, p.width - 24, y);
            }
        }

        function drawMascot(cx, cy, t) {
            var pulse = reducedMotion ? 0 : Math.sin(t * 0.045) * 3;

            p.noFill();
            p.stroke("#00a896");
            p.strokeWeight(2);
            p.arc(cx - 40, cy - 10, 58, 42, p.PI * 1.04, p.PI * 1.92);
            p.arc(cx + 40, cy - 10, 58, 42, p.PI * 1.08, p.PI * 1.96);

            p.fill("#e9fbf8");
            p.stroke("#00a896");
            p.strokeWeight(3);
            p.ellipse(cx, cy, 128 + pulse, 86 + pulse);

            p.noStroke();
            p.fill("#ffffff");
            p.ellipse(cx - 28, cy - 8, 28, 34);
            p.ellipse(cx + 28, cy - 8, 28, 34);
            p.fill("#32283f");
            p.ellipse(cx - 24, cy - 6, 9, 12);
            p.ellipse(cx + 24, cy - 6, 9, 12);

            p.stroke("#32283f");
            p.strokeWeight(3);
            p.noFill();
            p.arc(cx, cy + 8, 34, 24, 0.18, p.PI - 0.18);

            p.noStroke();
            p.fill("#00a896");
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(32);
            p.textStyle(p.BOLD);
            p.text("Go", cx, cy + 43);
            p.textStyle(p.NORMAL);
        }

        function drawChannels(t) {
            var left = p.width * 0.13;
            var right = p.width * 0.87;

            rails.forEach(function (rail, index) {
                var y = p.height * rail.y;
                p.stroke(rail.color);
                p.strokeWeight(4);
                p.line(left, y, right, y);

                p.noStroke();
                p.fill("#ffffff");
                p.rect(left - 42, y - 17, 92, 30, 8);
                p.fill(rail.color);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(13);
                p.text(rail.label, left + 4, y - 2);

                for (var i = 0; i < 6; i += 1) {
                    var progress = reducedMotion ? (i + 1) / 7 : (t * 0.004 + rail.phase + i / 6) % 1;
                    var x = p.lerp(left + 70, right - 18, progress);
                    p.fill(index === 0 ? "#00a896" : "#ff6b9d");
                    p.circle(x, y, 10);
                    p.fill("#ffffff");
                    p.circle(x + 2, y - 2, 3);
                }
            });
        }

        function drawGoroutines(cx, cy, t) {
            particles.forEach(function (dot, i) {
                var angle = dot.angle + (reducedMotion ? 0 : t * dot.speed);
                var x = cx + Math.cos(angle) * dot.radius;
                var y = cy + Math.sin(angle) * dot.radius * 0.62;
                p.noStroke();
                p.fill(i % 2 === 0 ? "#ff8fd6" : "#c88ae8");
                p.circle(x, y, dot.size);
            });

            p.noFill();
            p.stroke("#c88ae8");
            p.strokeWeight(1.2);
            p.ellipse(cx, cy, 178, 106);
            p.ellipse(cx, cy, 134, 78);

            p.noStroke();
            p.fill("#8b5a9d");
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(13);
            p.text("goroutines", cx, cy - 72);
        }

        function drawToolTiles(t) {
            var tileW = Math.min(126, p.width * 0.15);
            var gap = 12;
            var total = featureTiles.length * tileW + (featureTiles.length - 1) * gap;
            var start = (p.width - total) / 2;
            var y = p.height - 66;

            featureTiles.forEach(function (tile, i) {
                var x = start + i * (tileW + gap);
                var lift = reducedMotion ? 0 : Math.sin(t * 0.025 + i) * 2;
                roundedPanel(x, y + lift, tileW, 44, 10, "rgba(255,255,255,0.78)", "rgba(255, 229, 240, 0.95)");
                p.noStroke();
                p.fill(i % 2 === 0 ? "#e91e96" : "#00a896");
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(13);
                p.textStyle(p.BOLD);
                p.text(tile.title, x + tileW / 2, y + lift + 15);
                p.textStyle(p.NORMAL);
                p.fill("#8b5a9d");
                p.textSize(11);
                p.text(tile.sub, x + tileW / 2, y + lift + 31);
            });
        }

        function drawCodeBadges() {
            var leftX = Math.max(20, p.width * 0.045);
            var topY = 30;
            var badges = ["package main", "func main()", "defer close()", "interface{}"];

            badges.forEach(function (label, i) {
                roundedPanel(leftX, topY + i * 38, 128, 28, 8, "rgba(50,40,63,0.88)", "rgba(255,255,255,0.46)");
                p.noStroke();
                p.fill(i === 2 ? "#ffb6e1" : "#b9fff4");
                p.textAlign(p.LEFT, p.CENTER);
                p.textSize(12);
                p.text(label, leftX + 12, topY + i * 38 + 14);
            });
        }

        function drawNetworkBadge(t) {
            var x = p.width - 150;
            var y = 32;
            roundedPanel(x, y, 122, 108, 12, "rgba(255,255,255,0.72)", "rgba(255, 229, 240, 0.96)");

            p.noFill();
            p.stroke("#00a896");
            p.strokeWeight(2);
            p.arc(x + 61, y + 49, 76, 48, p.PI, p.TWO_PI);
            p.arc(x + 61, y + 49, 52, 32, p.PI, p.TWO_PI);
            p.line(x + 23, y + 49, x + 99, y + 49);

            var blink = reducedMotion ? 1 : 0.55 + Math.sin(t * 0.04) * 0.45;
            p.noStroke();
            p.fill(255, 107, 157, 80 + blink * 120);
            p.circle(x + 61, y + 49, 10 + blink * 3);

            p.fill("#8b5a9d");
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(12);
            p.text("net/http", x + 61, y + 82);
        }

        p.draw = function () {
            var t = p.frameCount;
            var cx = p.width / 2;
            var cy = p.height * 0.43;

            drawBackground();
            drawChannels(t);
            drawCodeBadges();
            drawNetworkBadge(t);
            drawGoroutines(cx, cy, t);
            drawMascot(cx, cy, t);
            drawToolTiles(t);
        };
    }, host);
}());
