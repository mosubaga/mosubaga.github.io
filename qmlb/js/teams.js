/**
 * teams.js — Team search and display logic
 * Fetches data from teams.json, populates the dropdown,
 * and renders season-by-season and franchise average tables.
 */

const form           = document.getElementById('team-form');
const clearBtn       = document.getElementById('clear-btn');
const teamSelect     = document.getElementById('team-select');
const errorMsg       = document.getElementById('error-msg');
const errorText      = document.getElementById('error-text');
const resultsSection = document.getElementById('results-section');
const yearlyTbody    = document.getElementById('yearly-tbody');
const careerTbody    = document.getElementById('career-tbody');
const teamNameDisplay = document.getElementById('team-name-display');
const teamMeta       = document.getElementById('team-meta');

let allTeams = null;

function fmt(n, decimals = 3) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toFixed(decimals).replace(/^0\./, '.');
}

function fmtInt(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Math.round(n).toString();
}

function fmtFloat(n, dec = 1) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toFixed(dec);
}

async function loadData() {
  if (allTeams) return allTeams;
  const res = await fetch('js/teams.json');
  allTeams = await res.json();
  return allTeams;
}

function showError(msg) {
  errorText.textContent = msg;
  errorMsg.style.display = 'flex';
  resultsSection.classList.remove('visible');
}

function hideError() {
  errorMsg.style.display = 'none';
}

/**
 * Build the team dropdown from the data.
 * Groups entries by franchID so relocated teams share one option.
 * Falls back to teamID if franchID is not present.
 */
async function populateDropdown() {
  const data = await loadData();

  // Collect unique franchise display entries: prefer the most recent name
  // Key by franchID; store the most recent (highest yearID) team name
  const franchMap = new Map();
  data.forEach(row => {
    const key = row.franchID || row.teamID;
    const existing = franchMap.get(key);
    if (!existing || row.yearID > existing.yearID) {
      franchMap.set(key, { franchID: key, name: row.name, yearID: row.yearID });
    }
  });

  // Also build a separate map by teamID for searching
  // (dropdown value = franchID, search will use teamID entries that match franchID)

  const entries = Array.from(franchMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  entries.forEach(entry => {
    const opt = document.createElement('option');
    opt.value = entry.franchID;
    opt.textContent = entry.name;
    teamSelect.appendChild(opt);
  });
}

function renderResults(franchID, data) {
  hideError();

  // Filter rows for this franchise
  const rows = data.filter(r => (r.franchID || r.teamID) === franchID);

  if (rows.length === 0) {
    showError('No records found for the selected team.');
    return;
  }

  rows.sort((a, b) => a.yearID - b.yearID);

  // Use the most recent team name for display
  const latestRow = rows[rows.length - 1];
  teamNameDisplay.textContent = latestRow.name;
  teamMeta.textContent = `Seasons in database: ${rows[0].yearID}–${latestRow.yearID}  ·  ${rows.length} season${rows.length !== 1 ? 's' : ''}`;

  // --- Yearly table ---
  yearlyTbody.innerHTML = '';
  rows.forEach(row => {
    const g = Number(row.G) || 0;
    const w = Number(row.W) || 0;
    const l = Number(row.L) || 0;
    const winPct = g > 0 ? w / g : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.yearID}</td>
      <td>${row.teamID}</td>
      <td>${row.lgID}</td>
      <td>${fmtInt(g)}</td>
      <td>${fmtInt(w)}</td>
      <td>${fmtInt(l)}</td>
      <td>${fmt(winPct)}</td>
    `;
    yearlyTbody.appendChild(tr);
  });

  // --- Franchise averages ---
  const seasonCount = rows.length;
  const totalG = rows.reduce((s, r) => s + (Number(r.G) || 0), 0);
  const totalW = rows.reduce((s, r) => s + (Number(r.W) || 0), 0);
  const totalL = rows.reduce((s, r) => s + (Number(r.L) || 0), 0);

  const avgG = totalG / seasonCount;
  const avgW = totalW / seasonCount;
  const avgL = totalL / seasonCount;
  const avgWinPct = totalG > 0 ? totalW / totalG : 0;

  careerTbody.innerHTML = '';
  const ctr = document.createElement('tr');
  ctr.className = 'career-row';
  ctr.innerHTML = `
    <td>${seasonCount}</td>
    <td>${fmtFloat(avgG)}</td>
    <td>${fmtFloat(avgW)}</td>
    <td>${fmtFloat(avgL)}</td>
    <td>${fmt(avgWinPct)}</td>
    <td>${fmtInt(totalW)}</td>
    <td>${fmtInt(totalL)}</td>
  `;
  careerTbody.appendChild(ctr);

  resultsSection.classList.add('visible');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const franchID = teamSelect.value;

  if (!franchID) {
    showError('Please select a team from the dropdown.');
    return;
  }

  try {
    const data = await loadData();
    renderResults(franchID, data);
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

// Initialize dropdown on page load
loadData().then(populateDropdown).catch(err => {
  console.error('Failed to load teams data:', err);
});
