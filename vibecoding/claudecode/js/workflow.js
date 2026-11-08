// Animates the 4-stage Claude Code workflow loop and renders the detail cards.
document.addEventListener('DOMContentLoaded', () => {
  const stages = Array.from(document.querySelectorAll('#loop .stage-card'));
  const detailEl = document.getElementById('loop-detail');
  if (!stages.length) return;

  const details = [
    {
      title: 'Context',
      icon: 'fa-folder-open',
      badge: 'badge-lavender',
      cls: 'lavender',
      body: 'Share the files, tests, docs, and constraints that matter. A CLAUDE.md file, a linked ticket, or an open test file all count as context.',
      example: 'Read src/auth/session.ts and the three tests in session.test.ts before changing anything.'
    },
    {
      title: 'Prompting',
      icon: 'fa-keyboard',
      badge: 'badge-pink',
      cls: 'pink',
      body: 'Ask for one clear, scoped change at a time. Specific beats clever — name the file, the function, and the symptom.',
      example: 'The session cookie expires 1 hour early. Fix the TTL calculation in createSession(), nothing else.'
    },
    {
      title: 'Verification',
      icon: 'fa-circle-check',
      badge: 'badge-ice',
      cls: 'ice',
      body: 'Have Claude Code run the real build, test, or lint command. Verified output beats a confident-sounding summary every time.',
      example: 'Run npm test -- session.test.ts and show me the output before we move on.'
    },
    {
      title: 'Iterating',
      icon: 'fa-bug',
      badge: 'badge-lavender',
      cls: 'lavender',
      body: 'Feed the actual terminal output — stack trace, failing assertion, type error — back in as the next prompt\'s context.',
      example: 'That failed with "Cannot read property \'exp\' of undefined" at line 42. Here\'s the full stack trace: ...'
    }
  ];

  detailEl.innerHTML = details.map((d, i) => `
    <div class="card ${d.cls}" data-detail="${i}">
      <span class="badge ${d.badge}"><i class="fa-solid ${d.icon}" aria-hidden="true"></i>Stage ${i + 1}</span>
      <h3><i class="fa-solid ${d.icon}" aria-hidden="true"></i>${d.title}</h3>
      <p>${d.body}</p>
      <p class="muted" style="font-family:var(--font-mono);font-size:0.8rem;">"${d.example}"</p>
    </div>
  `).join('');

  const detailCards = Array.from(detailEl.querySelectorAll('[data-detail]'));
  let current = 0;
  let timer = null;

  function setActive(index) {
    stages.forEach((s, i) => s.classList.toggle('active', i === index));
    detailCards.forEach((c, i) => {
      c.style.outline = i === index ? '2px solid var(--lavender-dark)' : 'none';
    });
    current = index;
  }

  function advance() {
    setActive((current + 1) % stages.length);
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(advance, 2600);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  stages.forEach((stage, i) => {
    stage.style.cursor = 'pointer';
    stage.addEventListener('click', () => {
      setActive(i);
      startAuto();
    });
  });

  setActive(0);
  startAuto();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });
});
