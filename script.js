// ============================================
// DATOS DE PEDIDOS E INVENTARIO
// ============================================
const pedidos = [
    { codigo: 'PED-001', cliente: 'María González', producto: 'Laptop HP 15', cantidad: 2, precio: 2450.00, total: 4900.00, estado: 'entregado' },
    { codigo: 'PED-002', cliente: 'Carlos Ruiz', producto: 'Mouse Logitech MX', cantidad: 5, precio: 89.90, total: 449.50, estado: 'pendiente' },
    { codigo: 'PED-003', cliente: 'Ana Torres', producto: 'Monitor Samsung 24"', cantidad: 1, precio: 1299.00, total: 1299.00, estado: 'enviado' },
    { codigo: 'PED-004', cliente: 'Luis Fernández', producto: 'Teclado Mecánico RGB', cantidad: 3, precio: 159.00, total: 477.00, estado: 'cancelado' },
    { codigo: 'PED-005', cliente: 'Elena Castro', producto: 'Disco SSD 1TB', cantidad: 4, precio: 320.00, total: 1280.00, estado: 'entregado' }
];

// NUEVO: Datos simulados para el inventario
const productos = [
    { sku: 'LAP-HP-15', nombre: 'Laptop HP 15', categoria: 'Laptops', stock: 45, stockMinimo: 10 },
    { sku: 'MOU-LOG-MX', nombre: 'Mouse Logitech MX', categoria: 'Periféricos', stock: 8, stockMinimo: 15 },
    { sku: 'MON-SAM-24', nombre: 'Monitor Samsung 24"', categoria: 'Monitores', stock: 0, stockMinimo: 5 },
    { sku: 'TEC-MEC-RGB', nombre: 'Teclado Mecánico RGB', categoria: 'Periféricos', stock: 25, stockMinimo: 10 },
    { sku: 'SSD-1TB-CRU', nombre: 'Disco SSD 1TB', categoria: 'Almacenamiento', stock: 12, stockMinimo: 15 }
];

// ============================================
// FUNCIONES DE PEDIDOS
// ============================================

function mostrarPedidos() {
    const tbody = document.getElementById('tabla-pedidos');
    if (!tbody) return; 
    
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

    actualizarEstadisticas();
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
// FUNCIONES DE INVENTARIO (NUEVO)
// ============================================

function mostrarInventario() {
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    tbody.innerHTML = '';

    productos.forEach(prod => {
        const fila = document.createElement('tr');
        
        // Lógica para determinar el estado según el stock
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
            <td><span class="categoria">${prod.categoria}</span></td>
            <td><strong>${prod.stock}</strong></td>
            <td>${prod.stockMinimo}</td>
            <td><span class="estado ${claseEstado}">${estadoTexto.toUpperCase()}</span></td>
        `;
        tbody.appendChild(fila);
    });

    actualizarEstadisticasInventario();
}

function actualizarEstadisticasInventario() {
    if (!document.getElementById('totalProductos')) return;
    
    const total = productos.length;
    const disponibles = productos.filter(p => p.stock >= p.stockMinimo).length;
    const bajoStock = productos.filter(p => p.stock > 0 && p.stock < p.stockMinimo).length;
    const agotados = productos.filter(p => p.stock === 0).length;
    
    const unidadesTotales = productos.reduce((sum, p) => sum + p.stock, 0);
    const alertas = bajoStock + agotados;

    // Actualizar tarjetas de estadísticas
    document.getElementById('totalProductos').textContent = total;
    document.getElementById('productosDisponibles').textContent = disponibles;
    document.getElementById('productosStockBajo').textContent = bajoStock;
    document.getElementById('productosAgotados').textContent = agotados;
    
    // Actualizar resumen textual
    if(document.getElementById('unidadesTotales')) document.getElementById('unidadesTotales').textContent = unidadesTotales;
    if(document.getElementById('alertasInventario')) document.getElementById('alertasInventario').textContent = alertas;
}

// Función conectada al botón "Actualizar Inventario" del HTML
function actualizarInventario() {
    mostrarInventario();
    
    const ahora = new Date();
    document.getElementById('ultimaActualizacion').textContent = 
        ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });

    console.log('✅ Inventario sincronizado con la base de datos.');
}

// ============================================
// SISTEMA DE SESIONES Y UTILERÍA
// ============================================

function simularActualizacion() {
    const versionActual = document.getElementById('version').textContent;
    const versionNum = parseFloat(versionActual) + 0.1;
    document.getElementById('version').textContent = versionNum.toFixed(1);

    const ahora = new Date();
    document.getElementById('ultimaActualizacion').textContent = 
        ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });

    alert(`✅ Versión actualizada a v${versionNum.toFixed(1)}`);
}

function mostrarInfoSistema() {
    const elUltimaAct = document.getElementById('ultimaActualizacion');
    if (!elUltimaAct) return;
    
    const ahora = new Date();
    elUltimaAct.textContent = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    
    document.getElementById('estadoPipeline').textContent = '✅ Exitoso';
    document.getElementById('estadoPipeline').className = 'text-success';
    document.getElementById('estadoContenedor').textContent = '✅ Activo';
    document.getElementById('estadoContenedor').className = 'text-success';
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
        if (sidebarBottom) {
            const perfilHTML = `
                <div class="admin-profile">
                    <div class="avatar">${usuarioActivo.charAt(0).toUpperCase()}</div>
                    <div>
                        <strong>${usuarioActivo}</strong>
                        <small>Conectado</small>
                    </div>
                </div>
                <button id="btnCerrarSesion" class="logout-button">
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

    if (document.getElementById('version')) {
        document.getElementById('version').textContent = '1.0.0';
        mostrarInfoSistema();
    }
    
    // Si existe la tabla de pedidos, inicializarla
    if (document.getElementById('tabla-pedidos')) {
        mostrarPedidos();
    }

    // NUEVO: Si existe la tabla de inventario, inicializarla
    if (document.getElementById('tabla-inventario')) {
        mostrarInventario();
    }
    
    if (document.getElementById('loginForm')) {
        inicializarLogin();
    }
    
    console.log('🚀 Archivo script.js cargado y módulos verificados');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pedidos, mostrarPedidos, actualizarEstadisticas, simularActualizacion };
}