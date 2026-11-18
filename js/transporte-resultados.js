(function () {
const EPSILON = 1e-9;

const methodNames = {
  northwest: "Esquina Noroeste",
  "least-cost": "Costo Mínimo",
  vogel: "Aproximación de Vogel",
};

function formatNumber(value) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 4 }).format(value);
}

function appendHeaderCell(row, text) {
  const cell = document.createElement("th");
  cell.scope = "col";
  cell.textContent = text;
  row.append(cell);
}

function makeTable(headers, rows, className = "result-table") {
  const table = document.createElement("table");
  table.className = className;
  const head = table.createTHead();
  const headerRow = head.insertRow();
  headers.forEach((header) => appendHeaderCell(headerRow, header));
  const body = table.createTBody();
  rows.forEach((values) => {
    const row = body.insertRow();
    values.forEach((value) => {
      const cell = row.insertCell();
      cell.textContent = String(value);
    });
  });
  return table;
}

function createResultBlock(title, child) {
  const heading = document.createElement("h3");
  heading.textContent = title;
  const block = document.createElement("div");
  block.className = "result-block";
  block.append(heading, child);
  return block;
}

function createStepsList(problem, steps, method) {
  const list = document.createElement("ol");
  list.className = "steps-list";
  steps.forEach((step) => {
    const item = document.createElement("li");
    if (method === "vogel") {
      item.textContent = `Iteración ${step.iteration}: se seleccionó ${step.type} ${step.index + 1} (penalización ${formatNumber(step.remainingPenalty)}); asignar ${formatNumber(step.quantity)} a ${problem.origins[step.row]} → ${problem.destinations[step.column]} con costo ${formatNumber(step.cost)}.`;
    } else {
      item.textContent = `${problem.origins[step.row]} → ${problem.destinations[step.column]}: ${formatNumber(step.quantity)} unidades × ${formatNumber(step.cost)} = ${formatNumber(step.quantity * step.cost)}.`;
    }
    list.append(item);
  });
  return list;
}

function clearResult(resultsElement) {
  resultsElement.hidden = true;
  document.querySelector("#result-content").replaceChildren();
}

function renderComparison(comparison, selectedMethod) {
  const { results, selected, bestCost } = comparison;
  const comparisonRows = results.map((result) => {
    const difference = Math.max(0, result.totalCost - bestCost);
    const percentage = bestCost > EPSILON
      ? `${formatNumber((difference / bestCost) * 100)}%`
      : difference <= EPSILON ? "0%" : "No aplica";
    const status = result.isBest ? "Menor costo" : `+${formatNumber(difference)} · ${percentage}`;
    return [result.name, formatNumber(result.totalCost), status];
  });
  const table = makeTable(
    ["Método", "Costo total", "Diferencia frente al mejor"],
    comparisonRows,
  );

  results.forEach((result, index) => {
    const row = table.tBodies[0].rows[index];
    if (result.isBest) row.classList.add("comparison-best");
    if (result.method === selectedMethod) row.classList.add("comparison-selected");
  });

  const tableWrap = document.createElement("div");
  tableWrap.className = "result-table-wrap";
  tableWrap.append(table);

  const evaluation = document.createElement("p");
  evaluation.className = `viability-note${selected.isBest ? " viability-best" : ""}`;
  if (selected.isBest) {
    const tiedMethods = results.filter((result) => result.isBest).length;
    evaluation.textContent = tiedMethods > 1
      ? `El método elegido está entre los de menor costo (empate en ${formatNumber(bestCost)}).`
      : `El método elegido obtuvo el menor costo de los comparados: ${formatNumber(bestCost)}.`;
  } else {
    const difference = selected.totalCost - bestCost;
    const percentage = bestCost > EPSILON
      ? ` (${formatNumber((difference / bestCost) * 100)}%)`
      : "";
    const bestMethods = results.filter((result) => result.isBest).map((result) => result.name).join(" y ");
    evaluation.textContent = `La solución es factible, pero no es la más económica: cuesta ${formatNumber(difference)}${percentage} más que ${bestMethods}.`;
  }

  const limitation = document.createElement("p");
  limitation.className = "comparison-limitation";
  limitation.textContent = "La comparación es entre soluciones iniciales factibles: el menor costo observado no garantiza que sea el óptimo global.";

  const comparisonContent = document.createElement("div");
  comparisonContent.append(tableWrap, evaluation, limitation);
  return createResultBlock("Comparación y viabilidad relativa", comparisonContent);
}

function renderResults(problem, solution, method, resultsElement, comparison) {
  const { allocations, steps } = solution;
  const content = document.querySelector("#result-content");
  const resultRows = [];
  let totalCost = 0;

  for (let row = 0; row < allocations.length; row += 1) {
    for (let column = 0; column < allocations[row].length; column += 1) {
      const quantity = allocations[row][column];
      if (quantity <= EPSILON) continue;
      const cost = problem.costs[row][column];
      const subtotal = quantity * cost;
      totalCost += subtotal;
      resultRows.push([
        problem.origins[row],
        problem.destinations[column],
        formatNumber(quantity),
        formatNumber(cost),
        formatNumber(subtotal),
      ]);
    }
  }

  content.replaceChildren();
  const summary = document.createElement("p");
  summary.className = "result-summary";
  summary.textContent = `Se realizaron ${resultRows.length} asignaciones. Cada cantidad satisface las ofertas y demandas del problema equilibrado.`;
  content.append(summary);
  content.append(renderComparison(comparison, method));

  const matrixRows = allocations.map((allocation, row) => [
    problem.origins[row],
    ...allocation.map((quantity, column) =>
      `${formatNumber(quantity)}  ·  costo ${formatNumber(problem.costs[row][column])}${quantity > EPSILON ? " ✓" : ""}`,
    ),
  ]);
  const matrix = makeTable(["Origen \\ Destino", ...problem.destinations], matrixRows);
  matrixRows.forEach((values, rowIndex) => {
    if (problem.dummyOrigin && rowIndex === matrixRows.length - 1) {
      matrix.tBodies[0].rows[rowIndex].classList.add("dummy-cell");
    }
    allocations[rowIndex].forEach((quantity, columnIndex) => {
      if (quantity > EPSILON) {
        matrix.tBodies[0].rows[rowIndex].cells[columnIndex + 1].classList.add("allocation");
      }
    });
  });
  Array.from(matrix.tHead.rows[0].cells).forEach((cell, index) => {
    if (problem.dummyDestination && index === matrix.tHead.rows[0].cells.length - 1) cell.classList.add("dummy-cell");
  });
  const matrixWrap = document.createElement("div");
  matrixWrap.className = "result-table-wrap";
  matrixWrap.append(matrix);
  content.append(createResultBlock("Asignaciones por celda", matrixWrap));

  const detailTable = makeTable(
    ["Origen", "Destino", "Cantidad", "Costo unitario", "Subtotal"],
    resultRows,
  );
  const detailWrap = document.createElement("div");
  detailWrap.className = "result-table-wrap";
  detailWrap.append(detailTable);
  content.append(createResultBlock("Detalle de costos", detailWrap));

  const costTotal = document.createElement("div");
  costTotal.className = "cost-total";
  costTotal.textContent = `Costo total de la solución inicial: ${formatNumber(totalCost)}`;
  content.append(costTotal);

  const stepsTitle = method === "vogel" ? "Cálculo de penalizaciones" : "Secuencia de asignaciones";
  content.append(createResultBlock(stepsTitle, createStepsList(problem, steps, method)));

  document.querySelector("#result-method").textContent = methodNames[method];
  resultsElement.hidden = false;
}

window.ResultadosTransporte = { limpiar: clearResult, mostrar: renderResults };
})();
