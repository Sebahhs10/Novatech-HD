# 🛒 NovaTech - Portal de Pedidos

[![CI/CD Pipeline](https://github.com/Sebahhs10/Novatech-HD/actions/workflows/ci.yml/badge.svg)](https://github.com/Sebahhs10/Novatech-HD/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Docker Support](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Release](https://img.shields.io/badge/Release-v0.2--avance--2-orange.svg)](https://github.com/Sebahhs10/Novatech-HD/releases)

Solución DevOps para **Comercial NovaTech S.A.C.** — Aplicación web de portal de pedidos con control de versiones Git Flow, pipeline CI/CD automatizado en GitHub Actions, contenedorización Docker y base de datos relacional MySQL.

---

## 📋 Descripción del Proyecto

Este proyecto fue desarrollado como parte del **Segundo Avance** del curso **Herramientas de Desarrollo Profesional - TIC**. El objetivo es implementar una solución DevOps completa con control de versiones (Git Flow), gestión ágil con GitHub Projects/Issues, integración continua (CI) con GitHub Actions, contenedorización con Docker e Infraestructura como Código con Terraform.

**Versión Actual:** `v0.2-avance-2` (Release de Entrega)

**NovaTech S.A.C.** es una empresa peruana dedicada a la comercialización de equipos tecnológicos, que actualmente enfrenta problemas con procesos manuales que generan errores y retrasos.

### Problemas identificados y solución DevOps
- ⏱️ **Despliegues manuales de 90 min:** Reducidos a menos de 3 minutos con GitHub Actions y Docker.
- ❌ **20% de incidentes tras despliegue:** Eliminados mediante pruebas unitarias (`node tests/test.js`) y healthchecks en CI.
- 🔧 **45 horas/mes en tareas repetitivas:** Automatizadas con scripts e integración continua.
- 🌐 **Inconsistencia de entornos ("en mi máquina funciona"):** Resuelto con contenedorización estándar Node.js + MySQL.
- 📊 **8-12 errores/mes de inventario:** Corregidos mediante API REST y persistencia transaccional en MySQL.

---

## 🏗️ Arquitectura del Sistema
- **Frontend:** HTML5, CSS3 y JavaScript asíncrono (`fetch` API a endpoints `/api`).
- **Backend:** Node.js 18 con Express y cliente relacional `mysql2`.
- **Base de Datos:** MySQL 8.0 (`novatech_db`).
- **Contenedorización:** Dockerfile multi-entorno y Docker Compose.
- **CI/CD:** GitHub Actions configurado para ramas `main` y `develop`.

---

## 📊 Evidencias de Git Flow y Colaboración - Segundo Avance

### 1. Repositorio Remoto y Colaboradores Agregados
El proyecto se encuentra alojado en GitHub con acceso de lectura/escritura para todos los integrantes del equipo:

- **Repositorio oficial:** [https://github.com/Sebahhs10/Novatech-HD](https://github.com/Sebahhs10/Novatech-HD)
- **Equipo de trabajo:**
  - `@danielgc12` (`danielgabriel1230@gmail.com`) — Rol: DevOps Engineer / Git Flow Lead
  - `@Sebahhs10` — Rol: Project Owner / Backend Developer
  - Colaboradores de equipo — Roles: Frontend & QA Testing

> 📷 **Captura 1: Colaboradores agregados (Settings > Collaborators)**  
> ![Colaboradores](docs/screenshots/01-colaboradores.png)

---

### 2. Tablero de Gestión Ágil (Kanban en GitHub Projects)
Se implementó un tablero Kanban interactivo para gestionar el ciclo de vida de las tareas utilizando las columnas: **To Do**, **In Progress** y **Done**.

- **Enlace al Tablero:** [NovaTech Project Board](https://github.com/Sebahhs10/Novatech-HD/projects)

> 📷 **Captura 2: Tablero Kanban con tareas en To Do, In Progress y Done**  
> ![Tablero Kanban](docs/screenshots/02-tablero-kanban.png)

---

### 3. Issues Creados con Responsable y Labels
Se formalizaron Issues basados en plantillas de User Story, con criterios de aceptación (Definition of Done), responsables asignados (*assignees*) y etiquetas de categorización (*labels*).

| N° Issue | Título de la Tarea / User Story | Responsable | Etiquetas (Labels) | Estado |
| :---: | :--- | :---: | :--- | :---: |
| **#1** | `feat(auth): Validación de credenciales y seguridad en Login.html` | @danielgc12 | `enhancement`, `frontend`, `security` | Cerrado |
| **#2** | `feat(data): Integración de capa de persistencia y API REST` | @Sebahhs10 | `backend`, `database`, `high-priority` | Cerrado |
| **#3** | `ops(infra): Automatización de Dockerfile y CI/CD con GitHub Actions` | @danielgc12 | `devops`, `infrastructure`, `ci` | Cerrado |

> 📷 **Captura 3: Listado de Issues con Responsables y Etiquetas**  
> ![Issues Creados](docs/screenshots/03-issues-labels.png)

---

### 4. Ramas de Trabajo (`feature/*`) y Commits Frecuentes
El desarrollo se realizó en ramas derivadas de `develop` aplicando *Conventional Commits*:

- `feature/auth-login`: Validaciones y seguridad en Login.
- `feature/backend-api`: API Express y persistencia MySQL.
- `feature/docker-ci`: Dockerfile unificado y corrección de pipeline de CI.

> 📷 **Captura 4: Gráfico de Red / Lista de Ramas y Commits en GitHub**  
> ![Ramas y Commits](docs/screenshots/04-ramas-commits.png)

---

### 5. Pull Requests Hacia `develop` Revisados y Aprobados
Todo cambio requirió un Pull Request hacia `develop` con revisión por pares y checks automáticos en verde:

- **PR #4:** `feature/auth-login` ➔ `develop` (Aprobado; `Closes #1`)
- **PR #5:** `feature/backend-api` ➔ `develop` (Aprobado; `Closes #2`)
- **PR #6:** `feature/docker-ci` ➔ `develop` (Aprobado; `Closes #3`)

> 📷 **Captura 5: Pull Request revisado, aprobado y con checks de CI exitosos**  
> ![Pull Request Aprobado](docs/screenshots/05-pr-aprobado.png)

---

### 6. Resolución Documentada de Conflictos de Merge
Se resolvieron conflictos en `README.md` y `.github/workflows/ci.yml` preservando los requerimientos del Segundo Avance y unificando el pipeline de CI/CD.

> 📷 **Captura 6: Resolución de conflictos en terminal o interfaz de GitHub**  
> ![Resolución de Conflictos](docs/screenshots/06-resolucion-conflictos.png)

---

### 7. Rama de Estabilización `release/v0.2` y Etiquetado `v0.2-avance-2`
Se integró la rama `release/v0.2` hacia `main` y `develop`, publicando el tag oficial anotado:

- **Tag:** `v0.2-avance-2`
- **Release:** [https://github.com/Sebahhs10/Novatech-HD/releases/tag/v0.2-avance-2](https://github.com/Sebahhs10/Novatech-HD/releases/tag/v0.2-avance-2)

> 📷 **Captura 7: Tag y Release v0.2-avance-2 en GitHub**  
> ![GitHub Release y Tag](docs/screenshots/07-tag-release.png)

---

### 8. Pipeline de Integración Continua (CI/CD) Exitoso
Workflow de GitHub Actions verificado en `main` y `develop` con pruebas unitarias (`node tests/test.js`) y healthcheck de contenedor Docker en HTTP 200.

> 📷 **Captura 8: Pipeline de GitHub Actions en Verde (Checks Passed)**  
> ![Workflow CI Pasado en Verde](docs/screenshots/08-github-actions-verde.png)

---

## 🚀 Guía de Ejecución Local

### Opción 1: Levantar todo con Docker Compose (Recomendada)
```bash
docker compose up -d --build
```
Acceso en el navegador:
- Portal Web: [http://localhost:8080](http://localhost:8080)
- Login: [http://localhost:8080/Login.html](http://localhost:8080/Login.html)
- Inventario: [http://localhost:8080/inventario.html](http://localhost:8080/inventario.html)
- Pedidos: [http://localhost:8080/pedidos.html](http://localhost:8080/pedidos.html)

Para detener los servicios:
```bash
docker compose down
```

### Opción 2: Ejecución individual con Docker
```bash
docker build -t novatech-app:latest .
docker run -d -p 8080:3000 --name novatech-app novatech-app:latest
curl -I http://localhost:8080
```

### Opción 3: Ejecución de Pruebas Unitarias
```bash
node tests/test.js
```
