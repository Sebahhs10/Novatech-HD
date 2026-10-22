---
name: "feat(auth): Validación de credenciales y seguridad en Login.html"
about: Tarea para validación de formatos, sanitización y seguridad en Login.html
title: "feat(auth): Validación de credenciales y seguridad en Login.html"
labels: "enhancement, frontend, security"
assignees: ""
---

### 📋 Descripción / User Story
**Como** usuario del sistema Novatech-HD,  
**Quiero** que el formulario de inicio de sesión valide los formatos de correo, sanitice entradas y maneje mensajes de error claros,  
**Para** garantizar un acceso seguro y evitar intentos de inyección o accesos inválidos.

---

### 🎯 Criterios de Aceptación (Definition of Done)
- [ ] El campo de email debe validar formato RFC standard en tiempo real en `Login.html`.
- [ ] La contraseña debe exigir longitud mínima de 8 caracteres y bloquear envío si está vacía.
- [ ] Los mensajes de error deben mostrarse en un componente visual accesible (sin recargar la página).
- [ ] Las funciones en `script.js` deben manejar estados de carga (`isSubmitting`) para evitar doble clic.
- [ ] El diseño debe mantener consistencia con los estilos globales definidos en `style.css`.

---

### 🛠️ Tareas Técnicas
1. Modificar `Login.html` para agregar atributos semánticos `required`, `pattern` y `aria-invalid`.
2. Implementar función `validarFormularioLogin()` en `script.js`.
3. Añadir clases de error y animación en `style.css`.
