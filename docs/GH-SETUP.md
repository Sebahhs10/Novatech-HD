# 🐙 Guía de Gestión de Incidentes en GitHub (Rúbrica - Criterio 1)

Este documento detalla el procedimiento completo para configurar el **Sistema de Seguimiento de Incidentes** en el repositorio [WhariCDH/novatech-devops](https://github.com/WhariCDH/novatech-devops) de acuerdo con los requerimientos del **Avance de Proyecto 3** del curso *Herramientas de Desarrollo*.

---

## 🏷️ 1. Definición de Etiquetas (Labels)

Se definen 8 etiquetas estándar organizadas por tipo, prioridad y módulo:

| Etiqueta | Color HEX | Descripción | Categoría |
|---|---|---|---|
| `incidencia` | `#d73a4a` (Rojo) | Errores, bugs o anomalías en la plataforma | Tipo |
| `solicitud` | `#0075ca` (Azul) | Peticiones de servicio, accesos o mejoras | Tipo |
| `prioridad-alta` | `#b60205` (Rojo oscuro) | Bloquea la operación o afecta datos críticos | Prioridad |
| `prioridad-media` | `#fbca04` (Ámbar) | Afectación parcial con solución temporal | Prioridad |
| `prioridad-baja` | `#0e8a16` (Verde) | Ajustes menores o consultas operativas | Prioridad |
| `modulo-inventario` | `#5319e7` (Púrpura) | Relacionado a stock, existencias y almacén | Módulo |
| `modulo-pedidos` | `#1d76db` (Celeste) | Relacionado al portal y estados de pedidos | Módulo |
| `modulo-incidencias` | `#e99695` (Rosado) | Mesa de ayuda y seguimiento de soporte TI | Módulo |

### Creación rápida con GitHub CLI (`gh`):
```bash
gh label create incidencia --color "d73a4a" --description "Errores o fallos reportados en la plataforma"
gh label create solicitud --color "0075ca" --description "Peticiones de servicio, accesos o mejoras"
gh label create prioridad-alta --color "b60205" --description "Bloquea operaciones o afecta datos críticos"
gh label create prioridad-media --color "fbca04" --description "Afectación parcial con alternativa temporal"
gh label create prioridad-baja --color "0e8a16" --description "Mejoras menores o consultas generales"
gh label create modulo-inventario --color "5319e7" --description "Relacionado al módulo de inventario y stock"
gh label create modulo-pedidos --color "1d76db" --description "Relacionado a la gestión y listado de pedidos"
gh label create modulo-incidencias --color "e99695" --description "Relacionado a la mesa de ayuda y soporte TI"
```

---

## 🎯 2. Creación del Milestone (Hito)

- **Título:** `Avance de Proyecto 3`
- **Fecha límite:** Fecha de entrega del curso
- **Descripción:** Implementación de pipeline CI/CD completo, empaquetado Docker multi-módulo, automatización de pruebas, gestión de incidencias y propuesta de infraestructura con Terraform.

### Creación con GitHub CLI:
```bash
gh api -X POST repos/:owner/:repo/milestones -f title="Avance de Proyecto 3" -f description="Hito para entrega del Avance de Proyecto 3: CI/CD, Mesa de Ayuda, Docker y Terraform."
```

---

## 📋 3. Registro de las 6 Issues Reales

A continuación se presentan las 6 issues extraídas de los casos de uso reales de NovaTech S.A.C.:

### Issue #1: [INC-0001] Producto con stock negativo al registrar salida en Inventario
- **Tipo:** Incidencia
- **Etiquetas:** `incidencia`, `prioridad-alta`, `modulo-inventario`
- **Milestone:** Avance de Proyecto 3
- **Descripción:**
  Al registrar movimientos de salida desde el módulo de inventario, el sistema permite registrar cantidades superiores a las existencias reales, originando valores negativos en el catálogo.
- **Criterios de Aceptación:**
  1. Impedir la salida si la cantidad solicitada supera el stock disponible.
  2. Notificar al operador mediante mensaje de error visual.
  3. Registrar la incidencia en la bitácora interna.

### Issue #2: [SOL-0002] Habilitar credenciales y permisos para nuevo operador de almacén
- **Tipo:** Solicitud
- **Etiquetas:** `solicitud`, `prioridad-media`, `modulo-incidencias`
- **Milestone:** Avance de Proyecto 3
- **Descripción:**
  Se requiere habilitar una nueva cuenta de acceso para el operador Carlos Ruiz en el módulo de inventario y pedidos.
- **Criterios de Aceptación:**
  1. Asignar perfil de operador con permisos de consulta y actualización de existencias.
  2. Entregar credenciales seguras al usuario solicitante.

### Issue #3: [INC-0003] Pedido no refleja actualización de estado tras despacho
- **Tipo:** Incidencia
- **Etiquetas:** `incidencia`, `prioridad-baja`, `modulo-pedidos`
- **Milestone:** Avance de Proyecto 3
- **Descripción:**
  El pedido PED-003 figura como 'pendiente' a pesar de haber sido despachado por logística.
- **Criterios de Aceptación:**
  1. Sincronizar el estado del pedido a 'enviado'.
  2. Comprobar que los filtros del dashboard contabilicen correctamente el estado.

### Issue #4: [INC-0004] Script incidencias.js no cargaba en el contenedor Docker (HTTP 404)
- **Tipo:** Incidencia
- **Etiquetas:** `incidencia`, `prioridad-alta`, `modulo-incidencias`
- **Milestone:** Avance de Proyecto 3
- **Descripción:**
  La vista `incidencias.html` arrojaba error 404 para `incidencias.js` dentro del contenedor Docker oficial porque el Dockerfile no incluía la directiva de copia.
- **Criterios de Aceptación:**
  1. Agregar `COPY incidencias.js ./` en Dockerfile.
  2. Añadir archivo `.dockerignore`.
  3. Validar con curl respuesta 200 en `http://localhost:8080/incidencias.js`.

### Issue #5: [SOL-0005] Automatizar suite de pruebas con validación estricta y código de salida
- **Tipo:** Solicitud
- **Etiquetas:** `solicitud`, `prioridad-media`, `modulo-inventario`, `modulo-pedidos`
- **Milestone:** Avance de Proyecto 3
- **Descripción:**
  Reescribir `tests/test.js` para validar sintaxis de JavaScript (`node --check`), existencia de archivos obligatorios y reglas de negocio con `process.exit(1)` en caso de fallos.
- **Criterios de Aceptación:**
  1. Cobertura de sintaxis, estructura y datos de pedidos/inventario/incidencias.
  2. Código de salida estándar (0 éxito, 1 error).
  3. Ejecución automática en el pipeline de GitHub Actions.

### Issue #6: [SOL-0006] Implementar pipeline CD automático hacia AWS EC2 mediante SSH y GHCR
- **Tipo:** Solicitud
- **Etiquetas:** `solicitud`, `prioridad-alta`, `modulo-incidencias`
- **Milestone:** Avance de Proyecto 3
- **Descripción:**
  Configurar el pipeline de entrega continua (CD) en `.github/workflows/ci.yml` para desplegar en EC2 tras cada push a la rama `main`.
- **Criterios de Aceptación:**
  1. Job `deploy` en GitHub Actions activado por push a `main`.
  2. Documentar variables secretas (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `GHCR_TOKEN`).
  3. Manejo resiliente en caso de que los secretos no estén cargados.

---

## 🔄 4. Ciclo de Vida de los Incidentes y Cierre Automático

El flujo de atención sigue tres estados estándar:

```
[ Abierto ]  ──▶  [ En atención ]  ──▶  [ Resuelto / Cerrado ]
 (Reportado)       (En desarrollo)         (Validado en CI/CD)
```

### Cierre mediante mensajes de commit o Pull Request:
GitHub permite cerrar issues automáticamente usando palabras clave seguidas del número de issue:
- `Closes #1`
- `Fixes #3`
- `Resolves #4`

#### Ejemplo de commit para cerrar issues:
```bash
git commit -m "fix(docker): resolver carga de incidencias.js en contenedor

Closes #4, Closes #5"
```

---

## 🔀 5. Flujo de Pull Request y Release v1.0.0

### Paso A: Subir la rama `feature/avance-proyecto-3`
```bash
git push -u origin feature/avance-proyecto-3
```

### Paso B: Abrir el Pull Request hacia `main`
- **Título:** `feat: entrega de Avance de Proyecto 3 - CI/CD, Mesa de Ayuda y Docker`
- **Rama origen:** `feature/avance-proyecto-3`
- **Rama destino:** `main`
- **Descripción:**
  ```markdown
  ## 🚀 Propósito del Pull Request
  Entrega del Avance de Proyecto 3 para el curso Herramientas de Desarrollo.
  
  ## 🔗 Incidencias Resueltas
  - Closes #1
  - Closes #2
  - Closes #3
  - Closes #4
  - Closes #5
  - Closes #6
  
  ## 📋 Checklist
  - [x] Dockerfile y .dockerignore corregidos (incidencias.js incluido).
  - [x] Suite de tests que valida sintaxis, estructura y reglas de negocio (exit 1 en error).
  - [x] Pipeline CI/CD con test, build y deploy por SSH/GHCR.
  - [x] Documentación completa en README.md y docs/.
  ```

### Paso C: Merge del Pull Request
Realizar el merge en GitHub seleccionando **"Create a merge commit"** o **"Squash and merge"**.

### Paso D: Creación del Tag y Release `v1.0.0`
Una vez fusionado en `main`:
```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release Avance de Proyecto 3 - NovaTech DevOps"
git push origin v1.0.0
```
Y en GitHub:
1. Ir a **Releases** > **Draft a new release**.
2. Elegir el tag `v1.0.0`.
3. Título: `NovaTech S.A.C. - Avance de Proyecto 3`.
4. Publicar release.
