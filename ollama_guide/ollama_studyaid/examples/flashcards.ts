/** Turn a page range of a textbook PDF into flashcards for Anki.
 * Node 20+, run via `npx tsx`. Requires `npm install ollama unpdf` and `ollama pull qwen3:8b`.
 * Everything runs on your machine; the PDF never leaves it.
 *
 *   npx tsx flashcards.ts textbook.pdf --pages 12-18 --count 10 --out cards.tsv
 *
 * Import cards.tsv in Anki with File > Import (fields: Front, Back, Tags).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { Ollama } from 'ollama';
import { extractText, getDocumentProxy } from 'unpdf';

const model = process.env.OLLAMA_MODEL ?? 'qwen3:8b';
const numCtx = Number(process.env.OLLAMA_NUM_CTX ?? 16000);
const maxChars = 36000;   // about 9,000 tokens of source text; narrow the page range if you hit this

interface Card { front: string; back: string; page: number }

// Structured output: the reply must match this JSON schema.
const deckSchema = {
  type: 'object',
  properties: {
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          front: { type: 'string' },   // the question
          back: { type: 'string' },    // the answer
          page: { type: 'integer' },   // page the answer comes from
        },
        required: ['front', 'back', 'page'],
      },
    },
  },
  required: ['cards'],
};

const client = new Ollama();

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/** Return the text of pages first..last (1-based, inclusive), each labelled with its page number. */
async function readRange(pdfPath: string, first: number, last: number): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(pdfPath)));
  const { text } = await extractText(pdf, { mergePages: false });
  return text
    .map((raw, i) => ({ page: i + 1, text: raw.replace(/\s+/g, ' ').trim() }))
    .filter((p) => p.page >= first && p.page <= last && p.text.length > 0)
    .map((p) => `[p. ${p.page}] ${p.text}`)
    .join('\n\n');
}

async function makeCards(text: string, count: number): Promise<Card[]> {
  const prompt = `Write ${count} flashcards from the textbook pages below.
Rules:
- One fact or idea per card. The front is a specific question; the back is a short answer.
- Use only what the pages say. Do not add outside knowledge.
- Prefer definitions, causes, comparisons and steps over trivia.
- Set "page" to the page number the answer comes from.

Pages:
${text}`;
  const response = await client.chat({
    model,
    messages: [{ role: 'user', content: prompt }],
    format: deckSchema,
    think: false,
    options: { num_ctx: numCtx, temperature: 0 },
  });
  const deck = JSON.parse(response.message.content) as { cards?: Card[] };
  if (!Array.isArray(deck.cards)) throw new Error('The model did not return a list of cards.');
  return deck.cards.filter((c) => typeof c.front === 'string' && typeof c.back === 'string');
}

/** Tabs and line breaks would split a card across fields or rows in the TSV file. */
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();

async function main(): Promise<void> {
  const pdfPath = process.argv[2];
  const pages = option('pages');
  if (!pdfPath || pdfPath.startsWith('--') || !pages) {
    console.error('Usage: npx tsx flashcards.ts textbook.pdf --pages 12-18 [--count 10] [--out cards.tsv]');
    process.exit(1);
  }
  const [first, last] = pages.split('-').map(Number);
  const count = Number(option('count') ?? 10);
  const out = option('out') ?? 'cards.tsv';

  let text = await readRange(pdfPath, first, last ?? first);
  if (!text) throw new Error('No text found on those pages. A scanned PDF needs OCR first (see chapter 02).');
  if (text.length > maxChars) {
    console.error(`Warning: using the first ${maxChars} characters; choose fewer pages for full coverage.`);
    text = text.slice(0, maxChars);
  }

  const cards = await makeCards(text, count);
  const rows = cards.map((c) => `${clean(c.front)}\t${clean(c.back)}\tp${c.page}\n`).join('');
  await writeFile(out, rows, { flag: 'wx' });   // 'wx' refuses to overwrite an existing deck
  console.log(`Wrote ${cards.length} cards to ${out}. Check each card against the page before studying it.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
