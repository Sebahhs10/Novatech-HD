// ============================================
// DATOS DINÁMICOS (Conectados a MySQL)
// ============================================

let pedidos = [];
let productos = [];

// ============================================
// CONEXIÓN AL BACKEND (NODE.JS + MYSQL)
// ============================================

async function cargarDatosDesdeMySQL() {
    try {
        // 1. Obtener los productos (Inventario)
        const resProductos = await fetch('http://localhost:3000/api/productos');
        const dataProductos = await resProductos.json();
        
        // Adaptamos stock_minimo de la base de datos a stockMinimo que usa tu código
        productos = dataProductos.map(prod => ({
            ...prod,
            stockMinimo: prod.stock_minimo
        }));

        // 2. Obtener los pedidos
        const resPedidos = await fetch('http://localhost:3000/api/pedidos');
        pedidos = await resPedidos.json();

        console.log('✅ Datos cargados correctamente desde MySQL');

        // 3. Renderizar toda la interfaz con los datos reales
        actualizarEstadisticas();
        actualizarEstadisticasInventario();

        if (document.getElementById('tabla-pedidos')) {
            inicializarManejoPedidos();
        }

        if (document.getElementById('tabla-inventario')) {
            mostrarInventario();
            inicializarFiltrosInventario(); // <-- Nueva línea agregada
        }

    } catch (error) {
        console.error("❌ Error conectando al servidor backend:", error);
        alert("Error de conexión: No se pudieron cargar los datos de la base de datos. Asegúrate de que node server.js esté ejecutándose.");
    }
}

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
    <input type="text" id="buscadorPedidos" placeholder="🔍 Buscar por DNI, Código, Nombre o SKU..." style="width: 320px; padding: 8px; border: 1px solid #007bff; border-radius: 8px;">
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

        // Se usa parseFloat para asegurar que la vista soporte los decimales traídos de MySQL
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
            <td>S/ ${parseFloat(pedido.precio).toFixed(2)}</td>
            <td><strong>S/ ${parseFloat(pedido.total).toFixed(2)}</strong></td>
            <td><span class="estado ${estadoClass}">${pedido.estado.toUpperCase()}</span></td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarEstadisticas() {
    if (!document.getElementById('totalPedidos')) return;
    
    const totalPedidos = pedidos.length;
    const clientesUnicos = new Set(pedidos.map(p => p.cliente));
    const totalVentas = pedidos.reduce((sum, p) => sum + parseFloat(p.total), 0);
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;

    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('totalClientes').textContent = clientesUnicos.size;
    document.getElementById('totalVentas').textContent = `S/ ${totalVentas.toFixed(2)}`;
    document.getElementById('estadoEntregado').textContent = entregados;
}

// ============================================
// FUNCIONES DE INVENTARIO
// ============================================

function mostrarInventario(datos = productos) {
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #7f8c8d;">No se encontraron productos coincidentes.</td></tr>`;
        return;
    }

    datos.forEach(prod => {
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

function filtrarInventario() {
    const textoBuscado = document.getElementById('buscadorInventario').value.toLowerCase();
    const categoriaSeleccionada = document.getElementById('filtroCategoria').value;

    const productosFiltrados = productos.filter(prod => {
        const coincideTexto = 
            prod.sku.toLowerCase().includes(textoBuscado) || 
            prod.nombre.toLowerCase().includes(textoBuscado);
            
        const coincideCategoria = (categoriaSeleccionada === 'todas') || (prod.categoria === categoriaSeleccionada);

        return coincideTexto && coincideCategoria;
    });

    mostrarInventario(productosFiltrados);
}

function inicializarFiltrosInventario() {
    const buscador = document.getElementById('buscadorInventario');
    const filtroCat = document.getElementById('filtroCategoria');

    if (buscador && filtroCat) {
        buscador.addEventListener('input', filtrarInventario);
        filtroCat.addEventListener('change', filtrarInventario);
    }
}

function actualizarEstadisticasInventario() {
    // Calculamos la matemática
    const total = productos.length;
    const disponibles = productos.filter(p => p.stock >= p.stockMinimo).length;
    const bajoStock = productos.filter(p => p.stock > 0 && p.stock < p.stockMinimo).length;
    const agotados = productos.filter(p => p.stock === 0).length;
    
    const unidadesTotales = productos.reduce((sum, p) => sum + p.stock, 0);
    const alertas = bajoStock + agotados;

    // Pintamos solo los cuadritos que existan en la página actual (index o inventario)
    if(document.getElementById('totalProductos')) document.getElementById('totalProductos').textContent = total;
    if(document.getElementById('productosDisponibles')) document.getElementById('productosDisponibles').textContent = disponibles;
    if(document.getElementById('productosStockBajo')) document.getElementById('productosStockBajo').textContent = bajoStock;
    if(document.getElementById('productosAgotados')) document.getElementById('productosAgotados').textContent = agotados;
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
    // Llama directamente a la API para refrescar los datos sin recargar la página
    cargarDatosDesdeMySQL().then(() => {
        alert('✅ Inventario sincronizado exitosamente con la base de datos MySQL.');
    });
}

// ============================================
// SISTEMA DE SESIONES Y UTILERÍA
// ============================================

function simularActualizacion() {
    cargarDatosDesdeMySQL().then(() => {
        alert('✅ La lista de pedidos fue actualizada desde la base de datos.');
    });
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
        document.getElementById('estadoContenedor').textContent = '✅ Activo (DB Conectada)';
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

    if (document.getElementById('version')) {
        document.getElementById('version').textContent = '1.0.0';
        mostrarInfoSistema();
    }
    
    if (document.getElementById('loginForm')) {
        inicializarLogin();
    } else {
        // Solo llamamos a la API si NO estamos en la pantalla de login
        cargarDatosDesdeMySQL();
    }
    
    console.log('🚀 Archivo script.js cargado, leyendo datos desde MySQL');
});

// Evitar errores de referencia en el navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pedidos, renderizarTablaPedidos, actualizarEstadisticas, simularActualizacion };
}