/**
 * scripts/verify-endpoints.js
 * Servidor estático HTTP de verificación para validar que todas las rutas y assets
 * sirvan HTTP 200 sin errores 404.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8088;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`404 Not Found: ${reqPath}`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, async () => {
    console.log(`\n🔍 Iniciando verificación de endpoints en http://localhost:${PORT}...`);

    const endpoints = [
        '/',
        '/index.html',
        '/inventario.html',
        '/pedidos.html',
        '/incidencias.html',
        '/Login.html',
        '/style.css',
        '/script.js',
        '/incidencias.js'
    ];

    let allOk = true;

    for (const ep of endpoints) {
        try {
            const status = await checkUrl(`http://localhost:${PORT}${ep}`);
            if (status === 200) {
                console.log(`  \x1b[32m✔ 200 OK\x1b[0m ${ep}`);
            } else {
                console.log(`  \x1b[31m✘ ${status} ERROR\x1b[0m ${ep}`);
                allOk = false;
            }
        } catch (err) {
            console.log(`  \x1b[31m✘ FAIL\x1b[0m ${ep}: ${err.message}`);
            allOk = false;
        }
    }

    server.close(() => {
        if (allOk) {
            console.log('\n\x1b[32m✅ Todos los endpoints y archivos estáticos responden 200 OK sin 404.\x1b[0m\n');
            process.exit(0);
        } else {
            console.error('\n\x1b[31m❌ Hubo endpoints que no respondieron 200 OK.\x1b[0m\n');
            process.exit(1);
        }
    });
});

function checkUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.resume();
            resolve(res.statusCode);
        }).on('error', reject);
    });
}
