// ======== FUNCIONES GENERALES ========

function obtenerProductos() {
  return JSON.parse(localStorage.getItem("productos")) || [];
}

function guardarProductos(data) {
  localStorage.setItem("productos", JSON.stringify(data));
}

function obtenerVentas() {
  return JSON.parse(localStorage.getItem("ventas")) || [];
}

function guardarVentas(data) {
  localStorage.setItem("ventas", JSON.stringify(data));
}

// ======== PRODUCTOS ========

function guardarProducto() {
  const nombre = document.getElementById("nombre").value.trim();
  const cantidad = parseFloat(document.getElementById("cantidad").value);
  const costo = parseFloat(document.getElementById("costo").value);
  const ganancia = parseFloat(document.getElementById("ganancia").value);

  if (!nombre || !cantidad || !costo || !ganancia) {
    alert("Completá todos los campos correctamente");
    return;
  }

  const precioUnitario = (costo / cantidad) * (1 + ganancia / 100);

  const productos = obtenerProductos();
  productos.push({ nombre, cantidad, costo, ganancia, precioUnitario, stock: cantidad });
  guardarProductos(productos);

  mostrarProductos();
  cargarProductosVenta();

  // Limpiar campos
  document.getElementById("nombre").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("costo").value = "";
  document.getElementById("ganancia").value = "";
  document.getElementById("precio-unitario").textContent = "0";
}

function mostrarProductos() {
  const lista = document.getElementById("productos-lista");
  if (!lista) return;

  const productos = obtenerProductos();
  lista.innerHTML = productos.map((p, i) => `
    <li>
      <strong>${p.nombre}</strong> — Stock: ${p.stock} unidades — 💵 $${p.precioUnitario.toFixed(2)}
      <button onclick="borrarProducto(${i})">🗑️</button>
    </li>
  `).join("");
}

function borrarProducto(i) {
  const productos = obtenerProductos();
  productos.splice(i, 1);
  guardarProductos(productos);
  mostrarProductos();
  cargarProductosVenta();
}

// ======== CÁLCULO DE PRECIO UNITARIO EN TIEMPO REAL ========

function calcularPrecioUnitario() {
  const cantidad = parseFloat(document.getElementById("cantidad")?.value) || 0;
  const costo = parseFloat(document.getElementById("costo")?.value) || 0;
  const ganancia = parseFloat(document.getElementById("ganancia")?.value) || 0;
  const precio = cantidad > 0 ? (costo / cantidad) * (1 + ganancia / 100) : 0;
  const precioEl = document.getElementById("precio-unitario");
  if (precioEl) precioEl.textContent = precio.toFixed(2);
}

document.addEventListener("input", (e) => {
  if (["cantidad", "costo", "ganancia"].includes(e.target.id)) {
    calcularPrecioUnitario();
  }
});

// ======== VENTAS ========

function cargarProductosVenta() {
  const select = document.getElementById("producto-venta");
  if (!select) return;
  const productos = obtenerProductos();
  select.innerHTML = productos.map((p, i) => `<option value="${i}">${p.nombre}</option>`).join("");
}

function registrarVenta() {
  const prodIndex = parseInt(document.getElementById("producto-venta").value);
  const cantidadVendida = parseInt(document.getElementById("cantidad-venta").value);
  const productos = obtenerProductos();

  if (isNaN(cantidadVendida) || cantidadVendida <= 0 || prodIndex < 0) {
    alert("Seleccioná un producto y una cantidad válida");
    return;
  }

    const producto = productos[prodIndex];
    if (producto.stock < cantidadVendida) {
    alert("No hay suficiente stock");
    return;

  producto.stock -= cantidadVendida;
  guardarProductos(productos);

  const fecha = new Date().toISOString().split("T")[0];
  const total = cantidadVendida * producto.precioUnitario;

  const ventas = obtenerVentas();
  ventas.push({ fecha, nombre: producto.nombre, cantidad: cantidadVendida, total });
  guardarVentas(ventas);

  document.getElementById("cantidad-venta").value = "";
  mostrarVentas();
}

function mostrarVentas() {
  const lista = document.getElementById("ventas-lista");
  if (!lista) return;

  const ventas = obtenerVentas();
  const hoy = new Date().toISOString().split("T")[0];
  const ventasHoy = ventas.filter(v => v.fecha === hoy);

  let totalGanancia = 0;
  lista.innerHTML = ventasHoy.map((v, i) => {
    totalGanancia += v.total;
    return `<li>${v.nombre} — ${v.cantidad} u. — $${v.total.toFixed(2)} 
      <button onclick="borrarVenta(${i})">🗑️</button></li>`;
  }).join("");

  const totalEl = document.getElementById("ganancia-total");
  if (totalEl) totalEl.textContent = `💰 Ganancia del día: $${totalGanancia.toFixed(2)}`;
}

function borrarVenta(i) {
  const ventas = obtenerVentas();
  const venta = ventas[i];
  ventas.splice(i, 1);
  guardarVentas(ventas);

  // Devolver stock al producto
  const productos = obtenerProductos();
  const prod = productos.find(p => p.nombre === venta.nombre);
  if (prod) {
    prod.stock += venta.cantidad;
    guardarProductos(productos);
  }

  mostrarVentas();
  mostrarProductos();
}

function mostrarHistorial() {
  const lista = document.getElementById("historial-lista");
  if (!lista) return;

  const ventas = obtenerVentas();
  const agrupadas = {};

  ventas.forEach(v => {
    if (!agrupadas[v.fecha]) agrupadas[v.fecha] = [];
    agrupadas[v.fecha].push(v);
  });

  lista.style.display = lista.style.display === "none" ? "block" : "none";

  lista.innerHTML = Object.keys(agrupadas).map(fecha => `
    <li>
      <strong>${fecha}</strong>
      <ul>${agrupadas[fecha].map(v => `<li>${v.nombre}: ${v.cantidad} u. — $${v.total.toFixed(2)}</li>`).join("")}</ul>
    </li>
  `).join("");
}

// ======== INICIALIZACIÓN ========

document.addEventListener("DOMContentLoaded", () => {
  mostrarProductos();
  cargarProductosVenta();
  mostrarVentas();
});
