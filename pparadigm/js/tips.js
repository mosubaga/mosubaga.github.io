'use strict';
for (const box of document.querySelectorAll('.codebox')) {
  const code = box.querySelector('code');
  const source = code.textContent;
  const syntax = code.className.replace('language-', '');
  if (window.Prism && Prism.languages[syntax]) {
    code.innerHTML = Prism.highlight(source, Prism.languages[syntax], syntax);
  }
  const button = box.querySelector('.copy-button');
  const title = box.closest('article').querySelector('h3').textContent;
  button.setAttribute('aria-label', 'Copy ' + syntax + ' example: ' + title);
  button.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(source);
      } else {
        const field = document.createElement('textarea');
        field.value = source;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        button.focus();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      button.textContent = 'Copied!';
      document.querySelector('#copy-status').textContent = syntax + ' example copied.';
      setTimeout(() => { button.textContent = 'Copy code'; }, 1800);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = 'Code selected';
      document.querySelector('#copy-status').textContent = 'Code selected. Press Control+C or Command+C to copy.';
    }
  });
}
