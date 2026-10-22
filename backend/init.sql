-- Inicialización de Base de Datos para NovaTech S.A.C.
CREATE DATABASE IF NOT EXISTS novatech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novatech_db;

-- Tabla de Productos / Inventario
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    cliente VARCHAR(150) NOT NULL,
    producto VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado ENUM('pendiente', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos Iniciales de Prueba (Semilla)
INSERT IGNORE INTO productos (sku, nombre, categoria, stock, stock_minimo, precio) VALUES
('LAP-001', 'Laptop HP 15-dy2061la Intel Core i5', 'Laptops', 15, 5, 2450.00),
('MOU-002', 'Mouse Inalámbrico Logitech MX Master 3', 'Accesorios', 42, 10, 89.90),
('MON-003', 'Monitor Curvo Samsung 24" Full HD', 'Monitores', 8, 3, 1299.00),
('TEC-004', 'Teclado Mecánico Redragon Kumara RGB', 'Periféricos', 25, 8, 169.50);

INSERT IGNORE INTO pedidos (codigo, cliente, producto, cantidad, precio, estado) VALUES
('PED-001', 'María González', 'Laptop HP 15', 2, 2450.00, 'entregado'),
('PED-002', 'Carlos Ruiz', 'Mouse Logitech MX', 5, 89.90, 'pendiente'),
('PED-003', 'Ana Torres', 'Monitor Samsung 24"', 1, 1299.00, 'enviado');

