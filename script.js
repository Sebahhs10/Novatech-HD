// ============================================
// DATOS DE PEDIDOS
// ============================================
const pedidos = [
    { codigo: 'PED-001', cliente: 'María González', producto: 'Laptop HP 15', cantidad: 2, precio: 2450.00, total: 4900.00, estado: 'entregado' },
    { codigo: 'PED-002', cliente: 'Carlos Ruiz', producto: 'Mouse Logitech MX', cantidad: 5, precio: 89.90, total: 449.50, estado: 'pendiente' },
    { codigo: 'PED-003', cliente: 'Ana Torres', producto: 'Monitor Samsung 24"', cantidad: 1, precio: 1299.00, total: 1299.00, estado: 'enviado' },
    { codigo: 'PED-004', cliente: 'Luis Fernández', producto: 'Teclado Mecánico RGB', cantidad: 3, precio: 159.00, total: 477.00, estado: 'cancelado' },
    { codigo: 'PED-005', cliente: 'Elena Castro', producto: 'Disco SSD 1TB', cantidad: 4, precio: 320.00, total: 1280.00, estado: 'entregado' }
];

// ============================================
// FUNCIONES
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

// ============================================
// SISTEMA DE SESIONES Y LOGIN
// ============================================

// 5. NUEVO: Gestionar la sesión activa (Mostrar usuario y cerrar sesión)
function gestionarSesion() {
    // Revisar si hay un usuario guardado en la "memoria" del navegador (localStorage)
    const usuarioActivo = localStorage.getItem('usuarioNovaTech');
    
    // Saber si estamos en la pantalla de Login
    const esPaginaLogin = window.location.pathname.toLowerCase().includes('login.html');

    // REGLA 1: Si NO hay usuario y NO estamos en el login, botarlo al login (Seguridad)
    if (!usuarioActivo && !esPaginaLogin) {
        window.location.href = 'Login.html';
        return;
    }

    // REGLA 2: Si SÍ hay usuario y estamos en el login, mandarlo directo al dashboard
    if (usuarioActivo && esPaginaLogin) {
        window.location.href = 'index.html';
        return;
    }

    // REGLA 3: Si SÍ hay usuario y estamos en el portal, mostrar su perfil
    if (usuarioActivo && !esPaginaLogin) {
        const sidebarBottom = document.querySelector('.sidebar-bottom');
        if (sidebarBottom) {
            // Crear la estructura HTML del perfil usando las clases de tu CSS
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
            
            // Insertar este código justo al inicio del sidebar-bottom
            sidebarBottom.insertAdjacentHTML('afterbegin', perfilHTML);

            // Darle vida al botón de Cerrar Sesión
            document.getElementById('btnCerrarSesion').addEventListener('click', function() {
                // Borrar al usuario de la memoria
                localStorage.removeItem('usuarioNovaTech');
                // Redirigir al login
                window.location.href = 'Login.html';
            });
        }
    }
}

// 6. ACTUALIZADO: Inicializar el Login con persistencia
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

            // Validamos credenciales
            if (user === 'admin' && pass === '12345') {
                loginError.style.color = '#27ae60';
                loginError.textContent = 'Acceso concedido. Iniciando sesión...';
                
                // GUARDAR EL USUARIO EN EL NAVEGADOR
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
    // 1. Lo primero que debe hacer la app es verificar la sesión
    gestionarSesion();

    if (document.getElementById('version')) {
        document.getElementById('version').textContent = '1.0.0';
        mostrarPedidos();
        mostrarInfoSistema();
    }
    
    if (document.getElementById('loginForm')) {
        inicializarLogin();
    }
    
    console.log('🚀 Archivo script.js cargado y sesión verificada');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pedidos, mostrarPedidos, actualizarEstadisticas, simularActualizacion };
}
