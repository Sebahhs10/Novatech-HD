/**
 * tests/test.js
 * Suite de pruebas automatizadas para NovaTech S.A.C.
 * 
 * Requisitos:
 * - Valida sintaxis de todos los scripts JS (node --check)
 * - Valida existencia de archivos estructurales del proyecto
 * - Valida contenido mínimo esperado en index.html, incidencias.html y vistas principales
 * - Valida reglas de negocio en pedidos, inventario e incidencias
 * - Salida con código 0 si todo es exitoso, código 1 si alguna prueba falla
 * - Sin dependencias externas (Node.js nativo puro)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

// Utilidades para formateo de salida en consola
const COLOR = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
const failureDetails = [];

function assert(condition, testName, errorMessage) {
    testsRun++;
    if (condition) {
        testsPassed++;
        console.log(`  ${COLOR.green}✔${COLOR.reset} ${testName}`);
        return true;
    } else {
        testsFailed++;
        const err = `  ${COLOR.red}✘${COLOR.reset} ${testName} ${COLOR.dim}--> ${errorMessage || 'Fallo de aserción'}${COLOR.reset}`;
        console.log(err);
        failureDetails.push({ testName, message: errorMessage || 'Fallo de aserción' });
        return false;
    }
}

function suite(name) {
    console.log(`\n${COLOR.bold}${COLOR.cyan}▶ SUITE: ${name}${COLOR.reset}`);
}

// ============================================================
// SUITE 1: ESTRUCTURA DE ARCHIVOS REQUERIDOS
// ============================================================
suite('1. Existencia e integridad de archivos requeridos');

const requiredFiles = [
    'index.html',
    'inventario.html',
    'pedidos.html',
    'incidencias.html',
    'Login.html',
    'style.css',
    'script.js',
    'incidencias.js',
    'Dockerfile',
    '.dockerignore',
    'terraform.tf',
    '.github/workflows/ci.yml'
];

requiredFiles.forEach(file => {
    const fullPath = path.join(ROOT_DIR, file);
    const exists = fs.existsSync(fullPath);
    let size = 0;
    if (exists) {
        size = fs.statSync(fullPath).size;
    }
    assert(
        exists && size > 0,
        `Archivo presente y no vacío: ${file}`,
        `El archivo ${file} no existe o tiene 0 bytes.`
    );
});

// ============================================================
// SUITE 2: VALIDACIÓN DE SINTAXIS JAVASCRIPT (node --check)
// ============================================================
suite('2. Validación sintáctica de archivos JavaScript (node --check)');

const jsFiles = [
    'script.js',
    'incidencias.js',
    'tests/test.js'
];

jsFiles.forEach(jsRelPath => {
    const fullPath = path.join(ROOT_DIR, jsRelPath);
    let syntaxOk = false;
    let syntaxErr = '';

    try {
        execFileSync(process.execPath, ['--check', fullPath], { stdio: 'pipe' });
        syntaxOk = true;
    } catch (e) {
        syntaxOk = false;
        syntaxErr = e.stderr ? e.stderr.toString() : e.message;
    }

    assert(
        syntaxOk,
        `Sintaxis válida: ${jsRelPath}`,
        `Error de sintaxis en ${jsRelPath}: ${syntaxErr}`
    );
});

// ============================================================
// SUITE 3: VALIDACIÓN DE CONFIGURACIÓN DOCKER
// ============================================================
suite('3. Validación de configuración Dockerfile y .dockerignore');

const dockerfilePath = path.join(ROOT_DIR, 'Dockerfile');
const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');

assert(
    dockerfileContent.includes('FROM nginx'),
    'Dockerfile usa imagen base nginx',
    'Dockerfile no define FROM nginx'
);

assert(
    dockerfileContent.includes('incidencias.js'),
    'Dockerfile copia incidencias.js',
    'Dockerfile no incluye incidencias.js en las instrucciones de copia'
);

assert(
    dockerfileContent.includes('style.css') && dockerfileContent.includes('script.js'),
    'Dockerfile copia activos estáticos (style.css, script.js)',
    'Falta copia de activos estáticos en Dockerfile'
);

assert(
    dockerfileContent.includes('EXPOSE 80'),
    'Dockerfile expone el puerto 80',
    'Dockerfile no expone el puerto 80'
);

const dockerignorePath = path.join(ROOT_DIR, '.dockerignore');
const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf8');

assert(
    dockerignoreContent.includes('.git') && dockerignoreContent.includes('.github'),
    '.dockerignore excluye carpetas de control de versiones (.git, .github)',
    '.dockerignore no excluye .git o .github'
);

assert(
    dockerignoreContent.includes('terraform.tf') && dockerignoreContent.includes('scripts'),
    '.dockerignore excluye archivos de infraestructura y scripts locales',
    '.dockerignore no excluye terraform.tf o scripts/'
);

// ============================================================
// SUITE 4: VALIDACIÓN DE CONTENIDO MÍNIMO EN VISTAS HTML
// ============================================================
suite('4. Contenido mínimo esperado en vistas HTML');

const indexPath = path.join(ROOT_DIR, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

assert(
    indexHtml.includes('NovaTech') && indexHtml.includes('Dashboard'),
    'index.html contiene título y cabecera de Dashboard NovaTech',
    'index.html no contiene marcas de NovaTech o Dashboard'
);

assert(
    indexHtml.includes('incidencias.html'),
    'index.html contiene enlace al módulo de incidencias',
    'index.html no enlaza a incidencias.html'
);

assert(
    indexHtml.includes('script.js') && indexHtml.includes('style.css'),
    'index.html enlaza hojas de estilo y script principal',
    'index.html no referencia script.js o style.css'
);

const incidenciasPath = path.join(ROOT_DIR, 'incidencias.html');
const incidenciasHtml = fs.readFileSync(incidenciasPath, 'utf8');

assert(
    incidenciasHtml.includes('id="caseForm"') || incidenciasHtml.includes('id="caseTitle"'),
    'incidencias.html contiene formulario para registrar casos (caseForm/caseTitle)',
    'incidencias.html carece de formulario de registro de incidentes'
);

assert(
    incidenciasHtml.includes('incidencias.js'),
    'incidencias.html enlaza su script controlador incidencias.js',
    'incidencias.html no incluye etiqueta script para incidencias.js'
);

assert(
    incidenciasHtml.includes('kpiTotal') && incidenciasHtml.includes('caseList'),
    'incidencias.html contiene panel de KPIs y bandeja de seguimiento de casos',
    'incidencias.html carece de elementos clave de seguimiento'
);

// ============================================================
// SUITE 5: REGLAS DE NEGOCIO - MÓDULO PEDIDOS
// ============================================================
suite('5. Reglas de negocio del Portal de Pedidos (script.js)');

const scriptContent = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf8');

// Extraer pedidos y productosIniciales evaluando en entorno sandbox seguro
const dummyElem = { textContent: '', innerHTML: '', value: '', addEventListener: () => {} };
const sandbox = {
    localStorage: { getItem: () => null, setItem: () => null },
    alert: () => {},
    console: { log: () => {}, warn: () => {}, error: () => {} },
    document: {
        addEventListener: () => {},
        getElementById: () => dummyElem,
        querySelectorAll: () => [],
        querySelector: () => dummyElem
    }
};
sandbox.window = sandbox;
vm.createContext(sandbox);

let appData = { pedidos: [], productosIniciales: [] };
try {
    appData = vm.runInContext(
        scriptContent + '\n;({ pedidos: typeof pedidos !== "undefined" ? pedidos : [], productosIniciales: typeof productosIniciales !== "undefined" ? productosIniciales : [] });',
        sandbox
    );
} catch (err) {
    assert(false, 'Carga de datos de script.js en sandbox', `Error al evaluar script.js: ${err.message}`);
}

const pedidos = appData.pedidos;
assert(
    Array.isArray(pedidos) && pedidos.length > 0,
    `Lista de pedidos cargada correctamente (${pedidos.length} registros)`,
    'No se pudieron cargar los pedidos de script.js'
);

// Regla 1: Todos los códigos deben tener el prefijo PED- seguido de dígitos
const todosCodigosValidos = pedidos.every(p => typeof p.codigo === 'string' && /^PED-\d+$/.test(p.codigo));
assert(
    todosCodigosValidos,
    'Todos los pedidos cumplen con formato de código PED-XXX',
    'Existe al menos un pedido cuyo código no sigue el estándar PED-XXX'
);

// Regla 2: Estados válidos
const estadosPermitidos = ['entregado', 'pendiente', 'enviado', 'cancelado'];
const todosEstadosValidos = pedidos.every(p => estadosPermitidos.includes(p.estado));
assert(
    todosEstadosValidos,
    `Todos los pedidos tienen estado válido (${estadosPermitidos.join(', ')})`,
    'Se encontró un pedido con estado inválido'
);

// Regla 3: Precios y cantidades positivos
const preciosYCantidadesPositivos = pedidos.every(p =>
    typeof p.precio === 'number' && p.precio > 0 &&
    typeof p.cantidad === 'number' && p.cantidad > 0
);
assert(
    preciosYCantidadesPositivos,
    'Todos los pedidos tienen precio > 0 y cantidad > 0',
    'Existen pedidos con precios o cantidades menores o iguales a cero'
);

// Regla 4: Integridad de cliente y producto
const camposObligatoriosValidos = pedidos.every(p =>
    typeof p.cliente === 'string' && p.cliente.trim().length > 0 &&
    typeof p.producto === 'string' && p.producto.trim().length > 0
);
assert(
    camposObligatoriosValidos,
    'Todos los pedidos cuentan con cliente y producto no vacíos',
    'Hay pedidos con cliente o producto ausente'
);

// Regla 5: Cálculo coherente de totales si el campo total existe
const totalesCoherentes = pedidos.every(p => {
    if (typeof p.total === 'undefined') return true;
    const esperado = Math.round(p.cantidad * p.precio * 100) / 100;
    const actual = Math.round(p.total * 100) / 100;
    return Math.abs(esperado - actual) < 0.05;
});
assert(
    totalesCoherentes,
    'Los totales de los pedidos coinciden con cantidad * precio',
    'Se detectaron inconsistencias entre total y cantidad * precio'
);

// ============================================================
// SUITE 6: REGLAS DE NEGOCIO - MÓDULO INVENTARIO
// ============================================================
suite('6. Reglas de negocio del Inventario (script.js)');

const productos = appData.productosIniciales;
assert(
    Array.isArray(productos) && productos.length > 0,
    `Catálogo inicial de inventario cargado (${productos.length} productos)`,
    'No se pudieron cargar los productos de script.js'
);

const skusValidos = productos.every(p => typeof p.sku === 'string' && p.sku.trim().length > 2);
assert(
    skusValidos,
    'Todos los productos cuentan con SKU identificador válido',
    'Se detectaron productos sin SKU válido'
);

const stocksNoNegativos = productos.every(p =>
    typeof p.stock === 'number' && p.stock >= 0 &&
    typeof p.stockMinimo === 'number' && p.stockMinimo >= 0
);
assert(
    stocksNoNegativos,
    'Los stocks y stocks mínimos son valores numéricos no negativos',
    'Se detectaron existencias con stock negativo en la configuración base'
);

// ============================================================
// SUITE 7: REGLAS DE NEGOCIO - MÓDULO INCIDENCIAS
// ============================================================
suite('7. Reglas de negocio del Módulo de Incidencias (incidencias.js)');

const incidenciasContent = fs.readFileSync(path.join(ROOT_DIR, 'incidencias.js'), 'utf8');

// Extraer demo de casos
const demoMatch = incidenciasContent.match(/const demo\s*=\s*(\[[\s\S]*?\]);/);
let demoCasos = [];
if (demoMatch) {
    try {
        demoCasos = eval(demoMatch[1]);
    } catch (e) {
        // Fallback: parsing seguro
    }
}

assert(
    Array.isArray(demoCasos) && demoCasos.length >= 3,
    `Casos demo de incidencias cargados (${demoCasos.length} casos)`,
    'No se pudo extraer la lista de casos demo de incidencias.js'
);

const prefijosIncidenciasValidos = demoCasos.every(c =>
    (c.id.startsWith('INC-') && c.type === 'Incidencia') ||
    (c.id.startsWith('SOL-') && c.type === 'Solicitud')
);
assert(
    prefijosIncidenciasValidos,
    'Códigos de caso corresponden al tipo (INC- para Incidencia, SOL- para Solicitud)',
    'Existen casos cuyo prefijo de ID no coincide con su tipo'
);

const estadosIncidenciasValidos = ['Abierto', 'En atención', 'En espera', 'Resuelto'];
const todosEstadosCasosValidos = demoCasos.every(c => estadosIncidenciasValidos.includes(c.status));
assert(
    todosEstadosCasosValidos,
    `Estados de casos dentro del catálogo permitido (${estadosIncidenciasValidos.join(', ')})`,
    'Existen casos con estados no permitidos'
);

const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
const todasPrioridadesValidas = demoCasos.every(c => prioridadesValidas.includes(c.priority));
assert(
    todasPrioridadesValidas,
    `Prioridades de casos válidas (${prioridadesValidas.join(', ')})`,
    'Existen casos con prioridades fuera del catálogo permitido'
);

// ============================================================
// REPORTE FINAL Y CÓDIGO DE RETORNO
// ============================================================
console.log('\n============================================================');
console.log(`${COLOR.bold}REPORTE DE EJECUCIÓN DE PRUEBAS${COLOR.reset}`);
console.log('============================================================');
console.log(`Total pruebas ejecutadas: ${testsRun}`);
console.log(`${COLOR.green}Pruebas aprobadas:        ${testsPassed}${COLOR.reset}`);
console.log(`${testsFailed === 0 ? COLOR.green : COLOR.red}Pruebas fallidas:         ${testsFailed}${COLOR.reset}`);
console.log('============================================================\n');

if (testsFailed > 0) {
    console.error(`${COLOR.bold}${COLOR.red}❌ SE DETECTARON FALLOS EN LA SUITE DE PRUEBAS:${COLOR.reset}`);
    failureDetails.forEach((f, idx) => {
        console.error(`  ${idx + 1}. [${f.testName}]: ${f.message}`);
    });
    console.error(`\n${COLOR.red}Terminando proceso con exit code 1.${COLOR.reset}\n`);
    process.exit(1);
} else {
    console.log(`${COLOR.bold}${COLOR.green}🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE (exit code 0).${COLOR.reset}\n`);
    process.exit(0);
}
