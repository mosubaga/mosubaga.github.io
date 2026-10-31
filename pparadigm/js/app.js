'use strict';
const language = document.querySelector('#language');
const syntaxLanguages = { Python: 'python', JavaScript: 'javascript', Java: 'java', 'C++': 'cpp' };
const instructions = {
  Python: 'Run with Python 3: save an example as main.py, then run python3 main.py.',
  JavaScript: 'Run with a modern Node.js (18+): save as main.js, then run node main.js. You can also paste an example into your browser’s developer console.',
  Java: 'Use JDK 17+: save one example at a time as Main.java. Run javac Main.java, then java Main.',
  'C++': 'Use C++17: save one example as main.cpp. Run c++ -std=c++17 main.cpp -o example, then ./example (Windows: example.exe).'
};
for (const [index, lesson] of lessons.entries()) {
  const link = document.createElement('a'); link.href = '#' + lesson.id; link.textContent = lesson.title;
  document.querySelector('#' + lesson.group + '-links').append(link);
  const article = document.createElement('article'); article.className = 'lesson'; article.id = lesson.id;
  const heading = document.createElement('h3');
  const number = document.createElement('span'); number.className = 'lesson-index'; number.textContent = String(index + 1).padStart(2, '0');
  heading.append(number, document.createTextNode(lesson.title)); article.append(heading);
  for (const [className, text] of [['', lesson.desc], ['analogy', lesson.analogy], ['focus', lesson.focus]]) {
    const p = document.createElement('p'); p.className = className; p.textContent = text; article.append(p);
  }
  const box = document.createElement('div'); box.className = 'codebox';
  const toolbar = document.createElement('div'); toolbar.className = 'code-toolbar';
  const label = document.createElement('span'); label.className = 'code-language';
  const button = document.createElement('button'); button.className = 'copy-button'; button.type = 'button'; button.textContent = 'Copy code'; button.setAttribute('aria-label', 'Copy ' + lesson.title + ' example');
  const pre = document.createElement('pre'); const code = document.createElement('code'); pre.append(code);
  button.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(code.textContent);
      else {
        const field = document.createElement('textarea'); field.value = code.textContent; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
        const copied = document.execCommand('copy'); field.remove(); button.focus(); if (!copied) throw new Error('Clipboard unavailable');
      }
      button.textContent = 'Copied!'; document.querySelector('#copy-status').textContent = lesson.title + ' example copied.';
      setTimeout(() => { button.textContent = 'Copy code'; }, 1800);
    } catch {
      const range = document.createRange(); range.selectNodeContents(code); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      document.querySelector('#copy-status').textContent = 'Code selected. Press Control+C or Command+C to copy.'; button.textContent = 'Code selected';
    }
  });
  toolbar.append(label, button); box.append(toolbar, pre); article.append(box);
  const output = document.createElement('div'); output.className = 'output';
  const outputLabel = document.createElement('span'); outputLabel.textContent = 'EXPECTED OUTPUT';
  const outputPre = document.createElement('pre'); outputPre.textContent = lesson.out; output.append(outputLabel, outputPre); article.append(output);
  document.querySelector('#' + lesson.group + '-lessons').append(article);
}
function updateLanguage() {
  for (const lesson of lessons) {
    const article = document.getElementById(lesson.id);
    const code = article.querySelector('code');
    const syntax = syntaxLanguages[language.value];
    code.className = 'language-' + syntax;
    const source = lesson.code[language.value];
    if (window.Prism && Prism.languages[syntax]) {
      code.innerHTML = Prism.highlight(source, Prism.languages[syntax], syntax);
    } else {
      code.textContent = source;
    }
    article.querySelector('.code-language').textContent = language.value + ' / ' + lesson.title;
  }
  document.querySelector('#run-note').textContent = instructions[language.value];
}
language.addEventListener('change', updateLanguage); updateLanguage();
let swapped = false;
const input = document.querySelector('#pipeline-input');
function updatePipeline() {
  if (!input.checkValidity() || input.value === '') {
    document.querySelector('#pipeline-caption').textContent = 'Enter a whole number from −100 to 100.'; return;
  }
  const value = Number(input.value); const first = swapped ? value * 2 : value + 1; const result = swapped ? first + 1 : first * 2;
  document.querySelector('#input-value').textContent = value;
  document.querySelector('#first-value').textContent = first;
  document.querySelector('#result-value').textContent = result;
  document.querySelector('#first-label').textContent = swapped ? 'DOUBLE' : 'ADD ONE';
  document.querySelector('#second-label').textContent = swapped ? 'ADD ONE' : 'DOUBLE';
  document.querySelector('#pipeline-caption').textContent = `${swapped ? 'addOne(double' : 'double(addOne'}(${value})) = ${result}`;
}
input.addEventListener('input', updatePipeline);
document.querySelector('#swap').addEventListener('click', () => { swapped = !swapped; updatePipeline(); });
