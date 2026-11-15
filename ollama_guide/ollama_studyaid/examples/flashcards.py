"""Turn a page range of a textbook PDF into flashcards for Anki.

Python 3.10+. Requires `pip install ollama pymupdf` and `ollama pull qwen3:8b`.
Everything runs on your machine; the PDF never leaves it.

  python flashcards.py textbook.pdf --pages 12-18 --count 10 --out cards.tsv

Import cards.tsv in Anki with File > Import (fields: Front, Back, Tags).
"""
import argparse
import os
import sys

import pymupdf
from ollama import chat
from pydantic import BaseModel

MODEL = os.getenv('OLLAMA_MODEL', 'qwen3:8b')
NUM_CTX = int(os.getenv('OLLAMA_NUM_CTX', '16000'))
MAX_CHARS = 36000   # about 9,000 tokens of source text; narrow the page range if you hit this


class Card(BaseModel):
    front: str   # the question
    back: str    # the answer
    page: int    # page the answer comes from


class Deck(BaseModel):
    cards: list[Card]


def read_range(pdf_path: str, first: int, last: int) -> str:
    """Return the text of pages first..last (1-based, inclusive), each labelled with its page number."""
    parts = []
    with pymupdf.open(pdf_path) as doc:
        for number in range(first, min(last, doc.page_count) + 1):
            text = ' '.join(doc[number - 1].get_text().split())
            if text:
                parts.append(f'[p. {number}] {text}')
    return '\n\n'.join(parts)


def make_cards(text: str, count: int) -> list[Card]:
    prompt = f"""Write {count} flashcards from the textbook pages below.
Rules:
- One fact or idea per card. The front is a specific question; the back is a short answer.
- Use only what the pages say. Do not add outside knowledge.
- Prefer definitions, causes, comparisons and steps over trivia.
- Set "page" to the page number the answer comes from.

Pages:
{text}"""
    response = chat(
        model=MODEL,
        messages=[{'role': 'user', 'content': prompt}],
        format=Deck.model_json_schema(),   # structured output: the reply must match this schema
        think=False,
        options={'num_ctx': NUM_CTX, 'temperature': 0},
    )
    return Deck.model_validate_json(response.message.content).cards


def clean(value: str) -> str:
    """Tabs and line breaks would split a card across fields or rows in the TSV file."""
    return ' '.join(value.split())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate Anki flashcards from textbook pages.')
    parser.add_argument('pdf')
    parser.add_argument('--pages', required=True, help='page range, for example 12-18')
    parser.add_argument('--count', type=int, default=10)
    parser.add_argument('--out', default='cards.tsv')
    args = parser.parse_args()

    first, _, last = args.pages.partition('-')
    text = read_range(args.pdf, int(first), int(last or first))
    if not text:
        sys.exit('No text found on those pages. A scanned PDF needs OCR first (see chapter 02).')
    if len(text) > MAX_CHARS:
        print(f'Warning: using the first {MAX_CHARS} characters; choose fewer pages for full coverage.', file=sys.stderr)
        text = text[:MAX_CHARS]

    cards = make_cards(text, args.count)
    with open(args.out, 'x', encoding='utf-8') as handle:   # 'x' refuses to overwrite an existing deck
        for card in cards:
            handle.write(f'{clean(card.front)}\t{clean(card.back)}\tp{card.page}\n')
    print(f'Wrote {len(cards)} cards to {args.out}. Check each card against the page before studying it.')
