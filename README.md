# 🛒 NovaTech - Portal de Pedidos e Inventario

[![CI/CD Pipeline](https://github.com/Sebahhs10/Novatech-HD/actions/workflows/ci.yml/badge.svg)](https://github.com/Sebahhs10/Novatech-HD/actions/workflows/ci.yml)

Solución DevOps para **Comercial NovaTech S.A.C.** — Aplicación web full-stack (Node.js, Express y MySQL) de portal de pedidos e inventario con flujo GitFlow, gestión ágil en GitHub Projects, pipeline CI/CD automatizado en GitHub Actions y contenedorización con Docker.

---

## 📋 Descripción del Proyecto

Este proyecto fue desarrollado como parte del **Tercer Avance** del curso **Herramientas de Desarrollo Profesional - TIC**. El objetivo es implementar una solución DevOps integral que automatice la validación, empaquetado y entrega de software en un contexto empresarial real.

**Versión Actual:** `v2.1.0`

**NovaTech S.A.C.** es una empresa peruana dedicada a la comercialización de equipos tecnológicos, que enfrentaba procesos manuales propensos a errores y retrasos.

### Problemas identificados
- ⏱️ Despliegues manuales que toman hasta **90 minutos**
- ❌ **20%** de incidentes después de cada despliegue
- 🔧 **45 horas/mes** en tareas repetitivas
- 🌐 Entornos inconsistentes ("en mi máquina funciona")
- 📊 **8-12 errores/mes** de inventario publicados

---

## 🏗️ Arquitectura DevOps

### 1. Seguimiento de Incidentes y Gestión Ágil
- **GitHub Issues & Projects (Kanban):** Todas las tareas técnicas (conexión a MySQL, endpoints REST `POST`/`PUT` y resolución de conflictos) se registran como *Issues* con criterios de aceptación, responsables, etiquetas (`Backend`, `Prioridad`) y seguimiento visual de *To Do* a *Done*.
- **Control de Versiones (GitFlow):** Ramas principales protegidas (`main` y `develop`), desarrollo aislado en ramas `feature/*` e integración controlada mediante *Pull Requests*.

### 2. Pipeline CI/CD (GitHub Actions + Docker)
El archivo `.github/workflows/ci.yml` automatiza el ciclo de integración y entrega en cada `push` o `pull_request` hacia `main` y `develop`:
- **Integración Continua (CI):** Configura el entorno Node.js 18 y ejecuta la suite de pruebas unitarias (`node tests/test.js`) para validar la integridad de pedidos e inventario.
- **Entrega Continua (CD):** Al aprobarse las pruebas, construye la imagen Docker (`novatech-app:latest`), despliega un contenedor de prueba en el puerto `8080`, valida la disponibilidad con un *healthcheck* HTTP `200` y limpia los recursos automáticamente.