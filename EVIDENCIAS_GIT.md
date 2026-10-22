# 📊 Evidencias de Git Flow - Segundo Avance
**Proyecto:** NovaTech (Portal de Pedidos Comercial)  
**Curso:** Herramientas de Desarrollo Profesional - TIC  
**Entrega:** Segundo Avance  
**Versión de Release:** `v0.2-avance-2`  
**Repositorio Oficial:** [https://github.com/Sebahhs10/Novatech-HD](https://github.com/Sebahhs10/Novatech-HD)  

---

### a) Paso 1: Repositorio Remoto con Colaboradores Agregados
Se configuró el repositorio remoto en GitHub otorgando permisos de colaboración y administración a los integrantes del equipo para simular un entorno corporativo de trabajo colaborativo.

- **URL del Repositorio:** `https://github.com/Sebahhs10/Novatech-HD`
- **Equipo de Desarrollo:**
  - `@danielgc12` (`danielgabriel1230@gmail.com`) — Rol: DevOps Engineer / Git Flow Lead
  - `@Sebahhs10` — Rol: Project Owner / Backend Developer
  - Colaboradores de equipo — Roles: Frontend & QA Testing

> 📷 **Captura de Colaboradores (GitHub > Settings > Collaborators):**  
> ![Colaboradores Agregados](docs/screenshots/01-colaboradores.png)

---

### b) Paso 2: Issues Creados con Responsable y Labels
Se formalizaron tareas y requerimientos mediante GitHub Issues, utilizando etiquetas semánticas (*labels*) y asignación directa de miembros del equipo (*assignees*).

| N° Issue | Título de la Tarea / User Story | Responsable | Labels | Estado |
| :---: | :--- | :---: | :--- | :---: |
| **#1** | `feat(auth): Validación de credenciales y seguridad en Login.html` | @danielgc12 | `enhancement`, `frontend`, `security` | Cerrado |
| **#2** | `feat(data): Integración de capa de persistencia y API REST` | @Sebahhs10 | `backend`, `database`, `high-priority` | Cerrado |
| **#3** | `ops(infra): Automatización de Dockerfile y CI/CD con GitHub Actions` | @danielgc12 | `devops`, `infrastructure`, `ci` | Cerrado |

> 📷 **Captura de Issues con Responsables y Etiquetas (GitHub > Issues):**  
> ![Issues Creados](docs/screenshots/02-issues-labels.png)

---

### c) Paso 3: Ramas `feature/nombre-tarea` y Commits Frecuentes
Se aplicó la regla fundamental de Git Flow: **no commitear directamente sobre `main` ni `develop`**. Cada funcionalidad se trabajó en ramas independientes derivadas de `develop` con commits pequeños, claros y con formato *Conventional Commits*:

- `feature/auth-login`: Formularios de autenticación y validación de usuarios (a cargo de @danielgc12).
- `feature/backend-api`: Conexión de endpoints y lógica transaccional en MySQL (a cargo de @Sebahhs10).
- `feature/docker-ci`: Dockerfile unificado y workflow de integración continua (a cargo de @danielgc12).

> 📷 **Captura de Historial de Commits y Árbol de Ramas (GitHub > Network Graph o git log):**  
> ![Ramas y Commits Frecuentes](docs/screenshots/03-ramas-commits.png)

---

### d) Paso 4: Pull Requests Abiertos, Revisados y Aprobados hacia `develop` o `main`
Para integrar el código a las ramas principales se crearon Pull Requests formales. Cada PR fue sometido a revisión de código (*Code Review*), comprobación de pipeline de pruebas y aprobación por un par antes de su fusión.

- **PR #4:** `feature/auth-login` ➔ `develop` (Revisado y aprobado por @Sebahhs10; vinculó `Closes #1`).
- **PR #5:** `feature/backend-api` ➔ `develop` (Revisado y aprobado por @danielgc12; vinculó `Closes #2`).
- **PR #6:** `feature/docker-ci` ➔ `develop` (Revisado y aprobado por @Sebahhs10; vinculó `Closes #3`).

> 📷 **Captura de Pull Request Revisado y Aprobado con Checks en Verde:**  
> ![Pull Request Aprobado](docs/screenshots/04-pr-aprobado.png)

---

### e) Paso 7: Tablero Kanban (GitHub Projects)
Se utilizó un tablero Kanban interactivo para el seguimiento del flujo de trabajo, controlando los estados de desarrollo en tres columnas principales: **To Do**, **In Progress** y **Done**.

- **Enlace al Tablero:** [NovaTech Project Board](https://github.com/Sebahhs10/Novatech-HD/projects)
- Todas las historias de usuario concluyeron satisfactoriamente en la columna **Done**.

> 📷 **Captura del Tablero Kanban con Tareas Finalizadas (GitHub Projects):**  
> ![Tablero Kanban](docs/screenshots/05-tablero-kanban.png)

---

### f) Paso 6: Rama `release/v0.2` y Tag de Versión `v0.2-avance-2`
Para finalizar el ciclo de desarrollo del Segundo Avance:
1. Se abrió la rama de estabilización `release/v0.2` desde `develop`.
2. Se realizaron ajustes finales en documentación y metadatos.
3. Se fusionó hacia `main` (despliegue productivo).
4. Se generó el tag anotado formal `v0.2-avance-2` y su correspondiente Release en GitHub.
5. Se sincronizó de vuelta la rama `develop`.

> 📷 **Captura de Release y Tag Oficial v0.2-avance-2 (GitHub > Releases):**  
> ![Tag de Versión v0.2-avance-2](docs/screenshots/06-tag-release.png)

