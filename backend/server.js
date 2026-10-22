const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '../public')));

// Estado de conexión a base de datos
let isDbConnected = false;

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    database: process.env.DB_NAME || 'novatech_db',
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.log('⚠️ MySQL no disponible en local. Activando modo híbrido con datos en memoria.');
        isDbConnected = false;
    } else {
        console.log('✅ Conexión exitosa a la base de datos novatech_db');
        isDbConnected = true;
    }
});

// Prevenir caídas no controladas si falla la conexión a MySQL
db.on('error', (err) => {
    console.error('⚠️ [MySQL Warning/Error]:', err.message);
    isDbConnected = false;
});

// Base de datos en memoria para funcionamiento sin caídas
let productosMemoria = [
    { id: 1, sku: 'LAP-001', nombre: 'Laptop HP 15-dy2061la Intel Core i5', categoria: 'Laptops', stock: 15, stock_minimo: 5, precio: 2450.00 },
    { id: 2, sku: 'MOU-002', nombre: 'Mouse Inalámbrico Logitech MX Master 3', categoria: 'Periféricos', stock: 42, stock_minimo: 10, precio: 89.90 },
    { id: 3, sku: 'MON-003', nombre: 'Monitor Curvo Samsung 24" Full HD', categoria: 'Monitores', stock: 8, stock_minimo: 3, precio: 1299.00 },
    { id: 4, sku: 'TEC-004', nombre: 'Teclado Mecánico Redragon Kumara RGB', categoria: 'Periféricos', stock: 25, stock_minimo: 8, precio: 169.50 },
    { id: 5, sku: 'SSD-005', nombre: 'Disco Sólido Kingston NV2 1TB NVMe M.2', categoria: 'Almacenamiento', stock: 32, stock_minimo: 8, precio: 289.00 },
    { id: 6, sku: 'IMP-006', nombre: 'Impresora Multifuncional Epson EcoTank L3250', categoria: 'Periféricos', stock: 4, stock_minimo: 5, precio: 849.00 },
    { id: 7, sku: 'RAM-007', nombre: 'Memoria RAM Corsair Vengeance LPX 16GB DDR4', categoria: 'Componentes', stock: 0, stock_minimo: 6, precio: 195.00 },
    { id: 8, sku: 'AUR-008', nombre: 'Auriculares HyperX Cloud Flight Wireless', categoria: 'Periféricos', stock: 18, stock_minimo: 5, precio: 459.00 }
];

let pedidosMemoria = [
    { id: 1, codigo: 'PED-001', cliente: 'María González', producto: 'Laptop HP 15-dy2061la Intel Core i5', cantidad: 2, precio: 2450.00, total: 4900.00, estado: 'entregado', fecha: '2026-10-20' },
    { id: 2, codigo: 'PED-002', cliente: 'Carlos Ruiz', producto: 'Mouse Inalámbrico Logitech MX Master 3', cantidad: 5, precio: 89.90, total: 449.50, estado: 'pendiente', fecha: '2026-10-21' },
    { id: 3, codigo: 'PED-003', cliente: 'Ana Torres', producto: 'Monitor Curvo Samsung 24" Full HD', cantidad: 1, precio: 1299.00, total: 1299.00, estado: 'enviado', fecha: '2026-10-22' },
    { id: 4, codigo: 'PED-004', cliente: 'Jorge Mendoza', producto: 'Teclado Mecánico Redragon Kumara RGB', cantidad: 3, precio: 169.50, total: 508.50, estado: 'entregado', fecha: '2026-10-22' },
    { id: 5, codigo: 'PED-005', cliente: 'Lucía Paredes', producto: 'Disco Sólido Kingston NV2 1TB NVMe M.2', cantidad: 2, precio: 289.00, total: 578.00, estado: 'pendiente', fecha: '2026-10-23' },
    { id: 6, codigo: 'PED-006', cliente: 'Roberto Sánchez', producto: 'Impresora Multifuncional Epson EcoTank L3250', cantidad: 1, precio: 849.00, total: 849.00, estado: 'enviado', fecha: '2026-10-23' }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api/health', (req, res) => {
    res.send('API de NovaTech funcionando correctamente');
});

// --- RUTAS DE PRODUCTOS (INVENTARIO) ---

app.get('/api/productos', (req, res) => {
    if (isDbConnected) {
        db.query('SELECT * FROM productos', (err, results) => {
            if (err || !results || results.length === 0) {
                return res.json(productosMemoria);
            }
            res.json(results);
        });
    } else {
        res.json(productosMemoria);
    }
});

app.post('/api/productos', (req, res) => {
    const { sku, nombre, categoria, stock, stockMinimo, precio } = req.body;
    const nuevo = {
        id: productosMemoria.length + 1,
        sku: (sku || `PROD-${Date.now()}`).toUpperCase(),
        nombre: nombre || 'Producto sin nombre',
        categoria: categoria || 'Periféricos',
        stock: Number(stock) || 0,
        stock_minimo: Number(stockMinimo) || 5,
        precio: Number(precio) || 0.00
    };
    
    // Evitar SKU duplicado en memoria
    const indexExistente = productosMemoria.findIndex(p => p.sku === nuevo.sku);
    if (indexExistente >= 0) {
        productosMemoria[indexExistente] = { ...productosMemoria[indexExistente], ...nuevo };
    } else {
        productosMemoria.unshift(nuevo);
    }

    if (isDbConnected) {
        const query = 'INSERT INTO productos (sku, nombre, categoria, stock, stock_minimo, precio) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre=?, categoria=?, stock=?, stock_minimo=?, precio=?';
        db.query(query, [nuevo.sku, nuevo.nombre, nuevo.categoria, nuevo.stock, nuevo.stock_minimo, nuevo.precio, nuevo.nombre, nuevo.categoria, nuevo.stock, nuevo.stock_minimo, nuevo.precio], () => {});
    }

    res.status(201).json({ message: 'Producto registrado exitosamente', producto: nuevo });
});

app.put('/api/productos/:sku', (req, res) => {
    const skuBuscado = req.params.sku.toUpperCase();
    const { nombre, categoria, stock, stockMinimo, precio } = req.body;
    
    const index = productosMemoria.findIndex(p => p.sku === skuBuscado);
    if (index >= 0) {
        productosMemoria[index] = {
            ...productosMemoria[index],
            nombre: nombre !== undefined ? nombre : productosMemoria[index].nombre,
            categoria: categoria !== undefined ? categoria : productosMemoria[index].categoria,
            stock: stock !== undefined ? Number(stock) : productosMemoria[index].stock,
            stock_minimo: stockMinimo !== undefined ? Number(stockMinimo) : productosMemoria[index].stock_minimo,
            precio: precio !== undefined ? Number(precio) : productosMemoria[index].precio
        };
    }

    if (isDbConnected) {
        const query = 'UPDATE productos SET nombre = ?, categoria = ?, stock = ?, stock_minimo = ? WHERE sku = ?';
        db.query(query, [nombre, categoria, stock, stockMinimo, skuBuscado], () => {});
    }

    res.json({ message: 'Producto actualizado exitosamente' });
});

app.delete('/api/productos/:sku', (req, res) => {
    const skuBuscado = req.params.sku.toUpperCase();
    productosMemoria = productosMemoria.filter(p => p.sku !== skuBuscado);

    if (isDbConnected) {
        db.query('DELETE FROM productos WHERE sku = ?', [skuBuscado], () => {});
    }

    res.json({ message: 'Producto eliminado exitosamente' });
});

// --- RUTAS DE PEDIDOS ---

app.get('/api/pedidos', (req, res) => {
    if (isDbConnected) {
        db.query('SELECT * FROM pedidos', (err, results) => {
            if (err || !results || results.length === 0) {
                return res.json(pedidosMemoria);
            }
            res.json(results);
        });
    } else {
        res.json(pedidosMemoria);
    }
});

app.post('/api/pedidos', (req, res) => {
    const { codigo, cliente, producto, cantidad, precio, estado } = req.body;
    const cant = Number(cantidad) || 1;
    const prec = Number(precio) || 0;
    const nuevoPedido = {
        id: pedidosMemoria.length + 1,
        codigo: codigo || `PED-00${pedidosMemoria.length + 1}`,
        cliente: cliente || 'Cliente General',
        producto: producto || 'Producto Varios',
        cantidad: cant,
        precio: prec,
        total: cant * prec,
        estado: estado || 'pendiente',
        fecha: new Date().toISOString().split('T')[0]
    };

    pedidosMemoria.unshift(nuevoPedido);

    if (isDbConnected) {
        const query = 'INSERT INTO pedidos (codigo, cliente, producto, cantidad, precio, estado) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [nuevoPedido.codigo, nuevoPedido.cliente, nuevoPedido.producto, nuevoPedido.cantidad, nuevoPedido.precio, nuevoPedido.estado], () => {});
    }

    res.status(201).json({ message: 'Pedido registrado exitosamente', pedido: nuevoPedido });
});

app.put('/api/pedidos/:codigo', (req, res) => {
    const cod = req.params.codigo;
    const { estado } = req.body;

    const index = pedidosMemoria.findIndex(p => p.codigo === cod);
    if (index >= 0) {
        pedidosMemoria[index].estado = estado;
    }

    if (isDbConnected) {
        db.query('UPDATE pedidos SET estado = ? WHERE codigo = ?', [estado, cod], () => {});
    }

    res.json({ message: 'Estado del pedido actualizado exitosamente' });
});

app.delete('/api/pedidos/:codigo', (req, res) => {
    const cod = req.params.codigo;
    pedidosMemoria = pedidosMemoria.filter(p => p.codigo !== cod);

    if (isDbConnected) {
        db.query('DELETE FROM pedidos WHERE codigo = ?', [cod], () => {});
    }

    res.json({ message: 'Pedido eliminado exitosamente' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
