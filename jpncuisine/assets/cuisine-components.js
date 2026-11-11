for (const link of document.querySelectorAll('.hero-cuisine-links a')) {
  if (!customElements.get('wa-button')) break;
  const button = document.createElement('wa-button');
  button.setAttribute('href', link.getAttribute('href'));
  button.setAttribute('size', 'small');
  button.setAttribute('pill', '');
  button.textContent = link.textContent;
  link.replaceWith(button);
}

const articleBody = document.querySelector('.single-content');
const articleHeadings = articleBody?.querySelectorAll('h2, h3');

if (articleHeadings?.length >= 3 && customElements.get('wa-details')) {
  const contents = document.createElement('wa-details');
  contents.className = 'article-contents';
  contents.setAttribute('summary', 'In this article');

  const navigation = document.createElement('nav');
  navigation.setAttribute('aria-label', 'Article contents');
  const links = document.createElement('ul');

  for (const [index, heading] of articleHeadings.entries()) {
    heading.id ||= `article-section-${index + 1}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    const item = document.createElement('li');
    item.classList.toggle('article-contents-subsection', heading.tagName === 'H3');
    item.append(link);
    links.append(item);
  }

  navigation.append(links);
  contents.append(navigation);
  articleBody.before(contents);
}
