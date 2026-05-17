/**
 * batters.js — Batter search and display logic
 * Fetches data from batters.json, computes stats, and renders tables.
 */

const form          = document.getElementById('batter-form');
const clearBtn      = document.getElementById('clear-btn');
const errorMsg      = document.getElementById('error-msg');
const errorText     = document.getElementById('error-text');
const resultsSection = document.getElementById('results-section');
const yearlyTbody   = document.getElementById('yearly-tbody');
const careerTbody   = document.getElementById('career-tbody');
const playerNameDisplay = document.getElementById('player-name-display');
const playerMeta    = document.getElementById('player-meta');

let allBatters = null;

async function loadData() {
  if (allBatters) return allBatters;
  const res = await fetch('js/batters.json');
  allBatters = await res.json();
  return allBatters;
}

/**
 * Compute batting metrics from raw season totals.
 * NOTE: 2B/3B are not in the dataset, so SLG uses (1B + 4*HR) / AB as an approximation.
 */
function computeStats(row) {
  const ab  = Number(row.AB)  || 0;
  const h   = Number(row.H)   || 0;
  const hr  = Number(row.HR)  || 0;
  const bb  = Number(row.BB)  || 0;
  const hbp = Number(row.HBP) || 0;
  const sf  = Number(row.SF)  || 0;

  const singles = h - hr;  // approximation; no 2B/3B in data
  const totalBases = singles + (4 * hr);

  const ba  = ab > 0 ? h / ab : 0;
  const obpDenom = ab + bb + hbp + sf;
  const obp = obpDenom > 0 ? (h + bb + hbp) / obpDenom : 0;
  const slg = ab > 0 ? totalBases / ab : 0;
  const ops = obp + slg;
  const iso = slg - ba;

  return { ba, obp, slg, ops, iso };
}

function fmt(n, decimals = 3) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toFixed(decimals).replace(/^0\./, '.');
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
      <td>${fmtInt(row.AB)}</td>
      <td>${fmtInt(row.H)}</td>
      <td>${fmtInt(row.HR)}</td>
      <td>${fmtInt(row.RBI)}</td>
      <td>${fmtInt(row.SB)}</td>
      <td>${fmtInt(row.SO)}</td>
      <td>${fmtInt(row.BB)}</td>
      <td>${fmt(stats.ba)}</td>
      <td>${fmt(stats.obp)}</td>
      <td>${fmt(stats.slg)}</td>
      <td>${fmt(stats.ops)}</td>
      <td>${fmt(stats.iso)}</td>
    `;
    yearlyTbody.appendChild(tr);
  });

  // --- Career totals ---
  const career = {
    G:   rows.reduce((s, r) => s + (Number(r.G)   || 0), 0),
    AB:  rows.reduce((s, r) => s + (Number(r.AB)  || 0), 0),
    H:   rows.reduce((s, r) => s + (Number(r.H)   || 0), 0),
    HR:  rows.reduce((s, r) => s + (Number(r.HR)  || 0), 0),
    RBI: rows.reduce((s, r) => s + (Number(r.RBI) || 0), 0),
    SB:  rows.reduce((s, r) => s + (Number(r.SB)  || 0), 0),
    SO:  rows.reduce((s, r) => s + (Number(r.SO)  || 0), 0),
    BB:  rows.reduce((s, r) => s + (Number(r.BB)  || 0), 0),
    HBP: rows.reduce((s, r) => s + (Number(r.HBP) || 0), 0),
    SF:  rows.reduce((s, r) => s + (Number(r.SF)  || 0), 0),
  };

  // Compute career rate stats from career totals
  const careerStats = computeStats(career);
  const seasonCount = [...new Set(rows.map(r => r.yearID))].length;

  careerTbody.innerHTML = '';
  const ctr = document.createElement('tr');
  ctr.className = 'career-row';
  ctr.innerHTML = `
    <td>${seasonCount} season${seasonCount !== 1 ? 's' : ''}</td>
    <td>${fmtInt(career.G)}</td>
    <td>${fmtInt(career.AB)}</td>
    <td>${fmtInt(career.H)}</td>
    <td>${fmtInt(career.HR)}</td>
    <td>${fmtInt(career.RBI)}</td>
    <td>${fmtInt(career.SB)}</td>
    <td>${fmtInt(career.SO)}</td>
    <td>${fmtInt(career.BB)}</td>
    <td>${fmt(careerStats.ba)}</td>
    <td>${fmt(careerStats.obp)}</td>
    <td>${fmt(careerStats.slg)}</td>
    <td>${fmt(careerStats.ops)}</td>
    <td>${fmt(careerStats.iso)}</td>
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
      showError(`No batting records found for "${firstName} ${lastName}". Remember: data is only available from 1980.`);
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
