const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        console.log('✅ Conexión exitosa a la base de datos novatech_db');
    }
});

app.get('/', (req, res) => {
    res.send('API de NovaTech funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

// --- RUTAS DE LA API ---

// Obtener todos los productos (Inventario)
app.get('/api/productos', (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json(results);
        }
    });
});

// Obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
    const query = 'SELECT * FROM pedidos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener pedidos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json(results);
        }
    });
});

// Agregar un nuevo producto (POST)
app.post('/api/productos', (req, res) => {
    const { sku, nombre, categoria, stock, stockMinimo } = req.body;
    const query = 'INSERT INTO productos (sku, nombre, categoria, stock, stock_minimo) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [sku, nombre, categoria, stock, stockMinimo], (err, results) => {
        if (err) {
            console.error('Error al insertar producto:', err);
            res.status(500).json({ error: 'Error guardando en la base de datos' });
        } else {
            res.status(201).json({ message: 'Producto registrado exitosamente', id: results.insertId });
        }
    });
});

// Actualizar un producto (PUT)
app.put('/api/productos/:sku', (req, res) => {
    const { sku, nombre, categoria, stock, stockMinimo } = req.body;
    const query = 'UPDATE productos SET sku = ?, nombre = ?, categoria = ?, stock = ?, stock_minimo = ? WHERE sku = ?';
    
    db.query(query, [sku, nombre, categoria, stock, stockMinimo, req.params.sku], (err) => {
        if (err) {
            console.error('Error al actualizar:', err);
            return res.status(500).json({ error: 'Error actualizando en la base de datos' });
        }
        res.json({ message: 'Producto actualizado exitosamente' });
    });
});

// Eliminar un producto (DELETE)
app.delete('/api/productos/:sku', (req, res) => {
    const query = 'DELETE FROM productos WHERE sku = ?';
    
    db.query(query, [req.params.sku], (err) => {
        if (err) {
            console.error('Error al eliminar:', err);
            return res.status(500).json({ error: 'Error eliminando de la base de datos' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    });
});