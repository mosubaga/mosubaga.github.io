# Guitar Chords Website — Content & Build Brief

**Audience:** Beginner guitarists (6-string, standard tuning: E A D G B E, low to high).
**Purpose of this file:** This is a content + implementation brief for Claude Code to build a static website from. It contains all the chord data, progression examples, and practice content already researched and verified — Claude Code should not need to re-derive music theory, just implement the site.

**Scope decisions already made (do not re-litigate unless the user asks):**
- Beginner-friendly scope: open-position chords only, in the most common/playable keys (plus one intro barre chord, F, since it's the natural next step after open chords).
- Tech stack: plain HTML/CSS/JS, static site, no build step, no frameworks.
- Chord diagrams: visual fretboard diagrams (not just text notation), rendered as SVG from structured data.

---

## 1. Site Structure

Three pages, shared header/nav and shared stylesheet/script:

```
/
├── index.html          → Page 1: Chord Library (Major, Minor, 7ths)
├── progressions.html    → Page 2: Common Chord Progressions
├── practice.html        → Page 3: How to Practice
├── css/
│   └── style.css        → shared styles (single stylesheet, CSS variables for theme)
├── js/
│   ├── chords-data.js    → the chord data object (Section 3 below, as JS)
│   └── chord-diagram.js  → reusable function: renders one SVG fretboard diagram from a chord data object
└── README.md             → brief note on structure (optional)
```

Every page shares a simple top nav: **Chord Library | Progressions | How to Practice**, with the current page highlighted. Keep it mobile-responsive (chord diagrams in a responsive grid that reflows to 1–2 columns on narrow screens). Use a clean, uncluttered look — this is a reference tool people will use mid-practice-session on a phone or tablet propped against an amp, so large tap targets and high-contrast, legible diagrams matter more than decoration.

---

## 2. Page 1: Chord Library

### 2.1 Layout requirements

- Group chords into four sections: **Major**, **Minor**, **Dominant 7th**, **Major 7th**, **Minor 7th** (five sections total — "7ths" splits into three families since they look and function differently; label this clearly, e.g. tabs or filter buttons: `All | Major | Minor | 7th (Dominant) | Major 7th | Minor 7th`).
- Each chord is a card containing: chord name (e.g. "C Major"), an SVG fretboard diagram, and a one-line note where relevant (e.g. fingering tip, "mini barre" instruction).
- A filter/search control that lets the user filter by root note (A–G) and/or family. Pure client-side JS, no backend needed.
- Each card should show the notes in the chord (e.g. "C – E – G") as a small caption — useful context, not just a shape to memorize.

### 2.2 Fretboard diagram spec

Render each chord as a small SVG "chord box": 6 vertical lines (strings, low E on the left, high E on the right — standard convention), 4–5 horizontal lines (frets), with:
- An `x` above a string that is muted/not played.
- An `o` above a string played open.
- A filled dot on the string/fret intersection for a fretted note, labeled with the suggested finger number (1=index, 2=middle, 3=ring, 4=pinky).
- A thick bar across the top representing the nut (so it's visually clear these are open-position chords near the headstock), except for the F chord, which should show a curved bracket/line indicating the index-finger barre across all 6 strings at fret 1.

Build `chord-diagram.js` as a single function, e.g. `renderChordDiagram(container, chordObj)`, that takes one chord's data (see 2.3) and draws the SVG. Every chord card calls this function — don't hand-draw each diagram individually.

### 2.3 Chord data

Notation: strings listed **low E → high E** (the order guitarists read charts in). `frets`: `"x"` = muted, `0` = open, integer = fret number. `fingers`: `null` for open/muted, otherwise 1 (index), 2 (middle), 3 (ring), 4 (pinky). All chords below are the standard, most commonly taught open-position (or near-open) voicings.

```js
const chordData = [
  // ---- MAJOR ----
  { name: "C Major",  root: "C", family: "major", notes: ["C","E","G"],
    frets:   ["x", 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, null, 1, null],
    tip: "Keep your thumb low behind the neck; the open G and high E ring out." },

  { name: "D Major",  root: "D", family: "major", notes: ["D","F#","A"],
    frets:   ["x", "x", 0, 2, 3, 2],
    fingers: [null, null, null, 1, 3, 2],
    tip: "Small triangular shape — strum only the bottom 4 strings." },

  { name: "E Major",  root: "E", family: "major", notes: ["E","G#","B"],
    frets:   [0, 2, 2, 1, 0, 0],
    fingers: [null, 2, 3, 1, null, null],
    tip: "All 6 strings ring out — great first 'full strum' chord." },

  { name: "G Major",  root: "G", family: "major", notes: ["G","B","D"],
    frets:   [3, 2, 0, 0, 0, 3],
    fingers: [3, 2, null, null, null, 4],
    tip: "Wide finger stretch — a common early challenge, keep practicing the reach." },

  { name: "A Major",  root: "A", family: "major", notes: ["A","C#","E"],
    frets:   ["x", 0, 2, 2, 2, 0],
    fingers: [null, null, 1, 2, 3, null],
    tip: "Squeeze fingers 1-2-3 into the same fret without muting neighboring strings." },

  { name: "F Major",  root: "F", family: "major", notes: ["F","A","C"],
    frets:   [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    tip: "First barre chord: lay the index finger flat across all 6 strings at fret 1. Expect this to take practice.",
    barre: { fret: 1, fromString: 6, toString: 1 } },

  // ---- MINOR ----
  { name: "A Minor",  root: "Am", family: "minor", notes: ["A","C","E"],
    frets:   ["x", 0, 2, 2, 1, 0],
    fingers: [null, null, 2, 3, 1, null],
    tip: "Same shape family as E major, shifted — compare the two." },

  { name: "D Minor",  root: "Dm", family: "minor", notes: ["D","F","A"],
    frets:   ["x", "x", 0, 2, 3, 1],
    fingers: [null, null, null, 2, 3, 1],
    tip: "Only the bottom 4 strings; mirrors D major but with the E string dropped to fret 1." },

  { name: "E Minor",  root: "Em", family: "minor", notes: ["E","G","B"],
    frets:   [0, 2, 2, 0, 0, 0],
    fingers: [null, 2, 3, null, null, null],
    tip: "The easiest chord on guitar — often the very first chord beginners learn." },

  // ---- DOMINANT 7TH ----
  { name: "A7",  root: "A7", family: "dom7", notes: ["A","C#","E","G"],
    frets:   ["x", 0, 2, 0, 2, 0],
    fingers: [null, null, 1, null, 2, null],
    tip: "Just two fingers — a simplified version of open A major." },

  { name: "B7",  root: "B7", family: "dom7", notes: ["B","D#","F#","A"],
    frets:   ["x", 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, null, 4],
    tip: "The trickiest open 7th shape — practice it slowly on its own." },

  { name: "C7",  root: "C7", family: "dom7", notes: ["C","E","G","A#"],
    frets:   ["x", 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, null],
    tip: "Like open C major with an added pinky on the G string." },

  { name: "D7",  root: "D7", family: "dom7", notes: ["D","F#","A","C"],
    frets:   ["x", "x", 0, 2, 1, 2],
    fingers: [null, null, null, 2, 1, 3],
    tip: "A twisted, diamond-like version of D major." },

  { name: "E7",  root: "E7", family: "dom7", notes: ["E","G#","B","D"],
    frets:   [0, 2, 0, 1, 0, 0],
    fingers: [null, 2, null, 1, null, null],
    tip: "A simplified E major with one finger lifted off." },

  { name: "G7",  root: "G7", family: "dom7", notes: ["G","B","D","F"],
    frets:   [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, null, null, null, 1],
    tip: "Open G with the high E dropped to fret 1 instead of fret 3." },

  // ---- MAJOR 7TH ----
  { name: "Cmaj7",  root: "Cmaj7", family: "maj7", notes: ["C","E","G","B"],
    frets:   ["x", 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, null, null, null],
    tip: "Open C with the B string finger lifted off — lush, jazzy sound." },

  { name: "Dmaj7",  root: "Dmaj7", family: "maj7", notes: ["D","F#","A","C#"],
    frets:   ["x", "x", 0, 2, 2, 2],
    fingers: [null, null, null, 1, 2, 3],
    tip: "Mini index-finger barre across the top 3 strings at fret 2 also works." },

  { name: "Emaj7",  root: "Emaj7", family: "maj7", notes: ["E","G#","B","D#"],
    frets:   [0, 2, 1, 1, 0, 0],
    fingers: [null, 3, 1, 1, null, null],
    tip: "Index finger barres the D and G strings at fret 1; ring finger takes the A string." },

  { name: "Gmaj7",  root: "Gmaj7", family: "maj7", notes: ["G","B","D","F#"],
    frets:   [3, "x", 0, 0, 0, 2],
    fingers: [3, null, null, null, null, 2],
    tip: "Mute the A string with the side of your fretting finger." },

  { name: "Amaj7",  root: "Amaj7", family: "maj7", notes: ["A","C#","E","G#"],
    frets:   ["x", 0, 2, 1, 2, 0],
    fingers: [null, null, 2, 1, 3, null],
    tip: "Sits right next to open A major — good for comparing the sound." },

  // ---- MINOR 7TH ----
  { name: "Am7",  root: "Am7", family: "min7", notes: ["A","C","E","G"],
    frets:   ["x", 0, 2, 0, 1, 0],
    fingers: [null, null, 2, null, 1, null],
    tip: "One of the easiest chords to add to a beginner repertoire." },

  { name: "Dm7",  root: "Dm7", family: "min7", notes: ["D","F","A","C"],
    frets:   ["x", "x", 0, 2, 1, 1],
    fingers: [null, null, null, 2, 1, 1],
    tip: "Index finger flattens across the B and high E strings at fret 1." },

  { name: "Em7",  root: "Em7", family: "min7", notes: ["E","G","B","D"],
    frets:   [0, 2, 0, 0, 0, 0],
    fingers: [null, 2, null, null, null, null],
    tip: "Just one finger — even easier than E minor." },

  { name: "Bm7",  root: "Bm7", family: "min7", notes: ["B","D","F#","A"],
    frets:   ["x", 2, 0, 2, 0, 2],
    fingers: [null, 2, null, 3, null, 4],
    tip: "Useful in the key of D and G progressions further down this site." },
];
```

Sort order within each family: root note ascending by natural pitch (C, D, E, F, G, A, B) rather than alphabetical, since that's how guitarists expect to scan a chord chart.

---

## 3. Page 2: Common Chord Progressions

### 3.1 Layout requirements

- A list of progression "cards," each showing: the progression's Roman-numeral pattern (e.g. `I – V – vi – IV`), its common name/genre association, one or two worked examples in real keys (using only chords already defined in Section 2 so every chord name can link/jump back to its diagram on the Chord Library page), and a short note on where it's typically heard.
- Where possible, hyperlink each chord name in a worked example to its card on `index.html` (e.g. `index.html#c-major`) so a user can click straight from a progression to the fingering.
- Include a very short plain-language explainer at the top of the page: what a chord progression is, and what the Roman numerals mean (I, ii, iii, IV, V, vi, vii° relative to a major scale/key) — 2-3 sentences, not a full theory lecture.

### 3.2 Content — progressions to include

**I – IV – V** ("the three-chord trick")
The most common progression in rock, country, folk, and blues — three chords cover a huge number of songs.
- Key of C: C – F – G
- Key of G: G – C – D
- Key of A: A – D – E

**I – V – vi – IV** ("the pop progression")
Extremely common in pop music from the 1950s to today.
- Key of C: C – G – Am – F
- Key of G: G – D – Em – C

**vi – IV – I – V**
The same four chords as above, reordered — gives a more melancholy, "verse" feeling before resolving.
- Key of C: Am – F – C – G
- Key of G: Em – C – G – D

**I – vi – IV – V** ("the '50s progression" / doo-wop changes)
The classic doo-wop and early rock 'n' roll progression.
- Key of C: C – Am – F – G
- Key of G: G – Em – C – D

**ii – V – I**
The backbone of jazz harmony; also common in pop.
- Key of C: Dm7 – G7 – Cmaj7
- Key of G: Am7 – D7 – Gmaj7

**12-Bar Blues (I – IV – V blues form)**
The classic blues structure, 12 bars long, using dominant 7th chords throughout for that "bluesy" sound:
```
| I    | I    | I    | I7   |
| IV7  | IV7  | I    | I    |
| V7   | IV7  | I    | V7   |
```
- Key of E: E – E – E – E7 | A7 – A7 – E – E | B7 – A7 – E – B7
- Key of A: A – A – A – A7 | D7 – D7 – A – A | E7 – D7 – A – E7

**I – IV – I – V** (simple folk/campfire pattern)
- Key of D: D – G – D – A *(note: G major open chord is not in this site's beginner set since it needs a stretch already covered — link back to Section 2's G major card)*
- Key of A: A – D – A – E

### 3.3 A short note on transposing

Add a brief closing note (2–3 sentences): once a learner knows a progression's Roman-numeral pattern, they can play it "in any key" by picking a new I chord and counting up the major scale — this is why learning the *pattern*, not just one key's chords, is valuable. Keep it brief; this page is reference-first, not a theory course (that's closer to the practice page's territory, but even there keep it light).

---

## 4. Page 3: How to Practice

Write this as clear, encouraging prose organized under headings (not just a bullet dump) — this is the page most likely to be actually read top-to-bottom rather than scanned. Cover the following content:

### 4.1 Before you start: getting comfortable
- Guitar posture (seated, footstool or strap optional, guitar body against ribs, neck angled slightly up).
- Fretting-hand technique: thumb behind the neck (not wrapped over top), fingers arched, pressing just behind the fret wire (not on top of it) for a clean sound without excess pressure.
- Picking/strumming hand: relaxed wrist, not gripping the pick too hard.
- Expect finger-tip soreness for the first 2-4 weeks of regular practice — this is normal and calluses will form; it is not a sign of doing something wrong. (Do not suggest pushing through sharp pain — sharp or joint pain means stop and check technique.)

### 4.2 The core practice loop
1. **Warm up** (2–3 min): finger stretches, and a simple exercise like walking each finger 1-2-3-4 up one string.
2. **Single-chord accuracy** (5 min): fret one chord, strum, check every string rings clearly, adjust finger placement, repeat.
3. **Chord-to-chord transitions** (10–15 min): the highest-value beginner drill. Pick two chords (e.g. G and C), get both shapes memorized, then practice switching between just those two — slowly at first, gradually speeding up. This matters more than learning new chords: most beginners can *form* chords but struggle to *switch* between them fast enough to keep time.
4. **Strumming with a metronome or backing track** (5–10 min): apply the chords in rhythm, even at a slow tempo — timing is a separate skill from shaping the chord and needs its own practice.
5. **Apply it to a song or progression** (10+ min): use one of the progressions from Page 2, or a simple song, so practice feels purposeful rather than abstract drilling.

### 4.3 Specific tips
- Practice **short and often** beats long and rare: 15–20 focused minutes daily builds muscle memory faster than one 2-hour weekend session.
- Use a **metronome from day one**, even just for chord-switching drills — start slow (e.g. 60 bpm) and only increase tempo once a transition is clean, not before.
- When a chord change is hard, isolate it: loop just those two chords for a few minutes rather than restarting the whole song from the top each time.
- Change one string at a time when learning a new shape close to one you already know (e.g. E major → E minor is just lifting one finger) — noticing these relationships between chords speeds up learning.
- Keep a simple practice log (even just a checklist) of which chords and progressions feel solid vs. still shaky — this website's chord/progression pages can double as that checklist.
- It's normal for a chord to sound "buzzy" or muted at first — the most common causes are: not pressing close enough to the fret wire, an adjacent finger accidentally touching another string, or not pressing quite hard enough. Debug one string at a time.

### 4.4 A sample first-month weekly structure
Present as a short table:

| Week | Focus |
|---|---|
| 1 | E minor, E major, A minor — single-chord accuracy and posture |
| 2 | Add C and G majors; begin 2-chord switching drills (Em↔C, G↔C) |
| 3 | Add D major; practice the I–IV–V and I–V–vi–IV progressions from Page 2 at slow tempo |
| 4 | Add A major and the dominant 7ths (A7, D7, E7); try the 12-bar blues pattern |

Close the page with a short encouraging note: progress on guitar is nonlinear and plateaus are normal — consistency beats intensity.

---

## 5. Design notes (light touch, not prescriptive)

- Color-code the five chord families lightly (e.g. a small accent color per family — major, minor, dom7, maj7, min7) reused consistently across all three pages so the same family reads the same way everywhere.
- Support both light and dark viewing comfortably (this is a practice-room reference tool, often used in low light) — CSS custom properties with a `prefers-color-scheme` media query is enough; no need for a manual toggle unless it's easy.
- Keep typography simple and highly legible; avoid decorative fonts that could be misread as chord names/numbers.
- No login, no backend, no external font/JS dependencies required — everything above is achievable with plain HTML/CSS/JS and inline SVG.

---

## 6. Out of scope for this version

Explicitly not required for v1 (mention only if the user asks for a v2 later): audio playback of chords, a strumming-pattern library, capo transposition calculator, barre-chord shapes beyond F, alternate/open tunings, left-handed diagram mirroring, user accounts/saved progress.

# Output

The website should live in `/Users/nobuhikohayashi/Projects/mosubaga.github.io/guitarchords`
