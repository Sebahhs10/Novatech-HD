# ✅ Informe de Verificación y Estado Real de Cumplimiento (Rúbrica)

**Curso:** Herramientas de Desarrollo (Avance de Proyecto 3)  
**Proyecto:** Plataforma NovaTech S.A.C.  
**Repositorio Oficial:** [https://github.com/Sebahhs10/Novatech-HD](https://github.com/Sebahhs10/Novatech-HD)  
**Evaluación:** Rúbrica de 20 puntos (5 criterios de 4 puntos cada uno)  
**Fecha de Verificación:** 18 de Noviembre de 2026  

---

## 📊 1. Matriz de Cumplimiento de la Rúbrica y Evidencias Reales

| # | Criterio de la Rúbrica | Puntaje Máx. | Estado Real Actual | Evidencia Real Verificada | Evidencia PENDIENTE en GitHub | Nota Estimada Hoy |
|---|---|---|---|---|---|---|
| **1** | **Seguimiento de Incidentes:** issues, etiquetas, asignación, cierre y documentación. | 4.0 pts | 🟡 Parcial (Código listo / Remoto pendiente) | - Plantillas creadas: [incidencia.md](file:///.github/ISSUE_TEMPLATE/incidencia.md), [solicitud.md](file:///.github/ISSUE_TEMPLATE/solicitud.md), [PULL_REQUEST_TEMPLATE.md](file:///.github/PULL_REQUEST_TEMPLATE.md).<br>- Script de aprovisionamiento: [scripts/setup-github.ps1](file:///scripts/setup-github.ps1).<br>- Guía paso a paso: [docs/GH-SETUP.md](file:///docs/GH-SETUP.md). | **PENDIENTE:** Ejecutar script o crear en GitHub las 8 etiquetas, el Milestone "Avance de Proyecto 3" y las 6 issues reales (IDs previstos >= #8). | **2.0 / 4.0** |
| **2** | **Integración Continua (CI):** pipeline configurado correctamente y sin errores. | 4.0 pts | 🟢 Verificado localmente / 🟡 Run remoto pendiente | - Workflow: [.github/workflows/ci.yml](file:///.github/workflows/ci.yml) (jobs `test`, `build`).<br>- Suite: [tests/test.js](file:///tests/test.js) con **40/40 tests aprobados** (`exit 0`), terminación con `exit 1` ante fallos.<br>- Sintaxis YAML validada con Python `yaml.safe_load`.<br>- 9/9 endpoints verificados sin 404 (`scripts/verify-endpoints.js`). | **PENDIENTE:** Ejecución con check verde en la pestaña Actions de GitHub tras el push y apertura/actualización de PR. | **3.5 / 4.0** |
| **3** | **Entrega Continua (CD):** pipeline CD automatizado, completo y documentado. | 4.0 pts | 🟡 Configurado en código / Despliegue en AWS pendiente | - [Dockerfile](file:///Dockerfile) corregido con `COPY incidencias.js ./`.<br>- [.dockerignore](file:///.dockerignore) configurado.<br>- [terraform.tf](file:///terraform.tf) con Amazon Linux 2023 y SSH restringido (`ssh_cidr`).<br>- Job `deploy` en `ci.yml` configurado para SSH hacia EC2 y push a GHCR.<br>- [docs/DEPLOY.md](file:///docs/DEPLOY.md) con procedimiento y matriz de secretos. | **PENDIENTE:** Cargar secretos reales (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`) en GitHub Settings para ejecutar el despliegue automático en servidor AWS real. | **3.0 / 4.0** |
| **4** | **Presentación y exposición:** exposición clara y ordenada (material de apoyo en `docs/`). | 4.0 pts | 🟢 Material Completado | - [docs/PRESENTACION.md](file:///docs/PRESENTACION.md): Guion de 10-12 min estructurado por bloques y criterios de rúbrica, qué decir, qué proyectar y banco de preguntas frecuentes (FAQ).<br>- [README.md](file:///README.md) con arquitectura Mermaid y topología de ramas. | *Ninguno en código.* Exposición oral a cargo del estudiante. | **4.0 / 4.0** |
| **5** | **Desarrollo de 3 laboratorios:** entrega completa y puntual. | 4.0 pts | 🟡 Documentado en repo / Capturas pendientes | - [docs/LABS.md](file:///docs/LABS.md) estructurado cubriendo Lab 1 (Git/Issues), Lab 2 (CI/Docker) y Lab 3 (CD/Terraform/AWS). | **PENDIENTE:** Adjuntar capturas reales del tablero Jira/GitHub Projects y del run de Actions en los placeholders marcados. | **2.5 / 4.0** |

**Calificación Técnica Estimada Hoy:** **15.0 / 20.0**  
*(Alcanzará **20.0 / 20.0** una vez ejecutada la Fase 2 en GitHub: creación de issues, run verde en Actions y vinculación de evidencias).*

---

## 🔍 2. Evidencias Técnicas Verificadas en Consola

### A. Ejecución de la Suite de Pruebas Automatizadas
- **Comando:** `node tests/test.js`
- **Salida obtenida:**
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

### B. Verificación de Rutas HTTP y Prevención de 404
- **Comando:** `node scripts/verify-endpoints.js`
- **Salida obtenida:**
  - `✔ 200 OK /`
  - `✔ 200 OK /index.html`
  - `✔ 200 OK /inventario.html`
  - `✔ 200 OK /pedidos.html`
  - `✔ 200 OK /incidencias.html`
  - `✔ 200 OK /Login.html`
  - `✔ 200 OK /style.css`
  - `✔ 200 OK /script.js`
  - `✔ 200 OK /incidencias.js` *(Corregido: ya no genera 404)*

### C. Validación Sintáctica de Workflow YAML
- **Comando:** `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml', encoding='utf-8')); print('YAML VALIDO')"`
- **Salida obtenida:** `YAML VALIDO`

---

## 📋 3. Lista de Pendientes para Fase 2 (En GitHub)

1. **Autenticación en GitHub CLI:** Confirmar `gh auth status` o ejecutar `gh auth login`.
2. **Creación de Labels y Milestone:** Ejecutar `scripts/setup-github.ps1` contra `Sebahhs10/Novatech-HD`.
3. **Creación de las 6 Issues:** Registrar las issues reales en el repo con sus labels y milestone.
4. **Pull Request y Checks:** Definir rama de entrega (ej. `integration/avance3` o `daniel` hacia `develop` o `main`), completar plantilla con `Closes #N` reales y verificar que el workflow corra en verde.
5. **Configuración de Secretos de Despliegue:** Cargar `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` en `Settings > Secrets and variables > Actions` si se dispone de instancia AWS.
6. **Release v1.0.0:** Crear el tag y release formal en GitHub tras aprobación y merge del PR.
