(function () {
  const { EPSILON, validarEstado, crearProblemaBalanceado } = window.ModeloTransporte;
  const { limpiar, mostrar } = window.ResultadosTransporte;
  const elementos = {
    botonResolver: document.querySelector("#solve"),
    metodo: document.querySelector("#method"),
    error: document.querySelector("#error-message"),
    resultados: document.querySelector("#results"),
  };

  const nombresMetodos = {
    northwest: "Esquina Noroeste",
    "least-cost": "Costo Mínimo",
    vogel: "Aproximación de Vogel",
  };

  function calcularCosto(problem, allocations) {
    let total = 0;
    for (let row = 0; row < allocations.length; row += 1) {
      for (let column = 0; column < allocations[row].length; column += 1) {
        const subtotal = allocations[row][column] * problem.costs[row][column];
        if (!Number.isFinite(subtotal) || !Number.isFinite(total + subtotal)) {
          throw new Error("El costo total supera el rango numérico permitido; ingresá valores más pequeños.");
        }
        total += subtotal;
      }
    }
    return total;
  }

  function compararMetodos(estado, metodos, metodoElegido) {
    const resultados = Object.entries(metodos).map(([metodo, resolver]) => {
      const problem = crearProblemaBalanceado(estado);
      const solution = resolver(problem);
      const incompleto = problem.supply.some((value) => value > EPSILON)
        || problem.demand.some((value) => value > EPSILON);

      if (incompleto) {
        throw new Error(`El método ${nombresMetodos[metodo]} no pudo completar una solución factible.`);
      }

      return {
        method: metodo,
        name: nombresMetodos[metodo],
        problem,
        solution,
        totalCost: calcularCosto(problem, solution.allocations),
      };
    });

    const bestCost = Math.min(...resultados.map((resultado) => resultado.totalCost));
    const comparacion = resultados.map((resultado) => ({
      ...resultado,
      isBest: Math.abs(resultado.totalCost - bestCost) <= EPSILON,
    }));
    const selected = comparacion.find((resultado) => resultado.method === metodoElegido);
    if (!selected) throw new Error("No se encontró el método seleccionado para comparar los resultados.");
    return { results: comparacion, selected, bestCost };
  }

  function limpiarError() {
    elementos.error.textContent = "";
    elementos.error.hidden = true;
  }

  function mostrarError(mensaje) {
    elementos.error.textContent = mensaje;
    elementos.error.hidden = false;
    limpiar(elementos.resultados);
  }

  function resolverProblema(obtenerEstado, metodos) {
    limpiarError();
    try {
      const estado = obtenerEstado();
      validarEstado(estado);
      const metodoElegido = elementos.metodo.value;
      const comparacion = compararMetodos(estado, metodos, metodoElegido);
      mostrar(
        comparacion.selected.problem,
        comparacion.selected.solution,
        metodoElegido,
        elementos.resultados,
        comparacion,
      );
      elementos.resultados.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      mostrarError(error instanceof Error ? error.message : "Ocurrió un error inesperado al resolver el problema.");
    }
  }

  function configurar(obtenerEstado, metodos) {
    elementos.botonResolver.addEventListener("click", () => resolverProblema(obtenerEstado, metodos));
  }

  window.ResolucionTransporte = { configurar, limpiarError, mostrarError };
})();
