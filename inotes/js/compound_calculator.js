(() => {
  const form = document.getElementById("compound-form");
  const result = document.getElementById("calc-result");
  const canvas = document.getElementById("growth-chart");
  const context = canvas ? canvas.getContext("2d") : null;

  if (!form || !result || !canvas || !context) {
    return;
  }

  let lastSeries = [];

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const computeSeries = ({ startAge, endAge, returnRate, monthly }) => {
    const months = Math.max(0, Math.round((endAge - startAge) * 12));
    const monthlyRate = returnRate / 100 / 12;
    let balance = 0;
    const series = [balance];

    for (let i = 1; i <= months; i += 1) {
      balance = balance * (1 + monthlyRate) + monthly;
      series.push(balance);
    }

    return series;
  };

  const resizeCanvas = () => {
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : canvas.width;
    const height = 260;
    canvas.width = Math.max(320, Math.floor(width));
    canvas.height = height;
  };

  const drawChart = (series) => {
    if (!series.length) {
      return;
    }

    resizeCanvas();

    const padding = { top: 20, right: 24, bottom: 30, left: 50 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;
    const maxValue = Math.max(...series);

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "#E9CEF2";
    context.lineWidth = 1;
    context.beginPath();
    context.rect(padding.left, padding.top, width, height);
    context.stroke();

    const tickCount = 4;
    context.fillStyle = "#6B4E71";
    context.font = "12px 'Fredoka', sans-serif";

    for (let i = 0; i <= tickCount; i += 1) {
      const y = padding.top + (height * i) / tickCount;
      context.strokeStyle = "rgba(233, 206, 242, 0.5)";
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(padding.left + width, y);
      context.stroke();

      const value = maxValue - (maxValue * i) / tickCount;
      context.fillText(formatMoney(value), 8, y + 4);
    }

    context.strokeStyle = "#8B5A9F";
    context.lineWidth = 3;
    context.beginPath();
    series.forEach((value, index) => {
      const x = padding.left + (width * index) / (series.length - 1 || 1);
      const y = padding.top + height - (value / maxValue) * height;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
  };

  const update = () => {
    const startAge = Number(form.elements["start-age"].value);
    const endAge = Number(form.elements["end-age"].value);
    const returnRate = Number(form.elements["return-rate"].value);
    const monthly = Number(form.elements["monthly-contribution"].value);

    if (Number.isNaN(startAge) || Number.isNaN(endAge) || Number.isNaN(returnRate) || Number.isNaN(monthly)) {
      result.textContent = "Please enter valid numbers.";
      return;
    }

    if (endAge <= startAge) {
      result.textContent = "End age needs to be higher than start age.";
      return;
    }

    const series = computeSeries({ startAge, endAge, returnRate, monthly });
    lastSeries = series;
    const total = series[series.length - 1];

    result.textContent = `Estimated total at age ${endAge}: ${formatMoney(total)}.`;
    drawChart(series);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });

  window.addEventListener("resize", () => {
    if (lastSeries.length) {
      drawChart(lastSeries);
    }
  });

  update();
})();
