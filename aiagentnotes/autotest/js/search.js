(function () {
  'use strict';

  function init() {
    document.querySelectorAll('input[type="search"]').forEach(function (input) {
      input.title = 'Type a term, then press Enter to find it on this page. Press Enter again for the next match.';

      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' || !input.value.trim()) return;
        event.preventDefault();
        window.find(input.value.trim(), false, event.shiftKey, true, false, false, false);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
