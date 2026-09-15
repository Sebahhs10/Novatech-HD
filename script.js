// ============================================
// DATOS INICIALES
// ============================================
const DATOS_INICIALES = [
    { codigo: 'PED-001', cliente: 'María González', producto: 'Laptop HP 15', cantidad: 2, precio: 2450.00, total: 4900.00, estado: 'entregado' },
    { codigo: 'PED-002', cliente: 'Carlos Ruiz', producto: 'Mouse Logitech MX', cantidad: 5, precio: 89.90, total: 449.50, estado: 'pendiente' },
    { codigo: 'PED-003', cliente: 'Ana Torres', producto: 'Monitor Samsung 24"', cantidad: 1, precio: 1299.00, total: 1299.00, estado: 'enviado' },
    { codigo: 'PED-004', cliente: 'Luis Fernández', producto: 'Teclado Mecánico RGB', cantidad: 3, precio: 159.00, total: 477.00, estado: 'cancelado' },
    { codigo: 'PED-005', cliente: 'Elena Castro', producto: 'Disco SSD 1TB', cantidad: 4, precio: 320.00, total: 1280.00, estado: 'entregado' }
];

// ============================================
// ESTADO GLOBAL
// ============================================
let pedidos = cargarPedidos();
let contadorCodigo = calcularContador();
let codigoAEliminar = null;
let dt = null;   // instancia DataTable

function cargarPedidos() {
    const guardados = localStorage.getItem('novatech_pedidos');
    return guardados ? JSON.parse(guardados) : [...DATOS_INICIALES];
}

function guardarPedidos() {
    localStorage.setItem('novatech_pedidos', JSON.stringify(pedidos));
}

function calcularContador() {
    if (!pedidos.length) return 1;
    const nums = pedidos.map(p => parseInt(p.codigo.replace('PED-', ''))).filter(n => !isNaN(n));
    return nums.length ? Math.max(...nums) + 1 : 1;
}

function generarCodigo() {
    return `PED-${String(contadorCodigo++).padStart(3, '0')}`;
}

// ============================================
// DATATABLES — inicializar / reinicializar
// ============================================
function inicializarDataTable() {
    if (dt) {
        dt.destroy();
        dt = null;
    }

    poblarTbody(pedidos);   // llenar el DOM antes de inicializar

    dt = $('#tabla-pedidos').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'Todos']],
        order: [[0, 'asc']],
        responsive: false,
        dom: '<"dt-top"Bf>rt<"dt-bottom"lip>',
        buttons: [
            {
                extend: 'excelHtml5',
                text: '📥 Excel',
                className: 'btn-export',
                title: 'NovaTech - Pedidos'
            },
            {
                extend: 'csvHtml5',
                text: '📄 CSV',
                className: 'btn-export',
                title: 'NovaTech - Pedidos'
            },
            {
                extend: 'print',
                text: '🖨️ Imprimir',
                className: 'btn-export',
                title: 'NovaTech — Portal de Pedidos'
            }
        ],
        columnDefs: [
            { targets: 7, orderable: false }   // columna Acciones sin orden
        ]
    });

    // Aplicar filtro de estado si ya hay uno seleccionado
    const estadoActual = document.getElementById('filtro-estado-dt').value;
    if (estadoActual) {
        dt.column(6).search(estadoActual, false, false).draw();
    }
}

// Poblar el <tbody> puro (sin DataTables activo)
function poblarTbody(lista) {
    const tbody = document.getElementById('tbody-pedidos');
    tbody.innerHTML = '';
    lista.forEach(p => tbody.appendChild(crearFila(p)));
}

// Paleta de colores para los avatares (se elige según inicial)
const AVATAR_COLORES = [
    '#667eea', '#e74c3c', '#27ae60', '#f39c12', '#8e44ad',
    '#16a085', '#2980b9', '#d35400', '#c0392b', '#1abc9c'
];

function colorAvatar(nombre) {
    const idx = nombre.charCodeAt(0) % AVATAR_COLORES.length;
    return AVATAR_COLORES[idx];
}

function crearFila(p) {
    const estadoClass = {
        entregado: 'estado-entregado',
        pendiente: 'estado-pendiente',
        enviado: 'estado-enviado',
        cancelado: 'estado-cancelado'
    }[p.estado] || '';

    const inicial = p.cliente.charAt(0).toUpperCase();
    const color = colorAvatar(p.cliente);

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><strong>${p.codigo}</strong></td>
        <td>
            <div class="cliente-cell">
                <span class="cliente-avatar" style="background:${color}">${inicial}</span>
                <span class="cliente-nombre">${p.cliente}</span>
            </div>
        </td>
        <td>${p.producto}</td>
        <td>${p.cantidad}</td>
        <td>S/ ${p.precio.toFixed(2)}</td>
        <td><strong>S/ ${p.total.toFixed(2)}</strong></td>
        <td><span class="estado ${estadoClass}">${p.estado.toUpperCase()}</span></td>
        <td class="acciones">
            <button class="btn-editar" onclick="abrirModalEditar('${p.codigo}')">✏️ Editar</button>
            <button class="btn-eliminar-fila" onclick="pedirEliminar('${p.codigo}')">🗑️</button>
        </td>
    `;
    return tr;
}

// Filtro externo por estado
function filtrarEstado() {
    if (!dt) return;
    const val = document.getElementById('filtro-estado-dt').value;
    dt.column(6).search(val, false, false).draw();
}

// Refrescar DataTable después de CRUD
function refrescarTabla() {
    inicializarDataTable();
    actualizarEstadisticas();
    actualizarTimestamp();
}

// ============================================
// CREATE
// ============================================
function crearPedido() {
    const cliente = document.getElementById('f-cliente').value.trim();
    const producto = document.getElementById('f-producto').value.trim();
    const cantidad = parseInt(document.getElementById('f-cantidad').value);
    const precio = parseFloat(document.getElementById('f-precio').value);
    const estado = document.getElementById('f-estado').value;

    if (!validar({ cliente, producto, cantidad, precio }, 'form-error')) return;

    pedidos.unshift({
        codigo: generarCodigo(),
        cliente, producto, cantidad, precio,
        total: cantidad * precio,
        estado
    });

    guardarPedidos();
    limpiarFormulario();
    refrescarTabla();
    mostrarToast(`✅ Pedido ${pedidos[0].codigo} creado`, 'success');
}

// ============================================
// UPDATE
// ============================================
function abrirModalEditar(codigo) {
    const p = pedidos.find(x => x.codigo === codigo);
    if (!p) return;

    document.getElementById('m-codigo').value = p.codigo;
    document.getElementById('m-cliente').value = p.cliente;
    document.getElementById('m-producto').value = p.producto;
    document.getElementById('m-cantidad').value = p.cantidad;
    document.getElementById('m-precio').value = p.precio;
    document.getElementById('m-estado').value = p.estado;
    document.getElementById('modal-error').style.display = 'none';
    document.getElementById('modal-editar').style.display = 'flex';
}

function guardarEdicion() {
    const codigo = document.getElementById('m-codigo').value;
    const cliente = document.getElementById('m-cliente').value.trim();
    const producto = document.getElementById('m-producto').value.trim();
    const cantidad = parseInt(document.getElementById('m-cantidad').value);
    const precio = parseFloat(document.getElementById('m-precio').value);
    const estado = document.getElementById('m-estado').value;

    if (!validar({ cliente, producto, cantidad, precio }, 'modal-error')) return;

    const idx = pedidos.findIndex(x => x.codigo === codigo);
    if (idx === -1) return;

    pedidos[idx] = { ...pedidos[idx], cliente, producto, cantidad, precio, total: cantidad * precio, estado };
    guardarPedidos();
    cerrarModal();
    refrescarTabla();
    mostrarToast(`✏️ Pedido ${codigo} actualizado`, 'info');
}

function cerrarModal() {
    document.getElementById('modal-editar').style.display = 'none';
}

function cerrarModalFuera(e) {
    if (e.target.id === 'modal-editar') cerrarModal();
}

// ============================================
// DELETE
// ============================================
function pedirEliminar(codigo) {
    codigoAEliminar = codigo;
    document.getElementById('codigo-eliminar').textContent = codigo;
    document.getElementById('modal-eliminar').style.display = 'flex';
}

function confirmarEliminar() {
    if (!codigoAEliminar) return;
    pedidos = pedidos.filter(p => p.codigo !== codigoAEliminar);
    guardarPedidos();
    const cod = codigoAEliminar;
    cerrarModalEliminar();
    refrescarTabla();
    mostrarToast(`🗑️ Pedido ${cod} eliminado`, 'danger');
}

function cerrarModalEliminar() {
    document.getElementById('modal-eliminar').style.display = 'none';
    codigoAEliminar = null;
}

function cerrarModalEliminacion(e) {
    if (e.target.id === 'modal-eliminar') cerrarModalEliminar();
}

// ============================================
// ESTADÍSTICAS
// ============================================
function actualizarEstadisticas() {
    document.getElementById('totalPedidos').textContent = pedidos.length;
    document.getElementById('totalClientes').textContent = new Set(pedidos.map(p => p.cliente)).size;
    document.getElementById('totalVentas').textContent = `S/ ${pedidos.reduce((s, p) => s + p.total, 0).toFixed(2)}`;
    document.getElementById('estadoEntregado').textContent = pedidos.filter(p => p.estado === 'entregado').length;
}

function actualizarTimestamp() {
    document.getElementById('ultimaActualizacion').textContent =
        new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
}

// ============================================
// UTILIDADES
// ============================================
function limpiarFormulario() {
    ['f-cliente', 'f-producto', 'f-cantidad', 'f-precio'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-estado').value = 'pendiente';
    document.getElementById('form-error').style.display = 'none';
}

function toggleFormulario() {
    const form = document.getElementById('formulario-crear');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function validar({ cliente, producto, cantidad, precio }, errorId) {
    let msg = '';
    if (!cliente) msg = 'El campo Cliente es obligatorio.';
    else if (!producto) msg = 'El campo Producto es obligatorio.';
    else if (isNaN(cantidad) || cantidad < 1) msg = 'La cantidad debe ser mayor a 0.';
    else if (isNaN(precio) || precio <= 0) msg = 'El precio debe ser mayor a 0.';

    if (msg) {
        const el = document.getElementById(errorId);
        el.textContent = msg;
        el.style.display = 'block';
        return false;
    }
    return true;
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.className = `toast toast-${tipo}`;
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ============================================
// INIT
// ============================================
$(document).ready(function () {
    document.getElementById('estadoPipeline').className = 'text-success';
    document.getElementById('estadoContenedor').className = 'text-success';
    actualizarTimestamp();
    inicializarDataTable();
    console.log('🚀 NovaTech v2.0.0 — CRUD + DataTables activo');
});

// ============================================
// EXPORTAR PARA PRUEBAS (Node.js)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pedidos, crearPedido, actualizarEstadisticas };
}