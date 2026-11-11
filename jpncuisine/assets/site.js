const menuButton = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.main-nav');

function setMenuOpen(open) {
  navigation.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
}

if (menuButton && navigation) {
  document.documentElement.classList.add('js');
  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
}
