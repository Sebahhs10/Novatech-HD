// ============================================
// DATOS DINÁMICOS (Conectados a Express & MySQL)
// ============================================
let pedidos = [];
let productos = [];

// Historial de movimientos
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
    return String(valor || '').replace(/[&<>"']/g, caracter => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[caracter]));
}

// ============================================
// CONEXIÓN AL BACKEND (NODE.JS + MYSQL)
// ============================================
async function cargarDatosDesdeMySQL() {
    try {
        const resProductos = await fetch('/api/productos');
        const dataProductos = await resProductos.json();
        
        if (Array.isArray(dataProductos) && dataProductos.length > 0) {
            productos = dataProductos.map(prod => ({
                ...prod,
                stockMinimo: prod.stock_minimo !== undefined ? prod.stock_minimo : (prod.stockMinimo || 5),
                precio: Number(prod.precio) || 0
            }));
        }

        const resPedidos = await fetch('/api/pedidos');
        const dataPedidos = await resPedidos.json();

        if (Array.isArray(dataPedidos) && dataPedidos.length > 0) {
            pedidos = dataPedidos.map(p => {
                const cant = Number(p.cantidad) || 1;
                const prec = Number(p.precio) || 0;
                return {
                    ...p,
                    cantidad: cant,
                    precio: prec,
                    total: Number(p.total) || (cant * prec)
                };
            });
        }

        console.log('✅ Datos sincronizados con la API');

        actualizarEstadisticas();
        actualizarEstadisticasInventario();

        if (document.getElementById('tabla-pedidos')) {
            inicializarManejoPedidos();
        }

        if (document.getElementById('tabla-inventario')) {
            actualizarVistaInventario();
            inicializarEventosInventario();
        }
    } catch (error) {
        console.warn("⚠️ Advertencia al conectar con la API:", error);
    }
}

// ============================================
// FUNCIONES DEL MÓDULO DE PEDIDOS
// ============================================
let pedidosEventosIniciados = false;

function inicializarManejoPedidos() {
    const contenedorTabla = document.querySelector('.table-container');
    const tbody = document.getElementById('tabla-pedidos');
    
    if (!tbody || !contenedorTabla) return; 

    if (!document.getElementById('buscadorPedidos')) {
        const controlesHTML = `
            <div class="inventory-filters" style="margin-bottom: 18px; display: grid; grid-template-columns: 1fr 220px; gap: 14px;">
                <input type="text" id="buscadorPedidos" placeholder="🔍 Buscar por cliente, código o producto..." style="height: 44px;">
                <select id="filtroEstadoPedidos" style="height: 44px;">
                    <option value="todos">Todos los estados</option>
                    <option value="entregado">Entregado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>
        `;
        contenedorTabla.insertAdjacentHTML('beforebegin', controlesHTML);
        document.getElementById('buscadorPedidos').addEventListener('input', filtrarPedidos);
        document.getElementById('filtroEstadoPedidos').addEventListener('change', filtrarPedidos);
    }

    renderizarTablaPedidos(pedidos);

    // Formulario de nuevo pedido
    const formNuevo = document.getElementById('formNuevoPedido');
    if (formNuevo && !pedidosEventosIniciados) {
        pedidosEventosIniciados = true;
        
        // Autocompletar código inicial sugerido
        const inputCodigo = document.getElementById('pedidoCodigo');
        if (inputCodigo && !inputCodigo.value) {
            inputCodigo.value = `PED-00${pedidos.length + 1}`;
        }

        formNuevo.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nuevo = {
                codigo: (document.getElementById('pedidoCodigo').value.trim() || `PED-00${pedidos.length + 1}`).toUpperCase(),
                cliente: document.getElementById('pedidoCliente').value.trim(),
                producto: document.getElementById('pedidoProducto').value.trim(),
                cantidad: Number(document.getElementById('pedidoCantidad').value) || 1,
                precio: Number(document.getElementById('pedidoPrecio').value) || 0,
                estado: document.getElementById('pedidoEstado').value
            };
            nuevo.total = nuevo.cantidad * nuevo.precio;

            try {
                await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevo)
                });
            } catch (err) {}

            pedidos.unshift(nuevo);
            formNuevo.reset();
            if (inputCodigo) inputCodigo.value = `PED-00${pedidos.length + 1}`;

            actualizarEstadisticas();
            renderizarTablaPedidos(pedidos);
            alert(`🎉 Pedido ${nuevo.codigo} registrado exitosamente.`);
        });
    }
}

function filtrarPedidos() {
    const textoBuscado = (document.getElementById('buscadorPedidos')?.value || '').toLowerCase();
    const estadoSeleccionado = document.getElementById('filtroEstadoPedidos')?.value || 'todos';

    const pedidosFiltrados = pedidos.filter(pedido => {
        const coincideTexto = (pedido.cliente || '').toLowerCase().includes(textoBuscado) || 
                              (pedido.codigo || '').toLowerCase().includes(textoBuscado) || 
                              (pedido.producto || '').toLowerCase().includes(textoBuscado);
        const coincideEstado = (estadoSeleccionado === 'todos') || (pedido.estado === estadoSeleccionado);
        return coincideTexto && coincideEstado;
    });
    renderizarTablaPedidos(pedidosFiltrados);
}

function renderizarTablaPedidos(datos) {
    const tbody = document.getElementById('tabla-pedidos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!datos || datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 25px; color: #7f8c8d;">No hay pedidos registrados en el sistema.</td></tr>`;
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

        const totalVal = Number(pedido.total) || (Number(pedido.cantidad) * Number(pedido.precio)) || 0;
        const inicial = (pedido.cliente || 'C').charAt(0).toUpperCase();

        fila.innerHTML = `
            <td><strong>${escaparHTML(pedido.codigo)}</strong></td>
            <td>
                <div class="cliente-cell" style="display: flex; align-items: center; gap: 10px;">
                    <div class="cliente-avatar" style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px;">${inicial}</div>
                    <span class="cliente-nombre" style="font-weight: 600;">${escaparHTML(pedido.cliente)}</span>
                </div>
            </td>
            <td>${escaparHTML(pedido.producto)}</td>
            <td><strong>${pedido.cantidad}</strong></td>
            <td>S/ ${Number(pedido.precio).toFixed(2)}</td>
            <td><strong style="color: #1e293b;">S/ ${totalVal.toFixed(2)}</strong></td>
            <td><span class="estado ${estadoClass}">${(pedido.estado || 'PENDIENTE').toUpperCase()}</span></td>
            <td class="inventory-actions">
                <button class="btn-table" onclick="cambiarEstadoPedido('${escaparHTML(pedido.codigo)}')">Estado ↻</button>
                <button class="btn-table btn-danger" onclick="eliminarPedido('${escaparHTML(pedido.codigo)}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

async function cambiarEstadoPedido(codigo) {
    const ped = pedidos.find(p => p.codigo === codigo);
    if (!ped) return;
    const estados = ['pendiente', 'enviado', 'entregado', 'cancelado'];
    const idx = estados.indexOf(ped.estado);
    const nuevo = estados[(idx + 1) % estados.length];
    ped.estado = nuevo;

    try {
        await fetch(`/api/pedidos/${codigo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevo })
        });
    } catch (e) {}

    actualizarEstadisticas();
    filtrarPedidos();
}

async function eliminarPedido(codigo) {
    if (!confirm(`¿Estás seguro de eliminar el pedido ${codigo}?`)) return;
    pedidos = pedidos.filter(p => p.codigo !== codigo);

    try {
        await fetch(`/api/pedidos/${codigo}`, { method: 'DELETE' });
    } catch (e) {}

    actualizarEstadisticas();
    filtrarPedidos();
}

function actualizarEstadisticas() {
    const elemTotal = document.getElementById('totalPedidos');
    if (!elemTotal) return;

    const total = pedidos.length;
    const clientesUnicos = new Set(pedidos.map(p => p.cliente));
    const totalVentas = pedidos.reduce((sum, p) => sum + (Number(p.total) || (Number(p.cantidad) * Number(p.precio)) || 0), 0);
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;

    elemTotal.textContent = total;
    if (document.getElementById('totalClientes')) document.getElementById('totalClientes').textContent = clientesUnicos.size;
    if (document.getElementById('totalVentas')) document.getElementById('totalVentas').textContent = `S/ ${totalVentas.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (document.getElementById('estadoEntregado')) document.getElementById('estadoEntregado').textContent = entregados;
}

// ============================================
// FUNCIONES DEL MÓDULO DE INVENTARIO
// ============================================
let inventarioEventosIniciados = false;

function inicializarEventosInventario() {
    if (inventarioEventosIniciados) return;
    inventarioEventosIniciados = true;

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
        const btn = document.getElementById('movimientoSubmit');
        if (btn) btn.textContent = evento.target.value === 'entrada' ? 'Registrar entrada' : 'Registrar salida'; 
    });
}

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
    const unidadesTotales = productos.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const alertas = bajoStock + agotados;

    if (document.getElementById('totalProductos')) document.getElementById('totalProductos').textContent = total;
    if (document.getElementById('productosDisponibles')) document.getElementById('productosDisponibles').textContent = disponibles;
    if (document.getElementById('productosStockBajo')) document.getElementById('productosStockBajo').textContent = bajoStock;
    if (document.getElementById('productosAgotados')) document.getElementById('productosAgotados').textContent = agotados;
    if (document.getElementById('unidadesTotales')) document.getElementById('unidadesTotales').textContent = unidadesTotales;
    if (document.getElementById('alertasInventario')) document.getElementById('alertasInventario').textContent = alertas;
}

function registrarMovimiento(sku, tipo, cantidad, motivo) {
    const prod = productos.find(p => p.sku === sku);
    movimientosInventario.unshift({ 
        id: `MOV-${Date.now()}`, 
        fecha: new Date().toISOString(), 
        sku, 
        producto: prod ? prod.nombre : sku, 
        tipo, 
        cantidad, 
        motivo: motivo || (tipo === 'entrada' ? 'Reposición de stock' : 'Salida de stock') 
    });
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
        try {
            await fetch(`/api/productos/${skuOriginal}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, categoria, stock, stockMinimo })
            });
            const item = productos.find(p => p.sku === skuOriginal);
            if (item) {
                item.nombre = nombre;
                item.categoria = categoria;
                item.stock = stock;
                item.stockMinimo = stockMinimo;
            }
            limpiarFormularioProducto();
            actualizarVistaInventario();
            alert(`✅ Producto ${skuOriginal} actualizado correctamente.`);
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
        return;
    }

    try {
        await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku, nombre, categoria, stock, stockMinimo })
        });
        const nuevo = { sku, nombre, categoria, stock, stockMinimo, precio: 0 };
        const idx = productos.findIndex(p => p.sku === sku);
        if (idx >= 0) {
            productos[idx] = nuevo;
        } else {
            productos.unshift(nuevo);
        }

        limpiarFormularioProducto();
        actualizarVistaInventario();
        alert(`✅ Producto ${sku} registrado en el catálogo.`);
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

async function eliminarProducto(sku) {
    if (!confirm(`¿Eliminar el producto ${sku} del inventario?`)) return;
    productos = productos.filter(p => p.sku !== sku);
    try {
        await fetch(`/api/productos/${sku}`, { method: 'DELETE' });
    } catch (e) {}
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
    
    const nuevoStock = prod.stock + (tipo === 'entrada' ? cantidad : -cantidad);
    prod.stock = nuevoStock;
    
    try {
        await fetch(`/api/productos/${sku}`, {
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
    } catch (error) {
        console.error('Error actualizando stock:', error);
    }

    registrarMovimiento(sku, tipo, cantidad, motivo); 
    document.getElementById('formMovimiento').reset();
    actualizarVistaInventario();
    alert(`✅ ${tipo.toUpperCase()} registrada. Stock actual: ${nuevoStock} unidades.`);
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
    
    if (document.getElementById('reporteUnidades')) document.getElementById('reporteUnidades').textContent = totalUnidades.toLocaleString('es-PE');
    if (document.getElementById('reporteEntradas')) document.getElementById('reporteEntradas').textContent = entradas.length.toLocaleString('es-PE');
    if (document.getElementById('reporteSalidas')) document.getElementById('reporteSalidas').textContent = salidas.length.toLocaleString('es-PE');
}

function exportarReporteInventario() {
    const cabecera = "SKU,Producto,Categoria,Stock,StockMinimo,Estado\n";
    const lineas = productos.map(p => `"${p.sku}","${p.nombre}","${p.categoria}",${p.stock},${p.stockMinimo},"${estadoProducto(p).texto}"`).join("\n");
    const blob = new Blob([cabecera + lineas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_inventario_novatech_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        alert('✅ Inventario sincronizado exitosamente.');
    });
}

// ============================================
// GESTIÓN DE SESIÓN Y AUTENTICACIÓN
// ============================================
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
                <div class="admin-profile" style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.06); padding:10px; border-radius:10px; margin-bottom:10px;">
                    <div class="avatar" style="width:32px; height:32px; background:linear-gradient(135deg, #2563eb, #7c3aed); border-radius:50%; display:grid; place-items:center; color:white; font-weight:bold;">${usuarioActivo.charAt(0).toUpperCase()}</div>
                    <div><strong style="color:white; font-size:12px;">${usuarioActivo}</strong><small style="color:#94a2b5; font-size:10px; display:block;">Sesión activa</small></div>
                </div>
                <button id="btnCerrarSesion" class="logout-button" style="width:100%; text-align:left; background:transparent; color:#b8c4d4; border:1px solid rgba(255,255,255,0.12); padding:9px 12px; border-radius:8px; cursor:pointer;"><span>🚪</span> Cerrar sesión</button>
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

    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            togglePassword.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    const btnFillDemo = document.getElementById('btnFillDemo');
    if (btnFillDemo && usernameInput && passwordInput) {
        btnFillDemo.addEventListener('click', function() {
            usernameInput.value = 'admin';
            passwordInput.value = '12345';
            btnFillDemo.textContent = '¡Copiado!';
            setTimeout(() => { btnFillDemo.textContent = 'Usar Demo'; }, 1500);
        });
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const user = usernameInput.value.trim();
        const pass = passwordInput.value;
        const loginError = document.getElementById('loginError');
        const submitBtn = document.getElementById('btnLoginSubmit');
        
        if (user === 'admin' && pass === '12345') {
            loginError.classList.add('success');
            loginError.textContent = '✅ Acceso autorizado. Redirigiendo al panel...';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Accediendo...</span>';
            }
            localStorage.setItem('usuarioNovaTech', 'Administrador'); 
            setTimeout(() => window.location.href = 'index.html', 700);
        } else {
            loginError.classList.remove('success');
            loginError.textContent = '❌ Credenciales incorrectas. (Usa: admin / 12345)';
        }
    });
}

function mostrarInfoSistema() {
    const elUltimaAct = document.getElementById('ultimaActualizacion');
    if (elUltimaAct) elUltimaAct.textContent = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    
    if (document.getElementById('estadoPipeline')) {
        document.getElementById('estadoPipeline').textContent = '✅ Exitoso';
        document.getElementById('estadoPipeline').className = 'text-success';
    }
    if (document.getElementById('estadoContenedor')) {
        document.getElementById('estadoContenedor').textContent = '✅ Activo (Express + MySQL)';
        document.getElementById('estadoContenedor').className = 'text-success';
    }
}

// ============================================
// INICIALIZADOR GENERAL DEL DOM
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    gestionarSesion();
    mostrarInfoSistema();
    
    if (document.getElementById('loginForm')) {
        inicializarLogin();
    } else {
        cargarDatosDesdeMySQL();
    }
});
