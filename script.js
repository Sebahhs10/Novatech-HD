// ============================================
// DATOS DE PEDIDOS E INVENTARIO (AMPLIADO)
// ============================================
const pedidos = [
    { codigo: 'PED-001', cliente: 'María González', producto: 'Laptop HP 15', cantidad: 2, precio: 2450.00, total: 4900.00, estado: 'entregado' },
    { codigo: 'PED-002', cliente: 'Carlos Ruiz', producto: 'Mouse Logitech MX', cantidad: 5, precio: 89.90, total: 449.50, estado: 'pendiente' },
    { codigo: 'PED-003', cliente: 'Ana Torres', producto: 'Monitor Samsung 24"', cantidad: 1, precio: 1299.00, total: 1299.00, estado: 'enviado' },
    { codigo: 'PED-004', cliente: 'Luis Fernández', producto: 'Teclado Mecánico RGB', cantidad: 3, precio: 159.00, total: 477.00, estado: 'cancelado' },
    { codigo: 'PED-005', cliente: 'Elena Castro', producto: 'Disco SSD 1TB', cantidad: 4, precio: 320.00, total: 1280.00, estado: 'entregado' },
    { codigo: 'PED-006', cliente: 'Jorge Silva', producto: 'Procesador Intel Core i7', cantidad: 1, precio: 1650.00, total: 1650.00, estado: 'enviado' },
    { codigo: 'PED-007', cliente: 'Lucía Mendoza', producto: 'Monitor Gamer 240Hz', cantidad: 2, precio: 1800.00, total: 3600.00, estado: 'pendiente' },
    { codigo: 'PED-008', cliente: 'Marcos Vega', producto: 'Memoria RAM DDR5 32GB', cantidad: 2, precio: 450.00, total: 900.00, estado: 'entregado' },
    { codigo: 'PED-009', cliente: 'Camila Rojas', producto: 'Mouse Sensor Alta Precisión', cantidad: 1, precio: 250.00, total: 250.00, estado: 'entregado' },
    { codigo: 'PED-010', cliente: 'Diego Paredes', producto: 'Licencia FL Studio', cantidad: 1, precio: 750.00, total: 750.00, estado: 'cancelado' },
    { codigo: 'PED-011', cliente: 'Valeria Luna', producto: 'Laptop HP 15', cantidad: 1, precio: 2450.00, total: 2450.00, estado: 'pendiente' }
];

const productos = [
    { sku: 'LAP-HP-15', nombre: 'Laptop HP 15', categoria: 'Laptops', stock: 45, stockMinimo: 10 },
    { sku: 'MOU-LOG-MX', nombre: 'Mouse Logitech MX', categoria: 'Periféricos', stock: 8, stockMinimo: 15 },
    { sku: 'MON-SAM-24', nombre: 'Monitor Samsung 24"', categoria: 'Monitores', stock: 0, stockMinimo: 5 },
    { sku: 'TEC-MEC-RGB', nombre: 'Teclado Mecánico RGB', categoria: 'Periféricos', stock: 25, stockMinimo: 10 },
    { sku: 'SSD-1TB-CRU', nombre: 'Disco SSD 1TB', categoria: 'Almacenamiento', stock: 12, stockMinimo: 15 },
    { sku: 'CPU-INT-I7', nombre: 'Procesador Intel Core i7', categoria: 'Componentes', stock: 14, stockMinimo: 5 },
    { sku: 'MON-240HZ', nombre: 'Monitor Gamer 240Hz', categoria: 'Monitores', stock: 3, stockMinimo: 5 },
    { sku: 'RAM-DDR5', nombre: 'Memoria RAM DDR5 32GB', categoria: 'Componentes', stock: 30, stockMinimo: 15 },
    { sku: 'MOU-PREC-G', nombre: 'Mouse Sensor Alta Precisión', categoria: 'Periféricos', stock: 0, stockMinimo: 10 },
    { sku: 'SFT-FL-STU', nombre: 'Licencia FL Studio', categoria: 'Software', stock: 99, stockMinimo: 10 }
];


// ============================================
// FUNCIONES DE PEDIDOS CON BUSCADOR
// ============================================

function inicializarManejoPedidos() {
    const contenedorTabla = document.querySelector('.table-container');
    const tbody = document.getElementById('tabla-pedidos');
    
    if (!tbody || !contenedorTabla) return; 

    if (!document.getElementById('buscadorPedidos')) {
        const controlesHTML = `
            <div class="dt-top" style="margin-bottom: 15px; display: flex; gap: 12px;">
                <div class="dataTables_filter">
                    <input type="text" id="buscadorPedidos" placeholder="🔍 Buscar cliente, código o producto..." style="width: 280px; padding: 8px; border: 1px solid #ced4da; border-radius: 8px;">
                </div>
                <div class="dataTables_length">
                    <select id="filtroEstadoPedidos" style="padding: 8px; border: 1px solid #ced4da; border-radius: 8px;">
                        <option value="todos">Todos los estados</option>
                        <option value="entregado">Entregado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="enviado">Enviado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
            </div>
        `;
        contenedorTabla.insertAdjacentHTML('beforebegin', controlesHTML);
    }

    renderizarTablaPedidos(pedidos);

    document.getElementById('buscadorPedidos').addEventListener('input', filtrarPedidos);
    document.getElementById('filtroEstadoPedidos').addEventListener('change', filtrarPedidos);
}

function filtrarPedidos() {
    const textoBuscado = document.getElementById('buscadorPedidos').value.toLowerCase();
    const estadoSeleccionado = document.getElementById('filtroEstadoPedidos').value;

    const pedidosFiltrados = pedidos.filter(pedido => {
        const coincideTexto = 
            pedido.cliente.toLowerCase().includes(textoBuscado) || 
            pedido.codigo.toLowerCase().includes(textoBuscado) || 
            pedido.producto.toLowerCase().includes(textoBuscado);
            
        const coincideEstado = (estadoSeleccionado === 'todos') || (pedido.estado === estadoSeleccionado);

        return coincideTexto && coincideEstado;
    });

    renderizarTablaPedidos(pedidosFiltrados);
}

function renderizarTablaPedidos(datos) {
    const tbody = document.getElementById('tabla-pedidos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #7f8c8d;">No se encontraron pedidos coincidentes.</td></tr>`;
        return;
    }

    datos.forEach(pedido => {
        const fila = document.createElement('tr');
        const estadoClass = {
            'entregado': 'estado-entregado',
            'pendiente': 'estado-pendiente',
            'enviado': 'estado-enviado',
            'cancelado': 'estado-cancelado'
        }[pedido.estado] || '';

        fila.innerHTML = `
            <td><strong>${pedido.codigo}</strong></td>
            <td>
                <div class="cliente-cell" style="display: flex; align-items: center; gap: 10px;">
                    <div class="cliente-avatar" style="width: 30px; height: 30px; background-color: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${pedido.cliente.charAt(0)}</div>
                    <span class="cliente-nombre">${pedido.cliente}</span>
                </div>
            </td>
            <td>${pedido.producto}</td>
            <td>${pedido.cantidad}</td>
            <td>S/ ${pedido.precio.toFixed(2)}</td>
            <td><strong>S/ ${pedido.total.toFixed(2)}</strong></td>
            <td><span class="estado ${estadoClass}">${pedido.estado.toUpperCase()}</span></td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarEstadisticas() {
    if (!document.getElementById('totalPedidos')) return;
    
    const totalPedidos = pedidos.length;
    const clientesUnicos = new Set(pedidos.map(p => p.cliente));
    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;

    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('totalClientes').textContent = clientesUnicos.size;
    document.getElementById('totalVentas').textContent = `S/ ${totalVentas.toFixed(2)}`;
    document.getElementById('estadoEntregado').textContent = entregados;
}

// ============================================
// FUNCIONES DE INVENTARIO
// ============================================

function mostrarInventario() {
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    tbody.innerHTML = '';

    productos.forEach(prod => {
        const fila = document.createElement('tr');
        
        let estadoTexto = 'Disponible';
        let claseEstado = 'stock-disponible';
        
        if (prod.stock === 0) {
            estadoTexto = 'Agotado';
            claseEstado = 'stock-agotado';
        } else if (prod.stock < prod.stockMinimo) {
            estadoTexto = 'Stock Bajo';
            claseEstado = 'stock-bajo';
        }

        fila.innerHTML = `
            <td><strong>${prod.sku}</strong></td>
            <td>${prod.nombre}</td>
            <td><span class="categoria" style="background:#eef0ff; color:#5967c7; padding:4px 8px; border-radius:12px; font-size:10px;">${prod.categoria}</span></td>
            <td><strong>${prod.stock}</strong></td>
            <td>${prod.stockMinimo}</td>
            <td><span class="estado ${claseEstado}">${estadoTexto.toUpperCase()}</span></td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarEstadisticasInventario() {
    if (!document.getElementById('totalProductos')) return;
    
    const total = productos.length;
    const disponibles = productos.filter(p => p.stock >= p.stockMinimo).length;
    const bajoStock = productos.filter(p => p.stock > 0 && p.stock < p.stockMinimo).length;
    const agotados = productos.filter(p => p.stock === 0).length;
    
    const unidadesTotales = productos.reduce((sum, p) => sum + p.stock, 0);
    const alertas = bajoStock + agotados;

    document.getElementById('totalProductos').textContent = total;
    document.getElementById('productosDisponibles').textContent = disponibles;
    document.getElementById('productosStockBajo').textContent = bajoStock;
    document.getElementById('productosAgotados').textContent = agotados;
    
    if(document.getElementById('unidadesTotales')) document.getElementById('unidadesTotales').textContent = unidadesTotales;
    if(document.getElementById('alertasInventario')) document.getElementById('alertasInventario').textContent = alertas;
}

function actualizarInventario() {
    mostrarInventario();
    actualizarEstadisticasInventario();
    
    const ahora = new Date();
    if(document.getElementById('ultimaActualizacion')) {
        document.getElementById('ultimaActualizacion').textContent = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    }
    alert('✅ Inventario sincronizado con la base de datos.');
}

// ============================================
// SISTEMA DE SESIONES Y UTILERÍA
// ============================================

function simularActualizacion() {
    alert('✅ La lista de pedidos está actualizada.');
}

function mostrarInfoSistema() {
    const elUltimaAct = document.getElementById('ultimaActualizacion');
    if (!elUltimaAct) return;
    
    const ahora = new Date();
    elUltimaAct.textContent = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    
    if(document.getElementById('estadoPipeline')) {
        document.getElementById('estadoPipeline').textContent = '✅ Exitoso';
        document.getElementById('estadoPipeline').className = 'text-success';
    }
    if(document.getElementById('estadoContenedor')) {
        document.getElementById('estadoContenedor').textContent = '✅ Activo';
        document.getElementById('estadoContenedor').className = 'text-success';
    }
}

function gestionarSesion() {
    const usuarioActivo = localStorage.getItem('usuarioNovaTech');
    const esPaginaLogin = window.location.pathname.toLowerCase().includes('login.html');

    if (!usuarioActivo && !esPaginaLogin) {
        window.location.href = 'Login.html';
        return;
    }

    if (usuarioActivo && esPaginaLogin) {
        window.location.href = 'index.html';
        return;
    }

    if (usuarioActivo && !esPaginaLogin) {
        const sidebarBottom = document.querySelector('.sidebar-bottom');
        if (sidebarBottom && !document.getElementById('btnCerrarSesion')) {
            const perfilHTML = `
                <div class="admin-profile" style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; margin-bottom:10px;">
                    <div class="avatar" style="width:30px; height:30px; background:#667eea; border-radius:50%; display:grid; place-items:center; color:white;">${usuarioActivo.charAt(0).toUpperCase()}</div>
                    <div>
                        <strong style="color:white; font-size:12px;">${usuarioActivo}</strong>
                        <small style="color:#94a2b5; font-size:10px; display:block;">Conectado</small>
                    </div>
                </div>
                <button id="btnCerrarSesion" class="logout-button" style="width:100%; text-align:left; background:transparent; color:#b8c4d4; border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:8px; cursor:pointer;">
                    <span>🚪</span> Cerrar sesión
                </button>
            `;
            
            sidebarBottom.insertAdjacentHTML('afterbegin', perfilHTML);

            document.getElementById('btnCerrarSesion').addEventListener('click', function() {
                localStorage.removeItem('usuarioNovaTech');
                window.location.href = 'Login.html';
            });
        }
    }
}

function inicializarLogin() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            this.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;

            if (user === 'admin' && pass === '12345') {
                loginError.style.color = '#27ae60';
                loginError.textContent = 'Acceso concedido. Iniciando sesión...';
                
                localStorage.setItem('usuarioNovaTech', 'Administrador'); 
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            } else {
                loginError.style.color = '#b33d3d'; 
                loginError.textContent = 'Usuario o contraseña incorrectos.';
            }
        });
    }
}

// ============================================
// INICIALIZAR EVENTOS DEL DOM
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    gestionarSesion();

    // Actualizamos estadísticas globales (Para que el Dashboard no muestre "0")
    actualizarEstadisticas();
    actualizarEstadisticasInventario();

    if (document.getElementById('version')) {
        document.getElementById('version').textContent = '1.0.0';
        mostrarInfoSistema();
    }
    
    // Solo inyectar buscador si estamos en la vista de Pedidos
    if (document.getElementById('tabla-pedidos')) {
        inicializarManejoPedidos();
    }

    // Solo dibujar inventario si estamos en la vista de Inventario
    if (document.getElementById('tabla-inventario')) {
        mostrarInventario();
    }
    
    if (document.getElementById('loginForm')) {
        inicializarLogin();
    }
    
    console.log('🚀 Archivo script.js cargado y limpio de errores');
});

// Evitar errores de referencia en el navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pedidos, renderizarTablaPedidos, actualizarEstadisticas, simularActualizacion };
}