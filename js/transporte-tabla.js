(function () {
const EPSILON = window.ModeloTransporte.EPSILON;

const table = document.querySelector("#transport-table");
const balance = document.querySelector("#balance-status");

function formatNumber(value) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 4 }).format(value);
}

function displayName(name, fallback) {
  return name.trim() || fallback;
}

function createInput({ value, label, className, type = "text", onInput, onChange }) {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.className = `matrix-input ${className}`;
  input.setAttribute("aria-label", label);
  if (type === "number") {
    input.min = "0";
    input.step = "any";
    input.inputMode = "decimal";
  }
  input.addEventListener("input", () => {
    onInput(input.value);
    if (onChange) onChange();
  });
  return input;
}

function appendHeaderCell(row, text, className = "") {
  const cell = document.createElement("th");
  cell.scope = "col";
  cell.textContent = text;
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function updateBalance(state) {
  const totalSupply = state.supply.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const totalDemand = state.demand.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const difference = totalSupply - totalDemand;
  balance.classList.toggle("warning", Math.abs(difference) > EPSILON);

  if (Math.abs(difference) <= EPSILON) {
    balance.textContent = `Problema balanceado · Oferta total: ${formatNumber(totalSupply)} · Demanda total: ${formatNumber(totalDemand)}.`;
  } else if (difference > 0) {
    balance.textContent = `La oferta supera la demanda en ${formatNumber(difference)} unidades; se agregará un destino ficticio de costo cero al resolver.`;
  } else {
    balance.textContent = `La demanda supera la oferta en ${formatNumber(Math.abs(difference))} unidades; se agregará un origen ficticio de costo cero al resolver.`;
  }
}

function renderTable(state, onChange) {
  table.replaceChildren();

  const head = table.createTHead();
  const headerRow = head.insertRow();
  appendHeaderCell(headerRow, "Origen \\ Destino");

  state.destinations.forEach((name, column) => {
    const header = appendHeaderCell(headerRow, "");
    header.append(
      createInput({
        value: name,
        label: `Nombre del destino ${column + 1}`,
        className: "name-input",
        onInput: (value) => {
          state.destinations[column] = value;
        },
        onChange,
      }),
    );
  });
  appendHeaderCell(headerRow, "Oferta", "total-heading");

  const body = table.createTBody();
  state.origins.forEach((name, rowIndex) => {
    const row = body.insertRow();
    const originHeader = row.insertCell();
    originHeader.append(
      createInput({
        value: name,
        label: `Nombre del origen ${rowIndex + 1}`,
        className: "name-input",
        onInput: (value) => {
          state.origins[rowIndex] = value;
        },
        onChange,
      }),
    );

    state.destinations.forEach((destination, columnIndex) => {
      const cell = row.insertCell();
      cell.append(
        createInput({
          value: state.costs[rowIndex][columnIndex],
          label: `Costo de ${displayName(name, `Origen ${rowIndex + 1}`)} a ${displayName(destination, `Destino ${columnIndex + 1}`)}`,
          className: "cost-input",
          type: "number",
          onInput: (value) => {
            state.costs[rowIndex][columnIndex] = value === "" ? Number.NaN : Number(value);
          },
          onChange,
        }),
      );
    });

    const supplyCell = row.insertCell();
    supplyCell.append(
      createInput({
        value: state.supply[rowIndex],
        label: `Oferta de ${displayName(name, `Origen ${rowIndex + 1}`)}`,
        className: "supply-input",
        type: "number",
        onInput: (value) => {
          state.supply[rowIndex] = value === "" ? Number.NaN : Number(value);
        },
        onChange,
      }),
    );
  });

  const demandRow = body.insertRow();
  const demandHeader = demandRow.insertCell();
  demandHeader.textContent = "Demanda";
  demandHeader.className = "total-heading";
  state.destinations.forEach((name, column) => {
    const demandCell = demandRow.insertCell();
    demandCell.append(
      createInput({
        value: state.demand[column],
        label: `Demanda de ${displayName(name, `Destino ${column + 1}`)}`,
        className: "demand-input",
        type: "number",
        onInput: (value) => {
          state.demand[column] = value === "" ? Number.NaN : Number(value);
        },
        onChange,
      }),
    );
  });
  const totalCell = demandRow.insertCell();
  totalCell.textContent = "Totales";
  totalCell.className = "total-cell";

  updateBalance(state);
}

window.TablaTransporte = { crear: renderTable, actualizarBalance: updateBalance };
})();
