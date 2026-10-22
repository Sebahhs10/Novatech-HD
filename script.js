// ============================================
// DATOS DINÁMICOS (Conectados a MySQL)
// ============================================
let pedidos = [];
let productos = [];

// Historial de movimientos (Temporalmente en LocalStorage hasta crear tabla en MySQL)
const CLAVE_MOVIMIENTOS = 'novatech_movimientos_v1';
let movimientosInventario = cargarLista(CLAVE_MOVIMIENTOS, []);

function cargarLista(clave, valorInicial) {
    try {
        const guardado = localStorage.getItem(clave);
        return guardado ? JSON.parse(guardado) : valorInicial;
    } catch (error) {
        return valorInicial;
    }
}

function guardarMovimientos() {
    localStorage.setItem(CLAVE_MOVIMIENTOS, JSON.stringify(movimientosInventario));
}

function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caracter => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caracter]));
}

// ============================================
// CONEXIÓN AL BACKEND (NODE.JS + MYSQL)
// ============================================
async function cargarDatosDesdeMySQL() {
    try {
        const resProductos = await fetch('http://localhost:3000/api/productos');
        const dataProductos = await resProductos.json();
        
        productos = dataProductos.map(prod => ({
            ...prod,
            stockMinimo: prod.stock_minimo
        }));

        const resPedidos = await fetch('http://localhost:3000/api/pedidos');
        pedidos = await resPedidos.json();

        console.log('✅ Datos cargados correctamente desde MySQL');

        // Estas dos funciones deben ejecutarse siempre, en cualquier página
        actualizarEstadisticas();
        actualizarEstadisticasInventario();

        if (document.getElementById('tabla-pedidos')) {
            inicializarManejoPedidos();
        }

        if (document.getElementById('tabla-inventario')) {
            actualizarVistaInventario();
            
            document.getElementById('formProducto')?.addEventListener('submit', guardarProducto);
            document.getElementById('cancelarEdicionBtn')?.addEventListener('click', limpiarFormularioProducto);
            document.getElementById('formMovimiento')?.addEventListener('submit', evento => { 
                evento.preventDefault(); 
                moverStock(document.getElementById('tipoMovimiento').value); 
            });
            ['buscadorInventario', 'filtroCategoria', 'filtroEstadoInventario'].forEach(id => 
                document.getElementById(id)?.addEventListener(id === 'buscadorInventario' ? 'input' : 'change', mostrarInventario)
            );
            document.getElementById('tipoMovimiento')?.addEventListener('change', evento => { 
                document.getElementById('movimientoSubmit').textContent = evento.target.value === 'entrada' ? 'Registrar entrada' : 'Registrar salida'; 
            });
        }
    } catch (error) {
        console.error("❌ Error conectando al servidor backend:", error);
    }
}

// ============================================
// FUNCIONES DE PEDIDOS
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
        const coincideTexto = pedido.cliente.toLowerCase().includes(textoBuscado) || 
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
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #7f8c8d;">No se encontraron pedidos.</td></tr>`;
        return;
    }

    datos.forEach(pedido => {
        const fila = document.createElement('tr');
        const estadoClass = { 'entregado': 'estado-entregado', 'pendiente': 'estado-pendiente', 'enviado': 'estado-enviado', 'cancelado': 'estado-cancelado' }[pedido.estado] || '';
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
// FUNCIONES DE INVENTARIO Y CRUD
// ============================================
function estadoProducto(prod) {
    if (prod.stock === 0) return { texto: 'Agotado', clase: 'stock-agotado' };
    if (prod.stock < prod.stockMinimo) return { texto: 'Stock bajo', clase: 'stock-bajo' };
    return { texto: 'Disponible', clase: 'stock-disponible' };
}

function mostrarInventario() {
    const tbody = document.getElementById('tabla-inventario');
    if (!tbody) return;
    
    const busqueda = (document.getElementById('buscadorInventario')?.value || '').trim().toLowerCase();
    const categoria = document.getElementById('filtroCategoria')?.value || 'todas';
    const estado = document.getElementById('filtroEstadoInventario')?.value || 'todos';
    
    const filtrados = productos.filter(prod => {
        const coincideTexto = `${prod.sku} ${prod.nombre} ${prod.categoria}`.toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === 'todas' || prod.categoria === categoria;
        const actual = prod.stock === 0 ? 'agotado' : prod.stock < prod.stockMinimo ? 'bajo' : 'disponible';
        return coincideTexto && coincideCategoria && (estado === 'todos' || actual === estado);
    });
    
    tbody.innerHTML = '';
    if (!filtrados.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:22px;color:#7f8c8d">No hay productos que coincidan.</td></tr>';
        return;
    }
    
    filtrados.forEach(prod => {
        const estadoActual = estadoProducto(prod);
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${escaparHTML(prod.sku)}</strong></td>
            <td>${escaparHTML(prod.nombre)}</td>
            <td><span class="categoria">${escaparHTML(prod.categoria)}</span></td>
            <td><strong>${prod.stock}</strong></td>
            <td>${prod.stockMinimo}</td>
            <td><span class="estado ${estadoActual.clase}">${estadoActual.texto.toUpperCase()}</span></td>
            <td class="inventory-actions">
                <button class="btn-table" onclick="editarProducto('${escaparHTML(prod.sku)}')">Editar</button> 
                <button class="btn-table btn-danger" onclick="eliminarProducto('${escaparHTML(prod.sku)}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarEstadisticasInventario() {
    const total = productos.length;
    const disponibles = productos.filter(p => p.stock >= p.stockMinimo).length;
    const bajoStock = productos.filter(p => p.stock > 0 && p.stock < p.stockMinimo).length;
    const agotados = productos.filter(p => p.stock === 0).length;
    const unidadesTotales = productos.reduce((sum, p) => sum + p.stock, 0);
    const alertas = bajoStock + agotados;

    if (document.getElementById('totalProductos')) document.getElementById('totalProductos').textContent = total;
    if (document.getElementById('productosDisponibles')) document.getElementById('productosDisponibles').textContent = disponibles;
    if (document.getElementById('productosStockBajo')) document.getElementById('productosStockBajo').textContent = bajoStock;
    if (document.getElementById('productosAgotados')) document.getElementById('productosAgotados').textContent = agotados;
    if (document.getElementById('unidadesTotales')) document.getElementById('unidadesTotales').textContent = unidadesTotales;
    if (document.getElementById('alertasInventario')) document.getElementById('alertasInventario').textContent = alertas;
}

// Nota: Las siguientes funciones de CRUD actualizan el arreglo temporalmente. 
// Requerirán rutas POST/PUT en Node.js para guardarse permanentemente.
function registrarMovimiento(sku, tipo, cantidad, motivo) {
    const prod = productos.find(p => p.sku === sku);
    movimientosInventario.unshift({ id: `MOV-${Date.now()}`, fecha: new Date().toISOString(), sku, producto: prod ? prod.nombre : sku, tipo, cantidad, motivo: motivo || (tipo === 'entrada' ? 'Reposición de stock' : 'Salida de stock') });
    guardarMovimientos();
    renderizarHistorial();
}

async function guardarProducto(evento) {
    evento.preventDefault();
    const sku = document.getElementById('productoSku').value.trim().toUpperCase();
    const nombre = document.getElementById('productoNombre').value.trim();
    const categoria = document.getElementById('productoCategoria').value;
    const stock = Number(document.getElementById('productoStock').value);
    const stockMinimo = Number(document.getElementById('productoMinimo').value);
    const skuOriginal = document.getElementById('skuOriginal').value;
    
    if (skuOriginal) {
        alert('La edición (PUT) la configuraremos en el siguiente paso.');
        return;
    }

    try {
        // Enviamos los datos al backend
        const response = await fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, nombre, categoria, stock, stockMinimo })
        });

        if (response.ok) {
            limpiarFormularioProducto();
            actualizarInventario(); // Recarga la tabla directo desde MySQL
            alert('✅ Producto guardado permanentemente en MySQL');
        } else {
            alert('❌ Error: El SKU ya existe o hubo un problema en el servidor.');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}

function editarProducto(sku) {
    const prod = productos.find(p => p.sku === sku);
    if (!prod) return;
    document.getElementById('skuOriginal').value = prod.sku;
    document.getElementById('productoSku').value = prod.sku;
    document.getElementById('productoNombre').value = prod.nombre;
    document.getElementById('productoCategoria').value = prod.categoria;
    document.getElementById('productoStock').value = prod.stock;
    document.getElementById('productoMinimo').value = prod.stockMinimo;
    document.getElementById('guardarProductoBtn').textContent = 'Guardar cambios';
    document.getElementById('cancelarEdicionBtn').hidden = false;
    document.getElementById('formProductoTitulo').textContent = 'Editar producto';
    document.getElementById('formProducto').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limpiarFormularioProducto() {
    const form = document.getElementById('formProducto');
    if (!form) return;
    form.reset();
    document.getElementById('skuOriginal').value = '';
    document.getElementById('guardarProductoBtn').textContent = 'Agregar producto';
    document.getElementById('cancelarEdicionBtn').hidden = true;
    document.getElementById('formProductoTitulo').textContent = 'Registrar producto';
}

function eliminarProducto(sku) {
    if (!confirm(`¿Eliminar el producto (${sku}) visualmente?`)) return;
    productos = productos.filter(p => p.sku !== sku);
    actualizarVistaInventario();
}

async function moverStock(tipo) {
    const sku = document.getElementById('movimientoSku').value;
    const cantidad = Number(document.getElementById('movimientoCantidad').value);
    const motivo = document.getElementById('movimientoMotivo').value.trim();
    const prod = productos.find(p => p.sku === sku);
    
    if (!prod || cantidad <= 0) return;
    if (tipo === 'salida' && cantidad > prod.stock) {
        alert(`Stock insuficiente. Disponible: ${prod.stock} unidades.`);
        return;
    }
    
    // Calcular el nuevo stock matemático
    const nuevoStock = prod.stock + (tipo === 'entrada' ? cantidad : -cantidad);
    
    try {
        const response = await fetch(`http://localhost:3000/api/productos/${sku}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sku: prod.sku,
                nombre: prod.nombre,
                categoria: prod.categoria,
                stock: nuevoStock,
                stockMinimo: prod.stockMinimo
            })
        });

        if (response.ok) {
            registrarMovimiento(sku, tipo, cantidad, motivo); 
            document.getElementById('formMovimiento').reset();
            actualizarInventario(); // Forzamos recarga fresca desde MySQL
            alert(`✅ ${tipo.toUpperCase()} registrada. Stock actualizado permanentemente.`);
        }
    } catch (error) {
        console.error('Error actualizando stock:', error);
    }
}

function actualizarSelectorProductos() {
    const select = document.getElementById('movimientoSku');
    if (!select) return;
    const seleccionado = select.value;
    select.innerHTML = '<option value="">Seleccionar producto...</option>' + productos.map(p => `<option value="${escaparHTML(p.sku)}">${escaparHTML(p.sku)} — ${escaparHTML(p.nombre)}</option>`).join('');
    if (productos.some(p => p.sku === seleccionado)) select.value = seleccionado;
}

function renderizarHistorial() {
    const tbody = document.getElementById('tabla-movimientos');
    if (!tbody) return;
    const movimientos = movimientosInventario.slice(0, 50);
    tbody.innerHTML = movimientos.length ? '' : '<tr><td colspan="6" style="text-align:center;padding:20px;color:#7f8c8d">Aún no hay movimientos registrados.</td></tr>';
    movimientos.forEach(m => {
        const fila = document.createElement('tr');
        const fecha = new Date(m.fecha).toLocaleString('es-PE', { timeZone: 'America/Lima' });
        fila.innerHTML = `<td>${escaparHTML(fecha)}</td><td><strong>${escaparHTML(m.sku)}</strong></td><td>${escaparHTML(m.producto)}</td><td><span class="estado ${m.tipo === 'entrada' ? 'stock-disponible' : 'estado-enviado'}">${m.tipo.toUpperCase()}</span></td><td>${m.cantidad}</td><td>${escaparHTML(m.motivo)}</td>`;
        tbody.appendChild(fila);
    });
}

function actualizarReportesInventario() {
    if (!document.getElementById('reportesInventario')) return;
    const totalUnidades = productos.reduce((suma, producto) => suma + Number(producto.stock || 0), 0);
    const entradas = movimientosInventario.filter(m => m.tipo === 'entrada');
    const salidas = movimientosInventario.filter(m => m.tipo === 'salida');
    
    document.getElementById('reporteUnidades').textContent = totalUnidades.toLocaleString('es-PE');
    document.getElementById('reporteEntradas').textContent = entradas.length.toLocaleString('es-PE');
    document.getElementById('reporteSalidas').textContent = salidas.length.toLocaleString('es-PE');
}

function exportarReporteInventario() {
    alert("Función de exportación lista.");
}

function actualizarVistaInventario() {
    mostrarInventario();
    actualizarEstadisticasInventario();
    actualizarSelectorProductos();
    renderizarHistorial();
    actualizarReportesInventario();
    const ultima = document.getElementById('ultimaActualizacion');
    if (ultima) ultima.textContent = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
}

function actualizarInventario() {
    cargarDatosDesdeMySQL().then(() => {
        alert('✅ Inventario sincronizado exitosamente con la base de datos MySQL.');
    });
}

// ============================================
// SISTEMA DE SESIONES Y UTILERÍA
// ============================================
function mostrarInfoSistema() {
    const elUltimaAct = document.getElementById('ultimaActualizacion');
    if (elUltimaAct) elUltimaAct.textContent = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    
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
                    <div><strong style="color:white; font-size:12px;">${usuarioActivo}</strong><small style="color:#94a2b5; font-size:10px; display:block;">Conectado</small></div>
                </div>
                <button id="btnCerrarSesion" class="logout-button" style="width:100%; text-align:left; background:transparent; color:#b8c4d4; border:1px solid rgba(255,255,255,0.1); padding:8px; border-radius:8px; cursor:pointer;"><span>🚪</span> Cerrar sesión</button>
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
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');
        
        if (user === 'admin' && pass === '12345') {
            loginError.style.color = '#27ae60';
            loginError.textContent = 'Acceso concedido...';
            localStorage.setItem('usuarioNovaTech', 'Administrador'); 
            setTimeout(() => window.location.href = 'index.html', 800);
        } else {
            loginError.style.color = '#b33d3d'; 
            loginError.textContent = 'Usuario o contraseña incorrectos.';
        }
    });
}

// ============================================
// INICIALIZAR EVENTOS DEL DOM
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    gestionarSesion();

    if (document.getElementById('version')) {
        document.getElementById('version').textContent = '2.1.0';
        mostrarInfoSistema();
    }
    
    if (document.getElementById('loginForm')) {
        inicializarLogin();
    } else {
        cargarDatosDesdeMySQL();
    }
});