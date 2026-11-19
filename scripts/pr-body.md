## 🚀 Propósito del Pull Request
Entrega final integral del **Avance de Proyecto 3** para el curso *Herramientas de Desarrollo* (NovaTech S.A.C.):
- Integración completa del **Módulo de Incidencias / Mesa de Ayuda** (`incidencias.html`, `incidencias.js`, navegación y estilos) en la plataforma corporativa.
- Preservación íntegra de la arquitectura full-stack preexistente en `main` (backend Node.js/Express + MySQL en el directorio `backend/`).
- Pipeline CI/CD en GitHub Actions (`.github/workflows/ci.yml`) configurado y probado con 3 jobs automáticos:
  - `test`: **CI - Pruebas Unitarias y Reglas de Negocio** (40/40 pruebas pasando en verde).
  - `build`: **CI - Construcción, Verificación y Empaquetado Docker** (smoke tests HTTP 200 en rutas y assets, publicación en GitHub Container Registry - GHCR).
  - `deploy`: **CD - Despliegue Continuo en AWS EC2 (SSH)** (condicional a push en `main` y presencia de secretos de despliegue).
- Empaquetado Docker con imagen base `nginx:alpine` single-stage, copiando `./*.html`, `style.css`, `script.js` e `incidencias.js` (solución definitiva al HTTP 404 de la incidencia #11).
- Infraestructura como Código en `terraform.tf` (raíz): Amazon Linux 2023 (AL2023), `required_providers` AWS `~> 5.0` y validación estricta de seguridad en variable `ssh_cidr` impidiendo `0.0.0.0/0`.
- Reglas de exclusión en `.dockerignore`: `.git`, `.github`, `scripts/`, `tests/`, `docs/`, `node_modules/`, `terraform.tfstate*`, `.terraform/` y `Dockerfile`.
- Documentación técnica y académica en `docs/`: Guía de Despliegue (`DEPLOY.md`), Configuración de GitHub (`GH-SETUP.md`), Informe de los 3 Laboratorios con evidencias (`LABS.md`), Guión de Exposición de 10-12 min (`PRESENTACION.md`) y Matriz de Verificación (`VERIFICACION.md`).

## 🔗 Incidencias / Solicitudes Relacionadas
- Closes #8 - [INC-0001] Producto con stock negativo al registrar salida en Inventario
- Closes #11 - [INC-0004] Script incidencias.js no cargaba en el contenedor Docker (HTTP 404)
- Closes #12 - [SOL-0005] Automatizar suite de pruebas con validación estricta y código de salida (exit code 1)
- Ref #9 - [SOL-0002] Habilitar credenciales y permisos para nuevo operador de almacén
- Ref #10 - [INC-0003] Pedido no refleja actualización de estado tras despacho
- Ref #13 - [SOL-0006] Configurar pipeline de entrega continua en AWS EC2 mediante SSH y GHCR

## 🛠️ Tipo de Cambio
- [x] 🐛 `fix`: Corrección de ruta 404 en incidencias.js dentro de Dockerfile y reglas de negocio de stock
- [x] ✨ `feat`: Módulo de Mesa de Ayuda / Incidencias integrado y funcional
- [x] 📝 `docs`: Documentación técnica y evidencias en README.md y docs/ (DEPLOY, GH-SETUP, LABS, PRESENTACION, VERIFICACION)
- [ ] ♻️ `refactor`: Refactorización de código sin cambios funcionales
- [x] ⚙️ `ci` / `ops`: Pipeline GitHub Actions (jobs test, build, deploy), Dockerfile y terraform.tf
- [x] 🧪 `test`: Suite automatizada de 40 pruebas unitarias con validación de salida estricta

## 📋 Lista de Verificación de Calidad (Definition of Done)
- [x] **Rama de destino:** Apunta a `main` para el release final coordinado de Avance 3.
- [x] **Sintaxis y estilo:** Código verificado sintácticamente sin errores (`node --check`).
- [x] **Pruebas automatizadas:** 40/40 tests en verde tanto en local como en CI (`node tests/test.js`, exit code 0).
- [x] **Verificación de endpoints:** Comprobados con `node scripts/verify-endpoints.js` (9/9 rutas HTTP 200 OK, 0 errores 404).
- [x] **Seguridad:** `.dockerignore` configurado excluyendo metadatos y fuentes innecesarias; validación en `terraform.tf` bloquea `0.0.0.0/0` en SSH.
- [x] **Documentación:** Directorio `docs/` completo y sincronizado con métricas reales, sin datos ficticios.
- [ ] **Revisión por pares:** Solicitada revisión a @Sebahhs10 / revisión por pares pendiente de aprobación.

## 📸 Evidencias de Pruebas
- **CI GitHub Actions Run #19 (Verde):** https://github.com/Sebahhs10/Novatech-HD/actions/runs/44459125502 (commit `0ba7d16`)
- **Resultados de Suite de Pruebas:** 40 pruebas ejecutadas, 40 pasadas, 0 fallidas (código de salida 0).
- **Verificación de Endpoints Locales:** 9/9 rutas estáticas y módulos respondiendo HTTP 200 OK.
