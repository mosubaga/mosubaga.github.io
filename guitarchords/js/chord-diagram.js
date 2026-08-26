function renderChordDiagram(container, chord) {
  const W = 130, H = 142;
  const ML = 14, MR = 14;
  const HEADER = 26;   // space above nut for x/o markers
  const NUT_Y = HEADER;
  const FRET_H = 26;
  const N_FRETS = 4;
  const N_STRINGS = 6;
  const STRING_W = (W - ML - MR) / (N_STRINGS - 1);

  const sx = i => ML + i * STRING_W;
  const noteY = fret => NUT_Y + (fret - 0.5) * FRET_H;
  const fretLineY = f => NUT_Y + f * FRET_H;

  const NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    return e;
  }

  function txt(content, attrs) {
    const e = el('text', attrs);
    e.textContent = content;
    return e;
  }

  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'chord-diagram-svg',
    'aria-label': `${chord.name} chord diagram`,
    role: 'img'
  });

  // Fret lines — f=0 is the nut (styled thicker via CSS)
  for (let f = 0; f <= N_FRETS; f++) {
    const y = fretLineY(f);
    svg.appendChild(el('line', {
      x1: ML, y1: y, x2: W - MR, y2: y,
      class: f === 0 ? 'chord-nut' : 'chord-fret-line'
    }));
  }

  // Strings (vertical, from nut down to last fret line)
  for (let i = 0; i < N_STRINGS; i++) {
    svg.appendChild(el('line', {
      x1: sx(i), y1: NUT_Y,
      x2: sx(i), y2: fretLineY(N_FRETS),
      class: 'chord-string'
    }));
  }

  // Barre bar (drawn before individual dots so dots render on top)
  if (chord.barre) {
    const { fret, fromString, toString: toStr } = chord.barre;
    const fromIdx = N_STRINGS - fromString;
    const toIdx   = N_STRINGS - toStr;
    const by = noteY(fret);
    const bx1 = sx(fromIdx) - 8;
    const bWidth = sx(toIdx) - sx(fromIdx) + 16;
    svg.appendChild(el('rect', {
      x: bx1, y: by - 9,
      width: bWidth, height: 18,
      rx: 9, class: 'chord-barre'
    }));
    svg.appendChild(txt('1', {
      x: bx1 + bWidth / 2, y: by,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'chord-dot-label'
    }));
  }

  // Dots, x-marks, and open-string circles
  chord.frets.forEach((fret, i) => {
    const x = sx(i);
    const finger = chord.fingers[i];

    if (fret === 'x') {
      svg.appendChild(txt('✕', {
        x, y: NUT_Y - 7,
        'text-anchor': 'middle',
        'dominant-baseline': 'auto',
        class: 'chord-muted'
      }));
    } else if (fret === 0) {
      svg.appendChild(el('circle', {
        cx: x, cy: NUT_Y - 11,
        r: 5, class: 'chord-open'
      }));
    } else {
      // Skip dots that fall on the barre fret (the bar covers them)
      if (chord.barre && fret === chord.barre.fret) return;
      const cy = noteY(fret);
      svg.appendChild(el('circle', {
        cx: x, cy, r: 9, class: 'chord-dot'
      }));
      if (finger !== null) {
        svg.appendChild(txt(finger, {
          x, y: cy,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          class: 'chord-dot-label'
        }));
      }
    }
  });

  container.innerHTML = '';
  container.appendChild(svg);
}
