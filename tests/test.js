// Simulación de prueba de la aplicación
const pedidos = [
    { codigo: 'PED-001', cliente: 'María González', producto: 'Laptop HP 15', cantidad: 2, precio: 2450.00, estado: 'entregado' },
    { codigo: 'PED-002', cliente: 'Carlos Ruiz', producto: 'Mouse Logitech MX', cantidad: 5, precio: 89.90, estado: 'pendiente' },
    { codigo: 'PED-003', cliente: 'Ana Torres', producto: 'Monitor Samsung 24"', cantidad: 1, precio: 1299.00, estado: 'enviado' }
];

// Prueba 1: Verificar que todos los pedidos tengan código
function testPedidosTienenCodigo() {
    const resultado = pedidos.every(p => p.codigo && p.codigo.startsWith('PED-'));
    console.log(resultado ? '✅ Prueba 1: Todos los pedidos tienen código' : '❌ Prueba 1: Algun pedido sin código');
    return resultado;
}

// Prueba 2: Verificar que todos los pedidos tengan estado válido
function testPedidosTienenEstadoValido() {
    const estadosValidos = ['entregado', 'pendiente', 'enviado', 'cancelado'];
    const resultado = pedidos.every(p => estadosValidos.includes(p.estado));
    console.log(resultado ? '✅ Prueba 2: Todos los pedidos tienen estado válido' : '❌ Prueba 2: Algun pedido con estado inválido');
    return resultado;
}

// Prueba 3: Verificar que los precios sean números positivos
function testPreciosPositivos() {
    const resultado = pedidos.every(p => p.precio > 0 && p.cantidad > 0);
    console.log(resultado ? '✅ Prueba 3: Todos los precios y cantidades son positivos' : '❌ Prueba 3: Algun precio o cantidad es negativo o cero');
    return resultado;
}

// Ejecutar todas las pruebas
function ejecutarPruebas() {
    console.log('🧪 EJECUTANDO PRUEBAS...');
    const resultados = [
        testPedidosTienenCodigo(),
        testPedidosTienenEstadoValido(),
        testPreciosPositivos()
    ];
    
    const todasPasaron = resultados.every(r => r === true);
    console.log(todasPasaron ? '🎉 TODAS LAS PRUEBAS PASARON' : '❌ ALGUNA PRUEBA FALLÓ');
    return todasPasaron;
}

// Si se ejecuta directamente
if (require.main === module) {
    ejecutarPruebas();
}

module.exports = { testPedidosTienenCodigo, testPedidosTienenEstadoValido, testPreciosPositivos, ejecutarPruebas };