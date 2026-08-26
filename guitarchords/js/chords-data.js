const chordData = [
  // ---- MAJOR ----
  { name: "C Major", root: "C", family: "major", notes: ["C","E","G"],
    frets:   ["x", 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, null, 1, null],
    tip: "Keep your thumb low behind the neck; the open G and high E ring out." },

  { name: "D Major", root: "D", family: "major", notes: ["D","F#","A"],
    frets:   ["x", "x", 0, 2, 3, 2],
    fingers: [null, null, null, 1, 3, 2],
    tip: "Small triangular shape — strum only the bottom 4 strings." },

  { name: "E Major", root: "E", family: "major", notes: ["E","G#","B"],
    frets:   [0, 2, 2, 1, 0, 0],
    fingers: [null, 2, 3, 1, null, null],
    tip: "All 6 strings ring out — great first 'full strum' chord." },

  { name: "F Major", root: "F", family: "major", notes: ["F","A","C"],
    frets:   [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    tip: "First barre chord: lay the index finger flat across all 6 strings at fret 1. Expect this to take practice.",
    barre: { fret: 1, fromString: 6, toString: 1 } },

  { name: "G Major", root: "G", family: "major", notes: ["G","B","D"],
    frets:   [3, 2, 0, 0, 0, 3],
    fingers: [3, 2, null, null, null, 4],
    tip: "Wide finger stretch — a common early challenge, keep practicing the reach." },

  { name: "A Major", root: "A", family: "major", notes: ["A","C#","E"],
    frets:   ["x", 0, 2, 2, 2, 0],
    fingers: [null, null, 1, 2, 3, null],
    tip: "Squeeze fingers 1-2-3 into the same fret without muting neighboring strings." },

  // ---- MINOR ----
  { name: "A Minor", root: "Am", family: "minor", notes: ["A","C","E"],
    frets:   ["x", 0, 2, 2, 1, 0],
    fingers: [null, null, 2, 3, 1, null],
    tip: "Same shape family as E major, shifted — compare the two." },

  { name: "D Minor", root: "Dm", family: "minor", notes: ["D","F","A"],
    frets:   ["x", "x", 0, 2, 3, 1],
    fingers: [null, null, null, 2, 3, 1],
    tip: "Only the bottom 4 strings; mirrors D major but with the E string dropped to fret 1." },

  { name: "E Minor", root: "Em", family: "minor", notes: ["E","G","B"],
    frets:   [0, 2, 2, 0, 0, 0],
    fingers: [null, 2, 3, null, null, null],
    tip: "The easiest chord on guitar — often the very first chord beginners learn." },

  // ---- DOMINANT 7TH ----
  { name: "A7", root: "A7", family: "dom7", notes: ["A","C#","E","G"],
    frets:   ["x", 0, 2, 0, 2, 0],
    fingers: [null, null, 1, null, 2, null],
    tip: "Just two fingers — a simplified version of open A major." },

  { name: "B7", root: "B7", family: "dom7", notes: ["B","D#","F#","A"],
    frets:   ["x", 2, 1, 2, 0, 2],
    fingers: [null, 2, 1, 3, null, 4],
    tip: "The trickiest open 7th shape — practice it slowly on its own." },

  { name: "C7", root: "C7", family: "dom7", notes: ["C","E","G","A#"],
    frets:   ["x", 3, 2, 3, 1, 0],
    fingers: [null, 3, 2, 4, 1, null],
    tip: "Like open C major with an added pinky on the G string." },

  { name: "D7", root: "D7", family: "dom7", notes: ["D","F#","A","C"],
    frets:   ["x", "x", 0, 2, 1, 2],
    fingers: [null, null, null, 2, 1, 3],
    tip: "A twisted, diamond-like version of D major." },

  { name: "E7", root: "E7", family: "dom7", notes: ["E","G#","B","D"],
    frets:   [0, 2, 0, 1, 0, 0],
    fingers: [null, 2, null, 1, null, null],
    tip: "A simplified E major with one finger lifted off." },

  { name: "G7", root: "G7", family: "dom7", notes: ["G","B","D","F"],
    frets:   [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, null, null, null, 1],
    tip: "Open G with the high E dropped to fret 1 instead of fret 3." },

  // ---- MAJOR 7TH ----
  { name: "Cmaj7", root: "Cmaj7", family: "maj7", notes: ["C","E","G","B"],
    frets:   ["x", 3, 2, 0, 0, 0],
    fingers: [null, 3, 2, null, null, null],
    tip: "Open C with the B string finger lifted off — lush, jazzy sound." },

  { name: "Dmaj7", root: "Dmaj7", family: "maj7", notes: ["D","F#","A","C#"],
    frets:   ["x", "x", 0, 2, 2, 2],
    fingers: [null, null, null, 1, 2, 3],
    tip: "Mini index-finger barre across the top 3 strings at fret 2 also works." },

  { name: "Emaj7", root: "Emaj7", family: "maj7", notes: ["E","G#","B","D#"],
    frets:   [0, 2, 1, 1, 0, 0],
    fingers: [null, 3, 1, 1, null, null],
    tip: "Index finger barres the D and G strings at fret 1; ring finger takes the A string." },

  { name: "Gmaj7", root: "Gmaj7", family: "maj7", notes: ["G","B","D","F#"],
    frets:   [3, "x", 0, 0, 0, 2],
    fingers: [3, null, null, null, null, 2],
    tip: "Mute the A string with the side of your fretting finger." },

  { name: "Amaj7", root: "Amaj7", family: "maj7", notes: ["A","C#","E","G#"],
    frets:   ["x", 0, 2, 1, 2, 0],
    fingers: [null, null, 2, 1, 3, null],
    tip: "Sits right next to open A major — good for comparing the sound." },

  // ---- MINOR 7TH ----
  { name: "Am7", root: "Am7", family: "min7", notes: ["A","C","E","G"],
    frets:   ["x", 0, 2, 0, 1, 0],
    fingers: [null, null, 2, null, 1, null],
    tip: "One of the easiest chords to add to a beginner repertoire." },

  { name: "Bm7", root: "Bm7", family: "min7", notes: ["B","D","F#","A"],
    frets:   ["x", 2, 0, 2, 0, 2],
    fingers: [null, 2, null, 3, null, 4],
    tip: "Useful in the key of D and G progressions further down this site." },

  { name: "Dm7", root: "Dm7", family: "min7", notes: ["D","F","A","C"],
    frets:   ["x", "x", 0, 2, 1, 1],
    fingers: [null, null, null, 2, 1, 1],
    tip: "Index finger flattens across the B and high E strings at fret 1." },

  { name: "Em7", root: "Em7", family: "min7", notes: ["E","G","B","D"],
    frets:   [0, 2, 0, 0, 0, 0],
    fingers: [null, 2, null, null, null, null],
    tip: "Just one finger — even easier than E minor." },
];
