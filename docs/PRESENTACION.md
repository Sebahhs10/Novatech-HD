# 🎙️ Guion y Estructura de Exposición Final - Avance de Proyecto 3

**Curso:** Herramientas de Desarrollo  
**Proyecto:** Plataforma NovaTech S.A.C. - DevOps, CI/CD, Contenedores y Mesa de Ayuda  
**Duración Total Estimada:** 10 a 12 minutos  
**Presentador:** Estudiante / Equipo  

---

## ⏱️ Cronograma Minuto a Minuto

| Bloque | Tiempo | Criterio de Rúbrica Evaluado | Tema Principal |
|---|---|---|---|
| **Bloque 1** | 0:00 - 1:30 | Introducción y Contexto | Caso empresarial NovaTech S.A.C., problemática y objetivos |
| **Bloque 2** | 1:30 - 3:30 | **Criterio 1** (4 pts) | Sistema de Seguimiento de Incidentes en Git/GitHub |
| **Bloque 3** | 3:30 - 5:30 | **Criterio 2** (4 pts) | Pipeline de Integración Continua (CI) y Tests en Node.js |
| **Bloque 4** | 5:30 - 7:30 | **Criterio 3** (4 pts) | Pipeline de Entrega Continua (CD), Docker y Terraform IaC |
| **Bloque 5** | 7:30 - 9:30 | **Criterio 5** (4 pts) | Evidencia de los 3 Laboratorios y Demostración en Vivo |
| **Bloque 6** | 9:30 - 11:00 | **Criterio 4** (4 pts) | Conclusiones, Lecciones Aprendidas y Valor Agregado |
| **Bloque 7** | 11:00 - 12:00 | Cierre | Sesión de Preguntas y Respuestas con el Docente |

---

## 📝 Guion Detallado por Bloque

### Bloque 1: Introducción y Contexto de Negocio (0:00 - 1:30)
- **Qué decir:**
  > "Buenas tardes profesor y compañeros. Hoy presentamos el Avance de Proyecto 3 para la empresa peruana NovaTech S.A.C., dedicada a la distribución de equipos tecnológicos. Antes de esta solución, NovaTech realizaba despliegues manuales de hasta 90 minutos con 20% de incidentes post-despliegue y recurrentes discrepancias de inventario. Nuestro objetivo fue implementar una solución integral DevOps que abarque seguimiento de incidencias, Integración Continua, Entrega Continua e Infraestructura como Código."
- **Qué mostrar en pantalla:**
  - Diapositiva con el logotipo de NovaTech, problema de negocio y objetivos.
  - Diagrama de arquitectura general (Dev -> GitHub -> CI/CD -> Docker -> AWS EC2).

---

### Bloque 2: Criterio 1 - Sistema de Seguimiento de Incidentes en Git (1:30 - 3:30)
- **Qué decir:**
  > "Cumpliendo con el primer criterio de la rúbrica, implementamos una gestión profesional de incidentes directamente en el ciclo de desarrollo en GitHub. Creamos un sistema taxonómico con 8 etiquetas especializadas divididas en tipo (incidencia, solicitud), prioridad (alta, media, baja) y módulo (inventario, pedidos, incidencias). Configuramos plantillas estandarizadas para el reporte de incidencias y solicitudes en `.github/ISSUE_TEMPLATE`, junto con una plantilla para Pull Requests. Además, diseñamos y estructuramos 6 incidencias reales extraídas de la operación de NovaTech con criterios de aceptación y vinculación a commits con cierre automático (`Closes #n`), documentadas en `docs/GH-SETUP.md` y automatizadas mediante `scripts/setup-github.ps1`."
- **Qué mostrar en pantalla:**
  - Plantillas en el repositorio (`.github/ISSUE_TEMPLATE/incidencia.md`, `solicitud.md` y `PULL_REQUEST_TEMPLATE.md`).
  - Script automatizado `scripts/setup-github.ps1` y guía `docs/GH-SETUP.md`.
  - Explicar la taxonomía de etiquetas y el ciclo de vida (Abierto ➔ En atención ➔ Resuelto).

---

### Bloque 3: Criterio 2 - Integración Continua (CI) (3:30 - 5:30)
- **Qué decir:**
  > "En el criterio 2, automatizamos la validación técnica mediante un pipeline de Integración Continua en GitHub Actions configurado en `.github/workflows/ci.yml`. Actualizamos las acciones a sus versiones oficiales más recientes (`checkout@v4`, `setup-node@v4` con Node 20).
  > Reescribimos completamente la suite de pruebas en `tests/test.js` sin librerías externas. Ahora ejecuta 40 pruebas en 7 suites: valida sintaxis de todos los archivos JavaScript con `node --check`, presencia de archivos requeridos, directivas del Dockerfile, y reglas de negocio críticas: prefijos de pedidos PED-, cálculo de importes, estados permitidos y reglas de existencias en inventario. Si alguna prueba falla, el script termina con `process.exit(1)`, deteniendo inmediatamente el pipeline."
- **Qué mostrar en pantalla:**
  - Terminal ejecutando `node tests/test.js` mostrando las 40 pruebas en verde y el resumen final.
  - Código de `.github/workflows/ci.yml` señalando los jobs `test` y `build`, y los pasos de validación HTTP con `curl`.

---

### Bloque 4: Criterio 3 - Entrega Continua (CD) e Infraestructura (5:30 - 7:30)
- **Qué decir:**
  > "Para el criterio 3 de Entrega Continua, el pipeline se extiende al job `deploy`, el cual está preparado para activarse en eventos push hacia la rama `main`. El contenedor Docker se empaqueta con Nginx Alpine y corregimos la inclusión de `incidencias.js` que anteriormente causaba error 404 en la vista de Mesa de Ayuda.
  > El pipeline publica la imagen en GitHub Container Registry (GHCR) y prevé la conexión hacia una instancia AWS EC2 vía SSH seguro usando variables secretas (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`).
  > Además, diseñamos la Infraestructura como Código en `terraform.tf` con Amazon Linux 2023, eliminando la vulnerabilidad de SSH abierto a 0.0.0.0/0 mediante la variable restringida `ssh_cidr` y generando outputs automáticos de IP y URL."
- **Qué mostrar en pantalla:**
  - Código de `Dockerfile` y `.dockerignore` mostrando la inclusión de `incidencias.js`.
  - Archivo `terraform.tf` destacando la variable de seguridad `ssh_cidr` y el script de aprovisionamiento `user_data`.
  - Guía detallada de secretos en `docs/DEPLOY.md`.

---

### Bloque 5: Criterio 5 - Demostración y Laboratorios (7:30 - 9:30)
- **Qué decir:**
  > "En el criterio 5 presentamos el cumplimiento íntegro de los 3 laboratorios del curso, documentados técnicamente en `docs/LABS.md`:
  > - Lab 1: Control de versiones, branching y seguimiento de incidentes con Git/GitHub.
  > - Lab 2: Integración Continua con GitHub Actions, Dockerfile y pruebas unitarias.
  > - Lab 3: Entrega Continua hacia AWS EC2, scripts PowerShell y Terraform.
  > A continuación vemos la aplicación en vivo con todos sus módulos funcionando: Dashboard general, Inventario con alertas de stock, Listado de Pedidos y el nuevo módulo de Mesa de Ayuda con registro de casos, bitácora y exportación a CSV."
- **Qué mostrar en pantalla:**
  - Navegador web con la aplicación activa:
    - `index.html`: Dashboard con contadores y enlace a los 3 módulos.
    - `inventario.html`: Existencias y estados de stock.
    - `pedidos.html`: Tabla de pedidos y filtros.
    - `incidencias.html`: Crear un caso demo (ej. stock negativo), registrar un avance en la bitácora y descargar el CSV exportado.
  - Mostrar la terminal con `node scripts/verify-endpoints.js` certificando 200 OK en todas las rutas.

---

### Bloque 6: Criterio 4 - Presentación y Conclusiones (9:30 - 11:00)
- **Qué decir:**
  > "Como balance de este Avance de Proyecto 3:
  > 1. Redujimos el tiempo de despliegue de 90 minutos manuales a menos de 3 minutos automatizados.
  > 2. Eliminamos los errores 404 y garantizamos tolerancia a fallos mediante suites de pruebas estrictas.
  > 3. Dotamos a NovaTech de trazabilidad total: cada cambio en producción tiene un commit, una issue y un test que lo respalda.
  > 4. Toda la arquitectura está respaldada por documentación técnica exhaustiva en `README.md`, `docs/DEPLOY.md`, `docs/GH-SETUP.md`, `docs/LABS.md` y `docs/VERIFICACION.md`.
  > Quedamos a su disposición para resolver cualquier duda o consulta. Muchas gracias."

---

## ❓ Preguntas Frecuentes del Evaluador (FAQ)

1. **¿Por qué eligieron Node.js puro para los tests en lugar de Jest o Mocha?**
   - *Respuesta:* Para optimizar el tiempo de ejecución en el runner de CI sin overhead de instalación de dependencias (`npm install`), manteniendo la suite portable, rápida y sin dependencias vulnerables.
2. **¿Cómo garantizan que la clave SSH no se filtre en GitHub?**
   - *Respuesta:* Se utilizan GitHub Actions Secrets encriptados a nivel de repositorio (`EC2_SSH_KEY`). Nunca se versionan llaves ni credenciales en el código fuente (`.dockerignore` y `.gitignore` las protegen).
3. **¿Qué sucede si los secretos de AWS aún no están configurados?**
   - *Respuesta:* El pipeline cuenta con validación preventiva: ejecuta `test` y `build` exitosamente y emite un warning informativo en `deploy` sin provocar una falla críptica.
4. **¿Cómo se resolvió la vulnerabilidad de Terraform en el puerto 22?**
   - *Respuesta:* Se parametrizó mediante la variable `ssh_cidr` con regla de validación obligatoria que rechaza `0.0.0.0/0`, permitiendo únicamente la IP del administrador o VPN empresarial.
