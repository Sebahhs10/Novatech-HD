---
name: Reporte de Incidencia
about: Notificar un fallo, error o comportamiento anómalo en la plataforma NovaTech
title: '[INC] '
labels: ['incidencia', 'prioridad-media']
assignees: ''
---

## 📌 Descripción de la Incidencia
Descripción clara, concisa y objetiva de la anomalía o problema detectado.

## 🧭 Módulo Afectado
Seleccione el módulo donde se reproduce el incidente:
- [ ] Módulo Inventario
- [ ] Módulo Pedidos
- [ ] Módulo Incidencias / Mesa de Ayuda
- [ ] Infraestructura / Docker / CI/CD

## 🔁 Pasos para Reproducir
1. Ir a la vista `...`
2. Hacer clic en `...`
3. Ingresar el valor `...`
4. Observar el error ocurrido.

## ⚡ Comportamiento Esperado vs. Obtenido
- **Comportamiento esperado:** Qué debió haber sucedido según las reglas del negocio.
- **Comportamiento obtenido:** Qué ocurrió realmente (mensaje de error, visualización rota, etc.).

## 🎯 Criterios de Aceptación para Resolución
- [ ] La causa raíz está identificada y corregida.
- [ ] Se ejecutaron las pruebas unitarias y de integración (`node tests/test.js`) con éxito.
- [ ] La solución fue validada en el contenedor Docker.
- [ ] Se actualizó la bitácora de seguimiento.

## 📎 Evidencia / Capturas
*(Adjunte capturas de pantalla, logs de consola o datos de prueba)*
