(function () {
const { EPSILON } = window.ModeloTransporte;
const { asignar, crearMatrizAsignaciones } = window.ModeloTransporte;

function resolverEsquinaNoroeste(problem) {
  const allocations = crearMatrizAsignaciones(problem);
  const steps = [];
  let row = 0;
  let column = 0;

  while (row < problem.supply.length && column < problem.demand.length) {
    if (problem.supply[row] <= EPSILON) {
      row += 1;
      continue;
    }
    if (problem.demand[column] <= EPSILON) {
      column += 1;
      continue;
    }
    const quantity = Math.min(problem.supply[row], problem.demand[column]);
    asignar(problem, row, column, quantity, allocations);
    steps.push({ row, column, quantity, cost: problem.costs[row][column] });
  }
  return { allocations, steps };
}

window.MetodoEsquinaNoroeste = { resolver: resolverEsquinaNoroeste };
})();
