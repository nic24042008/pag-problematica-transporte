(function () {
  const { MAX_DIMENSION, crearEstadoInicial } = window.ModeloTransporte;
  const { crear, actualizarBalance } = window.TablaTransporte;
  const { limpiar } = window.ResultadosTransporte;
  const resolucion = window.ResolucionTransporte;
  const elementos = {
    resultados: document.querySelector("#results"),
  };

  const metodos = {
    northwest: window.MetodoEsquinaNoroeste.resolver,
    "least-cost": window.MetodoCostoMinimo.resolver,
    vogel: window.MetodoVogel.resolver,
  };

  let estado = crearEstadoInicial();

  function limpiarResultados() {
    limpiar(elementos.resultados);
  }

  function actualizarTrasEdicion() {
    limpiarResultados();
    resolucion.limpiarError();
    actualizarBalance(estado);
  }

  function cambiarDimension(cambio) {
    try {
      cambio();
      limpiarResultados();
      resolucion.limpiarError();
      crear(estado, actualizarTrasEdicion);
    } catch (error) {
      resolucion.mostrarError(error instanceof Error ? error.message : "No se pudo modificar la tabla.");
    }
  }

  function agregarOrigen() {
    if (estado.origins.length >= MAX_DIMENSION) {
      throw new Error(`Se permite un máximo de ${MAX_DIMENSION} orígenes.`);
    }
    const indice = estado.origins.length + 1;
    estado.origins.push(`Origen ${indice}`);
    estado.supply.push(100);
    estado.costs.push(Array(estado.destinations.length).fill(0));
  }

  function quitarOrigen() {
    if (estado.origins.length <= 1) throw new Error("La tabla debe conservar al menos un origen.");
    estado.origins.pop();
    estado.supply.pop();
    estado.costs.pop();
  }

  function agregarDestino() {
    if (estado.destinations.length >= MAX_DIMENSION) {
      throw new Error(`Se permite un máximo de ${MAX_DIMENSION} destinos.`);
    }
    const indice = estado.destinations.length + 1;
    estado.destinations.push(`Destino ${indice}`);
    estado.demand.push(100);
    estado.costs.forEach((fila) => fila.push(0));
  }

  function quitarDestino() {
    if (estado.destinations.length <= 1) throw new Error("La tabla debe conservar al menos un destino.");
    estado.destinations.pop();
    estado.demand.pop();
    estado.costs.forEach((fila) => fila.pop());
  }

  document.querySelector("#add-origin").addEventListener("click", () => cambiarDimension(agregarOrigen));
  document.querySelector("#remove-origin").addEventListener("click", () => cambiarDimension(quitarOrigen));
  document.querySelector("#add-column").addEventListener("click", () => cambiarDimension(agregarDestino));
  document.querySelector("#remove-column").addEventListener("click", () => cambiarDimension(quitarDestino));
  document.querySelector("#reset").addEventListener("click", () => {
    estado = crearEstadoInicial();
    resolucion.limpiarError();
    limpiarResultados();
    crear(estado, actualizarTrasEdicion);
  });

  resolucion.configurar(() => estado, metodos);
  crear(estado, actualizarTrasEdicion);
})();
