(function () {
    'use strict';

    // ================================================================
    // State
    // ================================================================
    let data = [];          // 2-D array of strings
    let fileName = '';
    let numRows = 0;
    let numCols = 0;
    let activeRow = 0;
    let activeCol = 0;
    let isEditing = false;
    let editOriginal = '';  // value before editing started (for Escape)

    // ================================================================
    // DOM refs
    // ================================================================
    const btnOpen        = document.getElementById('btn-open');
    const btnSave        = document.getElementById('btn-save');
    const fileInput      = document.getElementById('file-input');
    const btnOpenWelcome = document.getElementById('btn-open-welcome');
    const fileNameEl     = document.getElementById('file-name');
    const nameBox        = document.getElementById('name-box');
    const formulaInput   = document.getElementById('formula-input');
    const dropOverlay    = document.getElementById('drop-overlay');
    const welcomeScreen  = document.getElementById('welcome-screen');
    const gridWrapper    = document.getElementById('grid-wrapper');
    const gridScroll     = document.getElementById('grid-scroll');
    const gridHead       = document.getElementById('grid-head');
    const gridBody       = document.getElementById('grid-body');
    const statusInfo     = document.getElementById('status-info');
    const statusCell     = document.getElementById('status-cell');

    // ================================================================
    // Utilities
    // ================================================================

    /** Convert 0-based column index to spreadsheet letter (0→A, 26→AA …) */
    function colName(idx) {
        let name = '';
        let n = idx + 1;
        while (n > 0) {
            n--;
            name = String.fromCharCode(65 + (n % 26)) + name;
            n = Math.floor(n / 26);
        }
        return name;
    }

    function cellAddress(r, c) {
        return colName(c) + (r + 1);
    }

    function escHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ================================================================
    // CSV Parser  (RFC 4180 compliant)
    // ================================================================
    function parseCSV(text) {
        // Normalise line endings
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const result = [];
        let i = 0;
        const n = text.length;

        while (i <= n) {
            const row = [];

            // Parse every field in the current row
            while (true) {
                if (i < n && text[i] === '"') {
                    // Quoted field
                    i++; // skip opening quote
                    let field = '';
                    while (i < n) {
                        if (text[i] === '"') {
                            if (i + 1 < n && text[i + 1] === '"') {
                                field += '"';
                                i += 2;
                            } else {
                                i++; // skip closing quote
                                break;
                            }
                        } else {
                            field += text[i++];
                        }
                    }
                    row.push(field);
                } else {
                    // Unquoted field
                    let field = '';
                    while (i < n && text[i] !== ',' && text[i] !== '\n') {
                        field += text[i++];
                    }
                    row.push(field);
                }

                if (i >= n || text[i] === '\n') break; // end of row
                i++; // skip comma, read next field
            }

            // Skip newline
            if (i < n && text[i] === '\n') i++;

            result.push(row);

            if (i >= n) break;
        }

        // Remove a trailing empty row that parsers sometimes add
        while (result.length > 0) {
            const last = result[result.length - 1];
            if (last.length === 0 || (last.length === 1 && last[0] === '')) {
                result.pop();
            } else {
                break;
            }
        }

        return result;
    }

    // ================================================================
    // CSV Serialiser
    // ================================================================
    function serializeCSV(rows) {
        return rows.map(function (row) {
            return row.map(function (cell) {
                if (/[,"\n\r]/.test(cell)) {
                    return '"' + cell.replace(/"/g, '""') + '"';
                }
                return cell;
            }).join(',');
        }).join('\r\n') + '\r\n';
    }

    /** Ensure every row has the same number of columns */
    function normalizeData(arr) {
        if (arr.length === 0) return [['']];
        const maxCols = arr.reduce(function (m, r) { return Math.max(m, r.length); }, 0) || 1;
        return arr.map(function (row) {
            const r = row.slice();
            while (r.length < maxCols) r.push('');
            return r;
        });
    }

    // ================================================================
    // Grid Rendering
    // ================================================================
    function renderGrid() {
        numRows = data.length;
        numCols = data[0] ? data[0].length : 0;

        // --- Header row ---
        let headHTML = '<tr><th class="corner"></th>';
        for (let c = 0; c < numCols; c++) {
            headHTML += '<th class="col-header" data-col="' + c + '">' + colName(c) + '</th>';
        }
        headHTML += '</tr>';
        gridHead.innerHTML = headHTML;

        // --- Body rows ---
        let bodyHTML = '';
        for (let r = 0; r < numRows; r++) {
            bodyHTML += '<tr>';
            bodyHTML += '<th class="row-header" data-row="' + r + '">' + (r + 1) + '</th>';
            for (let c = 0; c < numCols; c++) {
                const val = escHtml(data[r][c] || '');
                bodyHTML += '<td class="cell" data-row="' + r + '" data-col="' + c + '">' + val + '</td>';
            }
            bodyHTML += '</tr>';
        }
        gridBody.innerHTML = bodyHTML;

        // Show grid, hide welcome
        welcomeScreen.classList.add('hidden');
        gridWrapper.classList.remove('hidden');
        btnSave.disabled = false;
        formulaInput.disabled = false;

        setActiveCell(0, 0);
        gridScroll.focus();
    }

    function getCellEl(r, c) {
        return gridBody.querySelector('td[data-row="' + r + '"][data-col="' + c + '"]');
    }

    // ================================================================
    // Cell Selection
    // ================================================================
    function setActiveCell(r, c) {
        if (isEditing) commitEdit();

        r = Math.max(0, Math.min(r, numRows - 1));
        c = Math.max(0, Math.min(c, numCols - 1));

        // Remove old highlights
        var prev = gridBody.querySelector('.cell.active');
        if (prev) prev.classList.remove('active');
        gridHead.querySelectorAll('.col-header.active').forEach(function (el) { el.classList.remove('active'); });
        gridBody.querySelectorAll('.row-header.active').forEach(function (el) { el.classList.remove('active'); });

        activeRow = r;
        activeCol = c;

        var cell = getCellEl(r, c);
        if (cell) {
            cell.classList.add('active');
            cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }

        var colHdr = gridHead.querySelector('th[data-col="' + c + '"]');
        if (colHdr) colHdr.classList.add('active');

        var rowHdr = gridBody.querySelector('th[data-row="' + r + '"]');
        if (rowHdr) rowHdr.classList.add('active');

        nameBox.textContent = cellAddress(r, c);
        formulaInput.value = data[r][c] || '';

        updateStatus();
    }

    function updateStatus() {
        if (data.length === 0) {
            statusInfo.textContent = 'Ready';
            statusCell.textContent = '';
            return;
        }
        statusInfo.textContent = numRows + ' rows \u00D7 ' + numCols + ' columns';
        var val = (data[activeRow] && data[activeRow][activeCol]) || '';
        statusCell.textContent = val ? '\u201C' + val + '\u201D' : '';
    }

    // ================================================================
    // Editing  (formula bar as the editor)
    // ================================================================
    function startEdit(initialChar) {
        if (data.length === 0) return;

        editOriginal = (data[activeRow] && data[activeRow][activeCol]) || '';
        isEditing = true;

        // Visual cue on the cell
        var cell = getCellEl(activeRow, activeCol);
        if (cell) cell.classList.add('editing');

        formulaInput.disabled = false;

        if (typeof initialChar === 'string') {
            formulaInput.value = initialChar;
        } else {
            formulaInput.value = editOriginal;
        }

        formulaInput.focus();

        if (typeof initialChar === 'string') {
            var len = formulaInput.value.length;
            formulaInput.setSelectionRange(len, len);
        } else {
            formulaInput.select();
        }
    }

    function commitEdit() {
        if (!isEditing) return;

        var value = formulaInput.value;
        data[activeRow][activeCol] = value;

        var cell = getCellEl(activeRow, activeCol);
        if (cell) {
            cell.textContent = value;
            cell.classList.remove('editing');
        }

        isEditing = false;
        updateStatus();
    }

    function cancelEdit() {
        if (!isEditing) return;

        formulaInput.value = editOriginal;

        var cell = getCellEl(activeRow, activeCol);
        if (cell) cell.classList.remove('editing');

        isEditing = false;
    }

    // ================================================================
    // File Operations
    // ================================================================
    function loadFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Please open a CSV file (.csv).');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            data = normalizeData(parseCSV(e.target.result));
            fileName = file.name;
            fileNameEl.textContent = fileName;
            activeRow = 0;
            activeCol = 0;
            isEditing = false;
            renderGrid();
        };
        reader.onerror = function () {
            alert('Could not read file.');
        };
        reader.readAsText(file, 'UTF-8');
    }

    function saveFile() {
        if (isEditing) commitEdit();
        if (data.length === 0) return;

        var csv = serializeCSV(data);
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    // ================================================================
    // Event Listeners
    // ================================================================

    // --- File open ---
    btnOpen.addEventListener('click', function () { fileInput.click(); });
    btnOpenWelcome.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            loadFile(e.target.files[0]);
            fileInput.value = '';
        }
    });

    // --- Save ---
    btnSave.addEventListener('click', saveFile);

    // --- Drag and drop (whole window) ---
    var dragDepth = 0;

    window.addEventListener('dragenter', function (e) {
        e.preventDefault();
        dragDepth++;
        dropOverlay.classList.remove('hidden');
    });

    window.addEventListener('dragleave', function (_e) {
        dragDepth--;
        if (dragDepth <= 0) {
            dragDepth = 0;
            dropOverlay.classList.add('hidden');
        }
    });

    window.addEventListener('dragover', function (e) {
        e.preventDefault(); // required to allow drop
    });

    window.addEventListener('drop', function (e) {
        e.preventDefault();
        dragDepth = 0;
        dropOverlay.classList.add('hidden');
        var files = e.dataTransfer && e.dataTransfer.files;
        if (files && files[0]) loadFile(files[0]);
    });

    // --- Grid: click to select ---
    gridBody.addEventListener('mousedown', function (e) {
        var cell = e.target.closest('.cell');
        if (!cell) return;
        var r = parseInt(cell.dataset.row, 10);
        var c = parseInt(cell.dataset.col, 10);
        setActiveCell(r, c);     // commits edit if in progress
        gridScroll.focus();
    });

    // --- Grid: double-click to edit ---
    gridBody.addEventListener('dblclick', function (e) {
        var cell = e.target.closest('.cell');
        if (!cell) return;
        var r = parseInt(cell.dataset.row, 10);
        var c = parseInt(cell.dataset.col, 10);
        setActiveCell(r, c);
        startEdit();
    });

    // --- Formula bar: clicking it starts editing ---
    formulaInput.addEventListener('mousedown', function () {
        if (!isEditing && data.length > 0) {
            // Let the default focus happen, then start edit
            requestAnimationFrame(function () { startEdit(); });
        }
    });

    // --- Formula bar: commit / cancel ---
    formulaInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit();
            setActiveCell(activeRow + 1, activeCol);
            gridScroll.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
            gridScroll.focus();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            commitEdit();
            setActiveCell(activeRow, activeCol + (e.shiftKey ? -1 : 1));
            gridScroll.focus();
        }
    });

    // --- Keyboard navigation (when grid has focus, not formula bar) ---
    document.addEventListener('keydown', function (e) {
        if (data.length === 0) return;

        // Let formula bar handle its own keys
        if (document.activeElement === formulaInput) return;

        var key = e.key;
        var ctrl = e.ctrlKey || e.metaKey;
        var shift = e.shiftKey;

        // Ctrl+S → save
        if (ctrl && key.toLowerCase() === 's') {
            e.preventDefault();
            saveFile();
            return;
        }

        // Ctrl+O → open
        if (ctrl && key.toLowerCase() === 'o') {
            e.preventDefault();
            fileInput.click();
            return;
        }

        if (isEditing) return; // formula bar handles the rest

        switch (key) {
            case 'ArrowUp':
                e.preventDefault();
                setActiveCell(activeRow - 1, activeCol);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setActiveCell(activeRow + 1, activeCol);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                setActiveCell(activeRow, activeCol - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                setActiveCell(activeRow, activeCol + 1);
                break;
            case 'Tab':
                e.preventDefault();
                setActiveCell(activeRow, activeCol + (shift ? -1 : 1));
                break;
            case 'Enter':
                e.preventDefault();
                setActiveCell(activeRow + (shift ? -1 : 1), activeCol);
                break;
            case 'F2':
                e.preventDefault();
                startEdit();
                break;
            case 'Delete':
                e.preventDefault();
                data[activeRow][activeCol] = '';
                var cellDel = getCellEl(activeRow, activeCol);
                if (cellDel) cellDel.textContent = '';
                formulaInput.value = '';
                updateStatus();
                break;
            case 'Backspace':
                e.preventDefault();
                data[activeRow][activeCol] = '';
                var cellBs = getCellEl(activeRow, activeCol);
                if (cellBs) cellBs.textContent = '';
                formulaInput.value = '';
                updateStatus();
                break;
            default:
                // Typing a printable character starts editing with that character
                if (key.length === 1 && !ctrl) {
                    e.preventDefault();
                    startEdit(key);
                }
        }
    });

    // Commit if user clicks outside the grid/formula bar while editing
    document.addEventListener('mousedown', function (e) {
        if (!isEditing) return;
        if (e.target.closest('#grid-wrapper') || e.target === formulaInput) return;
        commitEdit();
    });

}());
