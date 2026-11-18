(function () {
const { EPSILON } = window.ModeloTransporte;
const { asignar, crearMatrizAsignaciones } = window.ModeloTransporte;

function resolverCostoMinimo(problem) {
  const allocations = crearMatrizAsignaciones(problem);
  const steps = [];

  while (problem.supply.some((value) => value > EPSILON) && problem.demand.some((value) => value > EPSILON)) {
    let selected = null;
    for (let row = 0; row < problem.supply.length; row += 1) {
      if (problem.supply[row] <= EPSILON) continue;
      for (let column = 0; column < problem.demand.length; column += 1) {
        if (problem.demand[column] <= EPSILON) continue;
        const cost = problem.costs[row][column];
        if (!selected || cost < selected.cost) selected = { row, column, cost };
      }
    }
    if (!selected) break;
    const quantity = Math.min(problem.supply[selected.row], problem.demand[selected.column]);
    asignar(problem, selected.row, selected.column, quantity, allocations);
    steps.push({ ...selected, quantity });
  }
  return { allocations, steps };
}

window.MetodoCostoMinimo = { resolver: resolverCostoMinimo };
})();
