(function () {
const { EPSILON } = window.ModeloTransporte;
const { asignar, crearMatrizAsignaciones } = window.ModeloTransporte;

function getPenalty(costs) {
  const sorted = [...costs].sort((a, b) => a - b);
  return sorted.length > 1 ? sorted[1] - sorted[0] : sorted[0];
}

function selectCheapestColumn(problem, row, columns) {
  const minCost = Math.min(...columns.map((column) => problem.costs[row][column]));
  return columns
    .filter((column) => problem.costs[row][column] === minCost)
    .sort((a, b) => Math.min(problem.supply[row], problem.demand[b]) - Math.min(problem.supply[row], problem.demand[a]))[0];
}

function selectCheapestRow(problem, column, rows) {
  const minCost = Math.min(...rows.map((row) => problem.costs[row][column]));
  return rows
    .filter((row) => problem.costs[row][column] === minCost)
    .sort((a, b) => Math.min(problem.supply[b], problem.demand[column]) - Math.min(problem.supply[a], problem.demand[column]))[0];
}

function resolverVogel(problem) {
  const allocations = crearMatrizAsignaciones(problem);
  const steps = [];
  let iteration = 0;

  while (problem.supply.some((value) => value > EPSILON) && problem.demand.some((value) => value > EPSILON)) {
    iteration += 1;
    const candidates = [];

    for (let row = 0; row < problem.supply.length; row += 1) {
      if (problem.supply[row] <= EPSILON) continue;
      const columns = problem.demand.map((value, index) => value > EPSILON ? index : -1).filter((index) => index >= 0);
      if (columns.length === 0) continue;
      const costs = columns.map((column) => problem.costs[row][column]);
      const column = selectCheapestColumn(problem, row, columns);
      candidates.push({
        type: "fila",
        index: row,
        row,
        column,
        penalty: getPenalty(costs),
        cost: problem.costs[row][column],
      });
    }

    for (let column = 0; column < problem.demand.length; column += 1) {
      if (problem.demand[column] <= EPSILON) continue;
      const rows = problem.supply.map((value, index) => value > EPSILON ? index : -1).filter((index) => index >= 0);
      if (rows.length === 0) continue;
      const costs = rows.map((row) => problem.costs[row][column]);
      const row = selectCheapestRow(problem, column, rows);
      candidates.push({
        type: "columna",
        index: column,
        row,
        column,
        penalty: getPenalty(costs),
        cost: problem.costs[row][column],
      });
    }

    candidates.sort((a, b) =>
      b.penalty - a.penalty
      || a.cost - b.cost
      || (a.type === b.type ? a.index - b.index : a.type === "fila" ? -1 : 1),
    );
    const selected = candidates[0];
    if (!selected) break;

    const quantity = Math.min(problem.supply[selected.row], problem.demand[selected.column]);
    asignar(problem, selected.row, selected.column, quantity, allocations);
    steps.push({
      ...selected,
      quantity,
      iteration,
      remainingPenalty: selected.penalty,
    });
  }
  return { allocations, steps };
}

window.MetodoVogel = { resolver: resolverVogel };
})();
