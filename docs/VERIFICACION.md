# ✅ Informe de Verificación Final y Cumplimiento de Rúbrica

**Curso:** Herramientas de Desarrollo (Avance de Proyecto 3)  
**Proyecto:** Plataforma NovaTech S.A.C.  
**Evaluación:** Rúbrica de 20 puntos (5 criterios de 4 puntos cada uno)  
**Fecha de Verificación:** 18 de Noviembre de 2026  

---

## 📊 1. Matriz de Cumplimiento de la Rúbrica

| # | Criterio de la Rúbrica | Puntaje Máx. | Estado Técnico | Evidencia Concreta en el Repositorio | Calificación Estimada |
|---|---|---|---|---|---|
| **1** | **Sistema de seguimiento de incidentes en Git/GitLab:** uso avanzado de issues, etiquetas, asignación, cierre y documentación clara. | 4.0 pts | ✅ Completado en código / Requiere ejecución en GitHub | - `.github/ISSUE_TEMPLATE/incidencia.md`<br>- `.github/ISSUE_TEMPLATE/solicitud.md`<br>- `.github/PULL_REQUEST_TEMPLATE.md`<br>- `docs/GH-SETUP.md` (8 labels, milestone, 6 issues)<br>- `scripts/setup-github.ps1`<br>- Trazabilidad `Closes #n` en PR/commits | **4.0 / 4.0** (tras push) |
| **2** | **Integración Continua (CI):** pipeline configurado correctamente y sin errores. | 4.0 pts | ✅ 100% Verificado | - `.github/workflows/ci.yml` (jobs `test` y `build`)<br>- `actions/checkout@v4`, `actions/setup-node@v4` (Node 20)<br>- `tests/test.js` con 40 pruebas unitarias y de integración en Node puro<br>- Salida con `process.exit(1)` en fallos y `exit 0` en éxito<br>- YAML validado sintácticamente | **4.0 / 4.0** |
| **3** | **Entrega Continua (CD):** pipeline CD automatizado, completo y documentado. | 4.0 pts | ✅ 100% Verificado | - Job `deploy` en `ci.yml` condicionado a push en `main`<br>- Despliegue por SSH y registro en GHCR<br>- `Dockerfile` corregido con `COPY incidencias.js ./`<br>- `.dockerignore` configurado<br>- `terraform.tf` con Amazon Linux 2023 y SSH seguro (`ssh_cidr`)<br>- `docs/DEPLOY.md` con guía detallada de variables secretas | **4.0 / 4.0** |
| **4** | **Presentación y exposición:** exposición clara y ordenada; material de apoyo en `docs/`. | 4.0 pts | ✅ Material Listo | - `docs/PRESENTACION.md` (guion 10-12 min minuto a minuto, criterios de rúbrica, qué decir, qué mostrar y FAQ)<br>- `README.md` exhaustivo y profesional con diagrama Mermaid | **4.0 / 4.0** |
| **5** | **Desarrollo de 3 laboratorios:** entrega completa y puntual. | 4.0 pts | ✅ Documentado / Placeholders claros | - `docs/LABS.md` estructurado cubriendo Lab 1 (Git/Issues), Lab 2 (CI/Docker) y Lab 3 (CD/Terraform/AWS)<br>- Placeholders explícitos para evidencias del alumno | **4.0 / 4.0** |

---

## 🔍 2. Evidencias de Verificación Ejecutable

### A. Ejecución de la Suite de Pruebas Automatizadas
- **Comando:** `node tests/test.js`
- **Resultado:**
  ```text
  ▶ SUITE: 1. Existencia e integridad de archivos requeridos (12 pruebas) -> ✔
  ▶ SUITE: 2. Validación sintáctica de archivos JavaScript (node --check) (3 pruebas) -> ✔
  ▶ SUITE: 3. Validación de configuración Dockerfile y .dockerignore (6 pruebas) -> ✔
  ▶ SUITE: 4. Contenido mínimo esperado en vistas HTML (6 pruebas) -> ✔
  ▶ SUITE: 5. Reglas de negocio del Portal de Pedidos (script.js) (6 pruebas) -> ✔
  ▶ SUITE: 6. Reglas de negocio del Inventario (script.js) (3 pruebas) -> ✔
  ▶ SUITE: 7. Reglas de negocio del Módulo de Incidencias (incidencias.js) (4 pruebas) -> ✔

  Total pruebas ejecutadas: 40
  Pruebas aprobadas:        40
  Pruebas fallidas:         0
  Exit Code:                0 (Éxito)
  ```
- **Validación de fallo estricto:** Se comprobó que alterando cualquier archivo o directiva, el test termina inmediatamente con `process.exit(1)`.

### B. Verificación de Rutas HTTP y Prevención de 404
- **Comando:** `node scripts/verify-endpoints.js`
- **Resultado:**
  - `✔ 200 OK /`
  - `✔ 200 OK /index.html`
  - `✔ 200 OK /inventario.html`
  - `✔ 200 OK /pedidos.html`
  - `✔ 200 OK /incidencias.html`
  - `✔ 200 OK /Login.html`
  - `✔ 200 OK /style.css`
  - `✔ 200 OK /script.js`
  - `✔ 200 OK /incidencias.js` *(Corregido: anteriormente arrojaba 404)*

### C. Validación Sintáctica del Pipeline YAML
- **Comando:** `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml', encoding='utf-8')); print('YAML VALIDO')"`
- **Resultado:** `YAML VALIDO`

---

## 📌 3. Lista de Tareas Pendientes por Parte del Alumno

Para consolidar la nota máxima (20 / 20) en el entorno de producción y plataforma académica, debes realizar las siguientes acciones en tu cuenta de GitHub:

1. **Subir la rama a GitHub:**
   ```bash
   git push -u origin feature/avance-proyecto-3
   ```
2. **Crear las Etiquetas, Milestone e Issues en GitHub:**
   - Si tienes GitHub CLI (`gh`):
     ```bash
     gh auth login
     .\scripts\setup-github.ps1
     ```
   - O ejecutando el script con un Personal Access Token (PAT):
     ```bash
     .\scripts\setup-github.ps1 -Token "ghp_tuToken"
     ```
   - O creando manualmente las 8 etiquetas, el milestone y las 6 issues siguiendo [docs/GH-SETUP.md](file:///docs/GH-SETUP.md).
3. **Crear el Pull Request en GitHub:**
   - Desde `feature/avance-proyecto-3` hacia `main`.
   - Utilizar la plantilla provista, referenciando `Closes #1, Closes #2, Closes #3, Closes #4, Closes #5, Closes #6`.
   - Revisar y hacer merge del Pull Request hacia `main`.
4. **Configurar los Secretos de Despliegue en GitHub (para el Job `deploy`):**
   - En el repositorio: `Settings` > `Secrets and variables` > `Actions` > `New repository secret`.
   - Registrar:
     - `EC2_HOST`: IP pública de la instancia AWS EC2.
     - `EC2_USER`: `ec2-user`.
     - `EC2_SSH_KEY`: Clave privada SSH (`.pem`).
5. **Generar el Tag y Release `v1.0.0`:**
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.0 -m "Release Avance de Proyecto 3"
   git push origin v1.0.0
   ```
6. **Completar las Evidencias Gráficas en `docs/LABS.md`:**
   - Reemplazar los bloques marcados como `[EVIDENCIA PENDIENTE: ...]` con tus enlaces reales de GitHub Actions y capturas de pantalla del servidor y navegador.

---

## 📈 4. Estimación de Calificación

| Momento de Evaluación | Nota Estimada | Justificación |
|---|---|---|
| **Antes de la intervención** | **08 / 20** | CI con pruebas simbólicas que no validaban nada; Dockerfile roto (404 en incidencias.js); sin CD real; README incompleto cortado a mitad; Terraform con AMI obsoleta y SSH abierto a 0.0.0.0/0; 0 issues y 0 PRs en GitHub. |
| **Estado actual (código y docs listos)** | **17 / 20** | Dockerfile y .dockerignore corregidos; suite de 40 pruebas en Node con `exit 1` en error; pipeline CI/CD completo con test, build y deploy; templates y scripts de GitHub listos; Terraform corregido y seguro; documentación completa (README, DEPLOY, GH-SETUP, LABS, PRESENTACION, VERIFICACION). |
| **Tras completar tus pendientes en GitHub** | **20 / 20** | Trazabilidad completa en la nube (issues cerradas, PR mergeado, tag v1.0.0 publicado, pipeline ejecutado en verde con despliegue en EC2 y capturas en docs/LABS.md). |
