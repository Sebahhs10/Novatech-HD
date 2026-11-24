// ============================================
// DATOS DINÁMICOS (Conectados a MySQL)
// ============================================
const API_BASE = 'http://ikjfuxba2kdu3sfktqcbdzbk.134.209.6.203.sslip.io';
const API_PRODUCTOS = `${API_BASE}/api/productos`;
const API_PEDIDOS = `${API_BASE}/api/pedidos`;

let pedidos = [];
let productos = [];
let eventosInventarioInicializados = false;

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

function mostrarToast(mensaje, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${tipo === 'error' ? 'toast-error' : ''}`;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// ============================================
// CONEXIÓN AL BACKEND (NODE.JS + MYSQL)
// ============================================
async function cargarDatosDesdeMySQL() {
    try {
        const resProductos = await fetch(API_PRODUCTOS);
        const dataProductos = await resProductos.json();
        
        productos = dataProductos.map(prod => ({
            ...prod,
            stockMinimo: prod.stock_minimo
        }));

        const resPedidos = await fetch(API_PEDIDOS);
        pedidos = await resPedidos.json();

        console.log('✅ Datos cargados correctamente desde MySQL');

        actualizarEstadisticas();
        actualizarEstadisticasInventario();

        if (document.getElementById('tabla-pedidos')) {
            inicializarManejoPedidos();
        }

        if (document.getElementById('tabla-inventario')) {
            actualizarVistaInventario();

            if (!eventosInventarioInicializados) {
                eventosInventarioInicializados = true;
                document.getElementById('formProducto')?.addEventListener('submit', guardarProducto);
                document.getElementById('productoStock')?.addEventListener('input', actualizarPreviewEstado);
                document.getElementById('productoMinimo')?.addEventListener('input', actualizarPreviewEstado);
                document.getElementById('modalProducto')?.addEventListener('click', e => {
                    if (e.target.id === 'modalProducto') cerrarModalProducto();
                });
                document.addEventListener('keydown', e => {
                    if (e.key === 'Escape') cerrarModalProducto();
                });
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
// FUNCIONES DE INVENTARIO Y CRUD (MODAL)
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
    if (document.getElementById('reporteReposicion')) document.getElementById('reporteReposicion').textContent = alertas;
}

function abrirModalProducto(skuEditar = null) {
    const modal = document.getElementById('modalProducto');
    const form = document.getElementById('formProducto');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('skuOriginal').value = '';
    document.getElementById('formProductoTitulo').textContent = 'Nuevo producto';
    document.getElementById('guardarProductoBtn').textContent = 'Guardar producto';

    if (skuEditar) {
        const prod = productos.find(p => p.sku === skuEditar);
        if (!prod) return;
        document.getElementById('skuOriginal').value = prod.sku;
        document.getElementById('productoSku').value = prod.sku;
        document.getElementById('productoNombre').value = prod.nombre;
        document.getElementById('productoCategoria').value = prod.categoria;
        document.getElementById('productoStock').value = prod.stock;
        document.getElementById('productoMinimo').value = prod.stockMinimo;
        document.getElementById('formProductoTitulo').textContent = 'Editar producto';
        document.getElementById('guardarProductoBtn').textContent = 'Guardar cambios';
    }

    actualizarPreviewEstado();
    modal.hidden = false;
    document.getElementById('productoNombre').focus();
}

function cerrarModalProducto() {
    const modal = document.getElementById('modalProducto');
    if (modal) modal.hidden = true;
}

function ajustarNumero(inputId, delta) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const actual = parseInt(input.value, 10) || 0;
    input.value = Math.max(0, actual + delta);
    actualizarPreviewEstado();
}

function actualizarPreviewEstado() {
    const badge = document.getElementById('previewEstadoBadge');
    if (!badge) return;
    const stock = parseInt(document.getElementById('productoStock')?.value, 10) || 0;
    const minimo = parseInt(document.getElementById('productoMinimo')?.value, 10) || 0;
    const estado = estadoProducto({ stock, stockMinimo: minimo });
    badge.className = `estado ${estado.clase}`;
    badge.textContent = estado.texto.toUpperCase();
}

function generarSkuAutomatico() {
    const cat = document.getElementById('productoCategoria').value || 'GEN';
    const nombre = document.getElementById('productoNombre').value.trim();
    const prefijoCat = cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3).toUpperCase();
    const prefijoNom = nombre ? nombre.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() : 'PRD';
    const sufijo = Math.floor(100 + Math.random() * 900);
    document.getElementById('productoSku').value = `${prefijoCat}-${prefijoNom}-${sufijo}`;
}

async function guardarProducto(evento) {
    evento.preventDefault();
    const btn = document.getElementById('guardarProductoBtn');
    const sku = document.getElementById('productoSku').value.trim().toUpperCase();
    const nombre = document.getElementById('productoNombre').value.trim();
    const categoria = document.getElementById('productoCategoria').value;
    const stock = Number(document.getElementById('productoStock').value);
    const stockMinimo = Number(document.getElementById('productoMinimo').value);
    const skuOriginal = document.getElementById('skuOriginal').value;

    const esEdicion = Boolean(skuOriginal);
    const url = esEdicion ? `${API_PRODUCTOS}/${encodeURIComponent(skuOriginal)}` : API_PRODUCTOS;
    const method = esEdicion ? 'PUT' : 'POST';

    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, nombre, categoria, stock, stockMinimo })
        });

        if (response.ok) {
            cerrarModalProducto();
            await cargarDatosDesdeMySQL();
            mostrarToast(esEdicion ? '✅ Producto actualizado en MySQL' : '✅ Producto registrado en MySQL');
        } else {
            mostrarToast('❌ Error: el SKU ya existe o hubo un problema.', 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarToast('❌ No se pudo conectar con el servidor.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = esEdicion ? 'Guardar cambios' : 'Guardar producto';
    }
}

function editarProducto(sku) {
    abrirModalProducto(sku);
}

async function eliminarProducto(sku) {
    if (!confirm(`¿Eliminar definitivamente el producto ${sku} de la base de datos?`)) return;
    try {
        const response = await fetch(`${API_PRODUCTOS}/${encodeURIComponent(sku)}`, { method: 'DELETE' });
        if (response.ok) {
            await cargarDatosDesdeMySQL();
            mostrarToast(`🗑️ Producto ${sku} eliminado`);
        } else {
            mostrarToast('❌ No se pudo eliminar el producto.', 'error');
        }
    } catch (error) {
        console.error('Error eliminando:', error);
        mostrarToast('❌ Error de conexión al eliminar.', 'error');
    }
}

function registrarMovimiento(sku, tipo, cantidad, motivo) {
    const prod = productos.find(p => p.sku === sku);
    movimientosInventario.unshift({ id: `MOV-${Date.now()}`, fecha: new Date().toISOString(), sku, producto: prod ? prod.nombre : sku, tipo, cantidad, motivo: motivo || (tipo === 'entrada' ? 'Reposición de stock' : 'Salida de stock') });
    guardarMovimientos();
    renderizarHistorial();
}

async function moverStock(tipo) {
    const sku = document.getElementById('movimientoSku').value;
    const cantidad = Number(document.getElementById('movimientoCantidad').value);
    const motivo = document.getElementById('movimientoMotivo').value.trim();
    const prod = productos.find(p => p.sku === sku);
    
    if (!prod || cantidad <= 0) return;
    if (tipo === 'salida' && cantidad > prod.stock) {
        mostrarToast(`⚠️ Stock insuficiente. Disponible: ${prod.stock} unidades.`, 'error');
        return;
    }
    
    const nuevoStock = prod.stock + (tipo === 'entrada' ? cantidad : -cantidad);
    
    try {
        const response = await fetch(`${API_PRODUCTOS}/${encodeURIComponent(sku)}`, {
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
            await cargarDatosDesdeMySQL();
            mostrarToast(`✅ ${tipo.toUpperCase()} registrada. Stock actualizado.`);
        }
    } catch (error) {
        console.error('Error actualizando stock:', error);
        mostrarToast('❌ Error actualizando stock.', 'error');
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
    mostrarToast('📄 Función de exportación lista.');
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
        mostrarToast('✅ Inventario sincronizado con MySQL');
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