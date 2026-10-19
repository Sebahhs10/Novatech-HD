## 📌 Tipo de Cambio
Marca con una `x` las casillas aplicables:
- [ ] 🐛 `fix`: Corrección de errores
- [ ] ✨ `feat`: Nueva característica o funcionalidad
- [ ] ♻️ `refactor`: Refactorización de código sin cambios funcionales
- [ ] 🎨 `style`: Cambios visuales, maquetación o CSS
- [ ] ⚙️ `ci` / `ops`: Configuración de GitHub Actions, Docker o Terraform
- [ ] 📝 `docs`: Documentación técnica o README

---

## 📝 Descripción del Cambio
*Describe de manera concisa qué cambios introduce este PR y el motivo técnico o de negocio.*

**Issue vinculado**: Closes # <!-- Coloca el número del issue, ej: Closes #1 -->

---

## 🧪 Pruebas Realizadas
*Detalla qué pruebas se ejecutaron para validar la funcionalidad:*
- [ ] Ejecución local de pruebas unitarias (`node tests/test.js`).
- [ ] Validación visual en navegador (Chrome/Firefox/Edge).
- [ ] Validación de contenedor Docker (`docker build` y `docker run`).

---

## ✅ Checklist de Control de Calidad (Definition of Done)
Antes de solicitar revisión, confirma los siguientes puntos:
- [ ] **Rama de destino correcta**: El PR apunta a `develop` (no directamente a `main`).
- [ ] **Sin conflictos**: La rama está al día con `develop` y no presenta conflictos de fusión.
- [ ] **Pruebas automáticas**: Todos los checks del workflow de CI pasaron en verde (Node.js y Docker).
- [ ] **Limpieza de código**: No se incluyen `console.log` de depuración innecesarios ni código comentado.
- [ ] **Git Commits limpios**: Mensajes de commit con formato convencional (`feat:`, `fix:`, `chore:`).
- [ ] **Revisión por pares**: Se ha asignado al menos a un revisor del equipo.
