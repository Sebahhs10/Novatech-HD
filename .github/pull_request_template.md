## 🚀 Propósito del Pull Request
Explica brevemente qué resuelve este cambio, qué funciones añade o qué correcciones introduce para el Avance de Proyecto 3.

## 🔗 Incidencias / Solicitudes Relacionadas
Indica las issues que este PR atiende o resuelve (usar palabras clave para cierre automático):
- Closes #
- Fixes #
- Ref #

## 🛠️ Tipo de Cambio
- [ ] 🐛 `fix`: Corrección de bug o error
- [ ] ✨ `feat`: Nueva funcionalidad (Mesa de Ayuda, filtros, etc.)
- [ ] 📝 `docs`: Documentación técnica (README, docs/)
- [ ] ♻️ `refactor`: Refactorización de código sin cambios funcionales
- [ ] ⚙️ `ci` / `ops`: Configuración de GitHub Actions, Docker o Terraform
- [ ] 🧪 `test`: Pruebas automatizadas (test.js)

## 📋 Lista de Verificación de Calidad (Definition of Done)
- [ ] **Rama de destino correcta:** El PR apunta a `develop` bajo flujo GitFlow (o a `main` si es release final coordinado).
- [ ] **Sintaxis y estilo:** El código pasa la verificación sintáctica (`node --check`).
- [ ] **Pruebas automatizadas:** Se ejecutó `node tests/test.js` con las 40 pruebas en verde (`exit 0`).
- [ ] **Verificación de endpoints:** Comprobados con `node scripts/verify-endpoints.js` (sin 404).
- [ ] **Seguridad:** No se incluyen contraseñas, tokens ni secretos en el código fuente (`.dockerignore` activo).
- [ ] **Documentación:** Se actualizaron `README.md` y archivos de soporte en `docs/`.
- [ ] **Revisión por pares:** Asignado al menos un revisor del equipo.

## 📸 Evidencias de Pruebas
*(Adjuntar capturas de pantalla de la aplicación, salida de tests o enlaces a los runs del pipeline de CI/CD)*
