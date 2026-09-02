// ============================================
// DATOS DE PEDIDOS
// ============================================
const pedidos = [
    {
        codigo: 'PED-001',
        cliente: 'María González',
        producto: 'Laptop HP 15',
        cantidad: 2,
        precio: 2450.00,
        total: 4900.00,
        estado: 'entregado'
    },
    {
        codigo: 'PED-002',
        cliente: 'Carlos Ruiz',
        producto: 'Mouse Logitech MX',
        cantidad: 5,
        precio: 89.90,
        total: 449.50,
        estado: 'pendiente'
    },
    {
        codigo: 'PED-003',
        cliente: 'Ana Torres',
        producto: 'Monitor Samsung 24"',
        cantidad: 1,
        precio: 1299.00,
        total: 1299.00,
        estado: 'enviado'
    },
    {
        codigo: 'PED-004',
        cliente: 'Luis Fernández',
        producto: 'Teclado Mecánico RGB',
        cantidad: 3,
        precio: 159.00,
        total: 477.00,
        estado: 'cancelado'
    },
    {
        codigo: 'PED-005',
        cliente: 'Elena Castro',
        producto: 'Disco SSD 1TB',
        cantidad: 4,
        precio: 320.00,
        total: 1280.00,
        estado: 'entregado'
    }
];

// ============================================
// FUNCIONES
// ============================================

// 1. Mostrar pedidos en la tabla
function mostrarPedidos() {
    const tbody = document.getElementById('tabla-pedidos');
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const fila = document.createElement('tr');

        const estadoClass = {
            'entregado': 'estado-entregado',
            'pendiente': 'estado-pendiente',
            'enviado': 'estado-enviado',
            'cancelado': 'estado-cancelado'
        }[pedido.estado] || '';

        fila.innerHTML = `
            <td><strong>${pedido.codigo}</strong></td>
            <td>${pedido.cliente}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.cantidad}</td>
            <td>S/ ${pedido.precio.toFixed(2)}</td>
            <td><strong>S/ ${pedido.total.toFixed(2)}</strong></td>
            <td><span class="estado ${estadoClass}">${pedido.estado.toUpperCase()}</span></td>
        `;

        tbody.appendChild(fila);
    });

    // Actualizar estadísticas
    actualizarEstadisticas();
}

// 2. Actualizar estadísticas
function actualizarEstadisticas() {
    const totalPedidos = pedidos.length;
    const clientesUnicos = new Set(pedidos.map(p => p.cliente));
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;

    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('totalClientes').textContent = clientesUnicos.size;
    document.getElementById('totalVentas').textContent = `S/ ${totalVentas.toFixed(2)}`;
    document.getElementById('estadoEntregado').textContent = entregados;
}

// 3. Simular actualización (para demostrar que el código funciona)
function simularActualizacion() {
    // Cambiar versión
    const versionActual = document.getElementById('version').textContent;
    const versionNum = parseFloat(versionActual) + 0.1;
    document.getElementById('version').textContent = versionNum.toFixed(1);

    // Actualizar timestamp
    const ahora = new Date();
    document.getElementById('ultimaActualizacion').textContent = 
        ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });

    // Mostrar notificación
    console.log(`✅ Versión actualizada a v${versionNum.toFixed(1)}`);
    alert(`✅ Versión actualizada a v${versionNum.toFixed(1)}`);
}

// 4. Mostrar información del sistema al cargar
function mostrarInfoSistema() {
    const ahora = new Date();
    document.getElementById('ultimaActualizacion').textContent = 
        ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    
    document.getElementById('estadoPipeline').textContent = '✅ Exitoso';
    document.getElementById('estadoPipeline').className = 'text-success';
    
    document.getElementById('estadoContenedor').textContent = '✅ Activo';
    document.getElementById('estadoContenedor').className = 'text-success';
}

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('version').textContent = '1.0.0';
    mostrarPedidos();
    mostrarInfoSistema();
    console.log('🚀 NovaTech Portal de Pedidos iniciado correctamente');
});

// ============================================
// EXPORTAR PARA PRUEBAS (Node.js)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pedidos, mostrarPedidos, actualizarEstadisticas, simularActualizacion };
}