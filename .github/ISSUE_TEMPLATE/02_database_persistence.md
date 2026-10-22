---
name: "feat(data): Integración de capa de persistencia y API REST para pedidos e inventario"
about: Tarea para migrar datos estáticos a endpoints REST y base de datos relacional
title: "feat(data): Integración de capa de persistencia y API REST para pedidos e inventario"
labels: "backend, database, high-priority"
assignees: ""
---

### 📋 Descripción / User Story
**Como** administrador de almacén de Novatech-HD,  
**Quiero** que los datos mostrados en `inventario.html` y `pedidos.html` persistan en una base de datos relacional y no dependan de arrays estáticos en memoria,  
**Para** asegurar la integridad del stock y sincronización en tiempo real de los pedidos.

---

### 🎯 Criterios de Aceptación (Definition of Done)
- [ ] El catálogo de productos y estados de pedidos se consultan mediante endpoints REST (`/api/pedidos`, `/api/inventario`).
- [ ] Los objetos de datos mantienen compatibilidad con las pruebas unitarias existentes en `tests/test.js`.
- [ ] Se implementa manejo de errores HTTP (códigos 400, 404, 500) con respuestas JSON estandarizadas.
- [ ] Se documentan las variables de entorno necesarias para la conexión a la base de datos en un archivo `.env.example`.

---

### 🛠️ Tareas Técnicas
1. Diseñar el esquema de base de datos relacional (tablas `pedidos`, `productos`, `categorias`).
2. Reemplazar la data estática (`const pedidos`, `const productos`) en `script.js` por peticiones asíncronas con `fetch`.
3. Actualizar `tests/test.js` para validar la estructura del payload devuelto.
