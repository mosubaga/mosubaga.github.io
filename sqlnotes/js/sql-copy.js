(function () {
  const sqlKeywords = new Set([
    "ADD",
    "ALL",
    "ALTER",
    "ANALYZE",
    "AND",
    "AS",
    "ASC",
    "BY",
    "CASE",
    "CHECK",
    "COLUMN",
    "CONSTRAINT",
    "FALSE",
    "CREATE",
    "DATABASE",
    "DATE",
    "DECIMAL",
    "DEFAULT",
    "DELETE",
    "DESC",
    "DISTINCT",
    "DROP",
    "EXEC",
    "EXISTS",
    "EXPLAIN",
    "FOREIGN",
    "FROM",
    "GRANT",
    "GROUP",
    "HAVING",
    "IN",
    "INDEX",
    "INNER",
    "INSERT",
    "ISODATE",
    "INT",
    "INTEGER",
    "INTO",
    "JOIN",
    "KEY",
    "LEFT",
    "LIKE",
    "LIMIT",
    "LOGIN",
    "MATERIALIZED",
    "MODIFY",
    "NOT",
    "NULL",
    "OBJECTID",
    "OFFSET",
    "ON",
    "OPTION",
    "OR",
    "ORDER",
    "PASSWORD",
    "PRIMARY",
    "PRIVILEGES",
    "PROCEDURE",
    "PUBLIC",
    "REFERENCES",
    "REFRESH",
    "RENAME",
    "REVOKE",
    "ROLE",
    "SCHEMA",
    "SELECT",
    "SET",
    "SHOW",
    "TABLE",
    "TABLES",
    "TO",
    "TRUE",
    "TYPE",
    "UNION",
    "UNIQUE",
    "UPDATE",
    "USE",
    "USING",
    "VALUES",
    "VARCHAR",
    "VIEW",
    "WHERE",
    "WITH"
  ]);

  const sqlFunctions = new Set([
    "AGGREGATE",
    "COUNT",
    "COUNTDOCUMENTS",
    "CREATEINDEX",
    "DISTINCT",
    "ESTIMATEDDOCUMENTCOUNT",
    "FIND",
    "FINDONE",
    "LIMIT",
    "LOWER",
    "SKIP",
    "SORT",
    "SUM",
    "UPPER",
    "YEAR"
  ]);

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function tokenClass(token) {
    const upper = token.toUpperCase();

    if (token.startsWith("--") || token.startsWith("//") || token.startsWith("/*")) {
      return "sql-comment";
    }

    if (token.startsWith("'") || token.startsWith("\"") || token.startsWith("`")) {
      return "sql-string";
    }

    if (/^\d/.test(token)) {
      return "sql-number";
    }

    if (token.startsWith("$") || sqlKeywords.has(upper)) {
      return "sql-keyword";
    }

    if (sqlFunctions.has(upper)) {
      return "sql-function";
    }

    if (/^[(),.;*<>!=+\-/%:]+$/.test(token)) {
      return "sql-operator";
    }

    return "";
  }

  function highlightSql(source) {
    const tokenPattern = /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/|`[^`]*`|'(?:''|[^'])*'|"(?:\"\"|[^"])*"|\$[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[()[\]{},.;*<>!=+\-/%:]+)/g;
    let highlighted = "";
    let lastIndex = 0;
    let match;

    while ((match = tokenPattern.exec(source)) !== null) {
      const token = match[0];
      const className = tokenClass(token);

      highlighted += escapeHtml(source.slice(lastIndex, match.index));
      highlighted += className
        ? `<span class="${className}">${escapeHtml(token)}</span>`
        : escapeHtml(token);
      lastIndex = tokenPattern.lastIndex;
    }

    highlighted += escapeHtml(source.slice(lastIndex));
    return highlighted;
  }

  function copyText(text, button) {
    const resetButton = () => {
      button.textContent = "copied";
      button.classList.add("is-copied");
      window.setTimeout(() => {
        button.textContent = "copy";
        button.classList.remove("is-copied");
      }, 1400);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(resetButton);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    resetButton();
  }

  function enhanceCodeBlock(pre) {
    if (pre.closest(".cc-code-block")) {
      return;
    }

    const source = pre.textContent.trim();
    const wrapper = document.createElement("div");
    const button = document.createElement("button");

    wrapper.className = "cc-code-block";
    button.type = "button";
    button.className = "cc-copy-button";
    button.textContent = "copy";
    button.addEventListener("click", () => copyText(source, button));

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(button);
    wrapper.appendChild(pre);
    pre.classList.add("sql-highlight");
    pre.innerHTML = highlightSql(source);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("pre").forEach(enhanceCodeBlock);
  });
})();
