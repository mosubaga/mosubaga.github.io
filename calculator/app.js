const go = new Go();
let wasmReady = false;
let expression = "";
let lastResultShown = false;

WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
  .then((result) => {
    go.run(result.instance);
    wasmReady = true;
  })
  .catch((err) => {
    console.error("Failed to load WASM module:", err);
    setDisplay("WASM load error");
  });

function setDisplay(text) {
  document.getElementById("display").textContent = text;
}

function setExprLine(text) {
  document.getElementById("expr-line").textContent = text;
}

function refreshDisplay() {
  setExprLine(expression || "0");
  if (!lastResultShown) {
    setDisplay(expression || "0");
  }
}

function append(token) {
  // If a result is currently shown and the user starts a new number,
  // start fresh; if they continue with an operator, keep chaining.
  if (lastResultShown) {
    lastResultShown = false;
    if (!"+-*/".includes(token)) {
      expression = "";
    }
  }
  expression += token;
  refreshDisplay();
}

function clearAll() {
  expression = "";
  lastResultShown = false;
  refreshDisplay();
  setDisplay("0");
}

function backspace() {
  if (lastResultShown) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  refreshDisplay();
}

function calculate() {
  if (!wasmReady) {
    setDisplay("Loading...");
    return;
  }
  if (!expression) {
    return;
  }

  const resultJson = evaluate(expression); // exported Go function
  let data;
  try {
    data = JSON.parse(resultJson);
  } catch (e) {
    setDisplay("Parse error");
    console.error(e, resultJson);
    return;
  }

  if (data.error) {
    setDisplay("Error: " + data.error);
    lastResultShown = false;
    return;
  }

  setDisplay(String(data.result));
  expression = String(data.result);
  lastResultShown = true;
}

function handleButton(event) {
  const btn = event.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === "clear") {
    clearAll();
  } else if (action === "backspace") {
    backspace();
  } else if (action === "equals") {
    calculate();
  } else if (value !== undefined) {
    append(value);
  }
}

function handleKeydown(event) {
  const key = event.key;

  if (/[0-9.]/.test(key)) {
    append(key);
  } else if ("+-*/()".includes(key)) {
    append(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("keypad").addEventListener("click", handleButton);
  document.getElementById("functions").addEventListener("click", handleButton);
  document.addEventListener("keydown", handleKeydown);
  clearAll();
});
