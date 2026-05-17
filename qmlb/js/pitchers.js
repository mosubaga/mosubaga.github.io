/**
 * pitchers.js — Pitcher search and display logic
 * Fetches data from picthers.json (note: typo in source filename),
 * computes advanced metrics, and renders tables.
 */

const form           = document.getElementById('pitcher-form');
const clearBtn       = document.getElementById('clear-btn');
const errorMsg       = document.getElementById('error-msg');
const errorText      = document.getElementById('error-text');
const resultsSection = document.getElementById('results-section');
const yearlyTbody    = document.getElementById('yearly-tbody');
const careerTbody    = document.getElementById('career-tbody');
const playerNameDisplay = document.getElementById('player-name-display');
const playerMeta     = document.getElementById('player-meta');

let allPitchers = null;

async function loadData() {
  if (allPitchers) return allPitchers;
  // Note: source file has a typo — "picthers.json" not "pitchers.json"
  const res = await fetch('js/picthers.json');
  allPitchers = await res.json();
  return allPitchers;
}

/**
 * Compute pitching metrics from raw season data.
 *
 * IPouts = total outs recorded (IP * 3).
 * FIP constant is approximated at 3.10 (league-average, common default).
 */
function computeStats(row) {
  const ipOuts = Number(row.IPouts) || 0;
  const ip     = ipOuts / 3;
  const h      = Number(row.H)   || 0;
  const er     = Number(row.ER)  || 0;
  const hr     = Number(row.HR)  || 0;
  const bb     = Number(row.BB)  || 0;
  const so     = Number(row.SO)  || 0;

  const era  = ip > 0 ? (er * 9) / ip : null;
  const whip = ip > 0 ? (bb + h) / ip : null;
  const k9   = ip > 0 ? (so * 9) / ip : null;
  const bb9  = ip > 0 ? (bb * 9) / ip : null;
  // FIP = (13*HR + 3*BB - 2*SO) / IP + FIP_constant
  const fip  = ip > 0 ? ((13 * hr + 3 * bb - 2 * so) / ip) + 3.10 : null;

  return { ip, era, whip, k9, bb9, fip };
}

function fmt(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toFixed(decimals);
}

function fmtIP(ip) {
  if (ip === null || ip === undefined || isNaN(ip)) return '—';
  const full  = Math.floor(ip);
  const third = Math.round((ip - full) * 3);
  return third === 0 ? `${full}.0` : `${full}.${third}`;
}

function fmtInt(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Math.round(n).toString();
}

function showError(msg) {
  errorText.textContent = msg;
  errorMsg.style.display = 'flex';
  resultsSection.classList.remove('visible');
}

function hideError() {
  errorMsg.style.display = 'none';
}

function renderResults(firstName, lastName, rows) {
  hideError();

  // Sort by yearID then stint
  rows.sort((a, b) => a.yearID - b.yearID || a.stint - b.stint);

  playerNameDisplay.textContent = `${firstName} ${lastName}`;
  const teams = [...new Set(rows.map(r => r.teamID))].join(', ');
  const years = `${rows[0].yearID}–${rows[rows.length - 1].yearID}`;
  playerMeta.textContent = `${years}  ·  Teams: ${teams}`;

  // --- Yearly table ---
  yearlyTbody.innerHTML = '';
  rows.forEach(row => {
    const stats = computeStats(row);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.yearID}</td>
      <td>${row.teamID}</td>
      <td>${fmtInt(row.G)}</td>
      <td>${fmtInt(row.W)}</td>
      <td>${fmtInt(row.L)}</td>
      <td>${fmtInt(row.SV)}</td>
      <td>${fmtIP(stats.ip)}</td>
      <td>${fmt(stats.era)}</td>
      <td>${fmt(stats.whip)}</td>
      <td>${fmt(stats.k9)}</td>
      <td>${fmt(stats.bb9)}</td>
      <td>${fmt(stats.fip)}</td>
    `;
    yearlyTbody.appendChild(tr);
  });

  // --- Career totals (compute from aggregated raw counts) ---
  const career = {
    G:      rows.reduce((s, r) => s + (Number(r.G)      || 0), 0),
    W:      rows.reduce((s, r) => s + (Number(r.W)      || 0), 0),
    L:      rows.reduce((s, r) => s + (Number(r.L)      || 0), 0),
    SV:     rows.reduce((s, r) => s + (Number(r.SV)     || 0), 0),
    IPouts: rows.reduce((s, r) => s + (Number(r.IPouts) || 0), 0),
    H:      rows.reduce((s, r) => s + (Number(r.H)      || 0), 0),
    ER:     rows.reduce((s, r) => s + (Number(r.ER)     || 0), 0),
    HR:     rows.reduce((s, r) => s + (Number(r.HR)     || 0), 0),
    BB:     rows.reduce((s, r) => s + (Number(r.BB)     || 0), 0),
    SO:     rows.reduce((s, r) => s + (Number(r.SO)     || 0), 0),
  };

  const careerStats = computeStats(career);
  const seasonCount = [...new Set(rows.map(r => r.yearID))].length;

  careerTbody.innerHTML = '';
  const ctr = document.createElement('tr');
  ctr.className = 'career-row';
  ctr.innerHTML = `
    <td>${seasonCount} season${seasonCount !== 1 ? 's' : ''}</td>
    <td>${fmtInt(career.G)}</td>
    <td>${fmtInt(career.W)}</td>
    <td>${fmtInt(career.L)}</td>
    <td>${fmtInt(career.SV)}</td>
    <td>${fmtIP(careerStats.ip)}</td>
    <td>${fmt(careerStats.era)}</td>
    <td>${fmt(careerStats.whip)}</td>
    <td>${fmt(careerStats.k9)}</td>
    <td>${fmt(careerStats.bb9)}</td>
    <td>${fmt(careerStats.fip)}</td>
  `;
  careerTbody.appendChild(ctr);

  resultsSection.classList.add('visible');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const firstName = document.getElementById('first-name').value.trim();
  const lastName  = document.getElementById('last-name').value.trim();

  if (!firstName || !lastName) return;

  try {
    const data = await loadData();

    const firstLower = firstName.toLowerCase();
    const lastLower  = lastName.toLowerCase();

    const matches = data.filter(r =>
      r.nameFirst && r.nameLast &&
      r.nameFirst.toLowerCase() === firstLower &&
      r.nameLast.toLowerCase()  === lastLower
    );

    if (matches.length === 0) {
      showError(`No pitching records found for "${firstName} ${lastName}". Remember: data is only available from 1980.`);
      return;
    }

    renderResults(firstName, lastName, matches);
  } catch (err) {
    showError('Failed to load data. Please try again.');
    console.error(err);
  }
});

clearBtn.addEventListener('click', () => {
  form.reset();
  hideError();
  resultsSection.classList.remove('visible');
  yearlyTbody.innerHTML = '';
  careerTbody.innerHTML = '';
});
