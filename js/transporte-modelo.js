(function () {
const EPSILON = 1e-9;
const MAX_DIMENSION = 12;

function createInitialState() {
  return {
    origins: ["Origen 1", "Origen 2", "Origen 3"],
    destinations: ["Destino 1", "Destino 2", "Destino 3"],
    supply: [100, 100, 100],
    demand: [100, 100, 100],
    costs: Array.from({ length: 3 }, () => [0, 0, 0]),
  };
}

function displayName(name, fallback) {
  return name.trim() || fallback;
}

function validateState(state) {
  if (state.origins.length === 0 || state.destinations.length === 0) {
    throw new Error("La tabla debe tener al menos un origen y un destino.");
  }

  for (let row = 0; row < state.supply.length; row += 1) {
    if (!Number.isFinite(state.supply[row]) || state.supply[row] < 0) {
      throw new Error(`Ingresá una oferta válida y no negativa para ${displayName(state.origins[row], `Origen ${row + 1}`)}.`);
    }
  }
  for (let column = 0; column < state.demand.length; column += 1) {
    if (!Number.isFinite(state.demand[column]) || state.demand[column] < 0) {
      throw new Error(`Ingresá una demanda válida y no negativa para ${displayName(state.destinations[column], `Destino ${column + 1}`)}.`);
    }
  }
  for (let row = 0; row < state.costs.length; row += 1) {
    for (let column = 0; column < state.costs[row].length; column += 1) {
      if (!Number.isFinite(state.costs[row][column]) || state.costs[row][column] < 0) {
        throw new Error(`Ingresá un costo válido y no negativo en ${displayName(state.origins[row], `Origen ${row + 1}`)} → ${displayName(state.destinations[column], `Destino ${column + 1}`)}.`);
      }
    }
  }

  const totalSupply = state.supply.reduce((sum, value) => sum + value, 0);
  const totalDemand = state.demand.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(totalSupply) || !Number.isFinite(totalDemand)) {
    throw new Error("La suma de la oferta o la demanda supera el rango numérico permitido.");
  }
}

function createBalancedProblem(state) {
  const problem = {
    origins: state.origins.map((name, index) => displayName(name, `Origen ${index + 1}`)),
    destinations: state.destinations.map((name, index) => displayName(name, `Destino ${index + 1}`)),
    supply: [...state.supply],
    demand: [...state.demand],
    costs: state.costs.map((row) => [...row]),
    dummyOrigin: false,
    dummyDestination: false,
  };
  const totalSupply = problem.supply.reduce((sum, value) => sum + value, 0);
  const totalDemand = problem.demand.reduce((sum, value) => sum + value, 0);
  const difference = totalSupply - totalDemand;

  if (difference > EPSILON) {
    problem.destinations.push("Destino ficticio");
    problem.demand.push(difference);
    problem.costs.forEach((row) => row.push(0));
    problem.dummyDestination = true;
  } else if (difference < -EPSILON) {
    problem.origins.push("Origen ficticio");
    problem.supply.push(-difference);
    problem.costs.push(Array(problem.destinations.length).fill(0));
    problem.dummyOrigin = true;
  }
  return problem;
}

function makeAllocations(problem) {
  return Array.from({ length: problem.supply.length }, () => Array(problem.demand.length).fill(0));
}

function allocate(problem, row, column, quantity, allocations) {
  if (quantity <= EPSILON) return;
  allocations[row][column] += quantity;
  problem.supply[row] -= quantity;
  problem.demand[column] -= quantity;
  if (Math.abs(problem.supply[row]) <= EPSILON) problem.supply[row] = 0;
  if (Math.abs(problem.demand[column]) <= EPSILON) problem.demand[column] = 0;
}

window.ModeloTransporte = {
  EPSILON,
  MAX_DIMENSION,
  crearEstadoInicial: createInitialState,
  validarEstado: validateState,
  crearProblemaBalanceado: createBalancedProblem,
  crearMatrizAsignaciones: makeAllocations,
  asignar: allocate,
};
})();
