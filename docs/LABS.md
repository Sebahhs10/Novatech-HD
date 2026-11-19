# 🧪 Evidencia de Desarrollo de los 3 Laboratorios - Curso Herramientas de Desarrollo

Este documento recopila las evidencias técnicas del desarrollo y entrega de los **3 Laboratorios** requeridos en la rúbrica del curso (Criterio 5 - 4 puntos).

---

## 📌 Resumen de Cumplimiento de Laboratorios

| Laboratorio | Tema Central | Estado | Entregables Principales |
|---|---|---|---|
| **Laboratorio 1** | Control de Versiones con Git, GitHub y Gestión de Incidentes | ✅ Completado | Repositorio remoto, branching model, templates de issue/PR, 6 issues reales, milestone, etiquetas y release. |
| **Laboratorio 2** | Integración Continua (CI) con GitHub Actions y Docker | ✅ Completado | Workflow CI con jobs `test` y `build`, 40 tests automatizados en Node puro, validación de endpoints HTTP y empaquetado Docker. |
| **Laboratorio 3** | Entrega Continua (CD), Infraestructura como Código (Terraform) y Despliegue en AWS | ✅ Completado | Workflow CD con job `deploy` SSH/GHCR, código `terraform.tf` endurecido para AWS EC2 y scripts de automatización. |

---

## 📁 Laboratorio 1: Control de Versiones y Gestión de Incidentes con Git/GitHub

### 1.1. Objetivos del Laboratorio
- Establecer el flujo de ramas colaborativo (`main`, `feature/*`).
- Configurar plantillas de issues (`.github/ISSUE_TEMPLATE/incidencia.md`, `solicitud.md`) y pull request (`.github/PULL_REQUEST_TEMPLATE.md`).
- Implementar taxonomía de etiquetas por tipo, prioridad y módulo.
- Crear hitos (milestones) y registrar incidentes reales basados en el negocio de NovaTech S.A.C.
- Practicar el ciclo de vida de incidencias y el cierre automático mediante palabras clave en commits.

### 1.2. Evidencias Técnicas Implementadas
1. **Repositorio Remoto Oficial:**
   - URL: [https://github.com/Sebahhs10/Novatech-HD](https://github.com/Sebahhs10/Novatech-HD)
2. **Rama de Trabajo:**
   - `feature/avance-proyecto-3`
3. **Plantillas en el Repositorio:**
   - [incidencia.md](file:///.github/ISSUE_TEMPLATE/incidencia.md)
   - [solicitud.md](file:///.github/ISSUE_TEMPLATE/solicitud.md)
   - [PULL_REQUEST_TEMPLATE.md](file:///.github/PULL_REQUEST_TEMPLATE.md)
4. **Script de Automatización de Configuración:**
   - [setup-github.ps1](file:///scripts/setup-github.ps1)
   - [GH-SETUP.md](file:///docs/GH-SETUP.md)

### 1.3. Registro de Issues y Trazabilidad
| ID Issue | Título | Tipo | Prioridad | Módulo | Estado |
|---|---|---|---|---|---|
| `#1` | `[INC-0001] Producto con stock negativo al registrar salida en Inventario` | Incidencia | Alta | Inventario | Resuelto (vía commit/PR) |
| `#2` | `[SOL-0002] Habilitar credenciales y permisos para nuevo operador de almacén` | Solicitud | Media | Incidencias | Resuelto |
| `#3` | `[INC-0003] Pedido no refleja actualización de estado tras despacho` | Incidencia | Baja | Pedidos | Resuelto |
| `#4` | `[INC-0004] Script incidencias.js no cargaba en el contenedor Docker (HTTP 404)` | Incidencia | Alta | Incidencias / CI | Resuelto (Fix Dockerfile) |
| `#5` | `[SOL-0005] Automatizar suite de pruebas con validación estricta y código de salida` | Solicitud | Media | CI / Tests | Resuelto (test.js) |
| `#6` | `[SOL-0006] Implementar pipeline CD automático hacia AWS EC2 mediante SSH y GHCR` | Solicitud | Alta | CD / Deploy | Resuelto (ci.yml) |

### 1.4. Capturas y Enlaces de Evidencia (Lab 1)
- **Enlace a Issues en GitHub:** [https://github.com/Sebahhs10/Novatech-HD/issues](https://github.com/Sebahhs10/Novatech-HD/issues)
- **Enlace a Pull Requests:** [https://github.com/Sebahhs10/Novatech-HD/pulls](https://github.com/Sebahhs10/Novatech-HD/pulls)
- **Tablero Jira / GitHub Projects:**
  > [!NOTE]
  > `[EVIDENCIA PENDIENTE: Insertar aquí enlace o captura del tablero Jira / GitHub Projects del equipo]`
  > *Ruta sugerida de captura:* `docs/img/lab1-tablero.png`

---

## ⚡ Laboratorio 2: Integración Continua (CI) con GitHub Actions y Docker

### 2.1. Objetivos del Laboratorio
- Construir un pipeline de integración continua que valide automáticamente cada cambio de código.
- Implementar una suite de pruebas automatizadas en Node.js puro sin librerías externas que garantice la integridad de sintaxis, estructura y reglas de negocio.
- Contenedorizar la aplicación web mediante Dockerfile optimizado y Nginx Alpine.
- Ejecutar pruebas funcionales y smoke tests HTTP con curl en el runner de GitHub Actions.

### 2.2. Evidencias Técnicas Implementadas
1. **Archivo de Definición del Workflow:**
   - [.github/workflows/ci.yml](file:///.github/workflows/ci.yml)
2. **Suite de Pruebas Automatizadas:**
   - [tests/test.js](file:///tests/test.js) (40 pruebas ejecutadas, retorno `exit 0` en éxito y `exit 1` en error).
3. **Optimización Docker:**
   - [Dockerfile](file:///Dockerfile) (incluye `COPY incidencias.js ./`).
   - [.dockerignore](file:///.dockerignore) (exclusión de `.git`, `.github`, `terraform.tf`, `scripts/`, etc.).
4. **Verificación de Endpoints HTTP:**
   - [scripts/verify-endpoints.js](file:///scripts/verify-endpoints.js) (comprueba que los 9 endpoints respondan 200 OK sin 404).

### 2.3. Ejecución de Pruebas Automatizadas
```
▶ SUITE: 1. Existencia e integridad de archivos requeridos (12 pruebas) -> ✔
▶ SUITE: 2. Validación sintáctica de archivos JavaScript (node --check) (3 pruebas) -> ✔
▶ SUITE: 3. Validación de configuración Dockerfile y .dockerignore (6 pruebas) -> ✔
▶ SUITE: 4. Contenido mínimo esperado en vistas HTML (6 pruebas) -> ✔
▶ SUITE: 5. Reglas de negocio del Portal de Pedidos (5 pruebas) -> ✔
▶ SUITE: 6. Reglas de negocio del Inventario (3 pruebas) -> ✔
▶ SUITE: 7. Reglas de negocio del Módulo de Incidencias (5 pruebas) -> ✔

Total pruebas: 40 | Aprobadas: 40 | Fallidas: 0
Código de salida: 0 (Éxito)
```

### 2.4. Capturas y Enlaces de Evidencia (Lab 2)
- **Enlace al historial de ejecuciones en GitHub Actions:**
  [https://github.com/Sebahhs10/Novatech-HD/actions](https://github.com/Sebahhs10/Novatech-HD/actions)
- **Captura de pantalla de la ejecución exitosa de CI:**
  > [!NOTE]
  > `[EVIDENCIA PENDIENTE: Insertar aquí captura de pantalla del run exitoso de GitHub Actions con los jobs test y build en verde]`
  > *Ruta sugerida de captura:* `docs/img/lab2-ci-run.png`

---

## 🚀 Laboratorio 3: Entrega Continua (CD), Infraestructura como Código (Terraform) y AWS

### 3.1. Objetivos del Laboratorio
- Extender el pipeline de CI para incluir Entrega y Despliegue Continuo (CD) automatizado.
- Diseñar la infraestructura en AWS (instancia EC2, Security Group restrictivo, script de arranque) utilizando Terraform.
- Configurar despliegue por SSH y registro de imágenes en GitHub Container Registry (GHCR).
- Automatizar el script de despliegue local y de producción en PowerShell (`scripts/deploy.ps1`).

### 3.2. Evidencias Técnicas Implementadas
1. **Infraestructura como Código (IaC):**
   - [terraform.tf](file:///terraform.tf):
     - AMI actualizada a Amazon Linux 2023 (`ami-0c101f26f147fa7fd`).
     - SSH restringido exclusivamente mediante variable `ssh_cidr` con regla de validación contra `0.0.0.0/0`.
     - Script de aprovisionamiento automatizado `user_data` con Docker y Git.
     - Outputs: IP pública, URL de acceso e ID de instancia.
2. **Job de Despliegue en GitHub Actions:**
   - Job `deploy` en [.github/workflows/ci.yml](file:///.github/workflows/ci.yml) condicionado a la rama `main`.
   - Uso de secretos (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`).
   - Verificación de salud posterior al despliegue.
3. **Script de Despliegue Local Automatizado:**
   - [scripts/deploy.ps1](file:///scripts/deploy.ps1) con doble tag (`v1.0.0`, `latest`) y validación HTTP.
4. **Guía de Despliegue y Secrets:**
   - [docs/DEPLOY.md](file:///docs/DEPLOY.md).

### 3.3. Capturas y Enlaces de Evidencia (Lab 3)
- **URL pública de la aplicación desplegada en AWS EC2:**
  > [!NOTE]
  > `[EVIDENCIA PENDIENTE: http://<EC2_PUBLIC_IP> o enlace asignado tras ejecutar terraform apply]`
- **Captura del contenedor Docker corriendo en el servidor:**
  > [!NOTE]
  > `[EVIDENCIA PENDIENTE: Insertar captura de consola SSH en EC2 ejecutando 'docker ps' y mostrando el contenedor novatech-web activo]`
  > *Ruta sugerida de captura:* `docs/img/lab3-docker-ec2.png`
- **Captura de la vista web pública en navegador:**
  > [!NOTE]
  > `[EVIDENCIA PENDIENTE: Insertar captura de pantalla de la aplicación cargada en el navegador con la IP pública]`
  > *Ruta sugerida de captura:* `docs/img/lab3-navegador.png`
