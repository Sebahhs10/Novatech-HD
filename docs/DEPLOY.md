# 🚀 Guía de Despliegue y Entrega Continua (CD) - NovaTech S.A.C.

Esta guía documenta la arquitectura, configuración de credenciales, despliegue automatizado hacia AWS EC2 y las opciones de ejecución local de la plataforma NovaTech.

---

## 🏗️ 1. Arquitectura de Despliegue

```text
┌──────────────┐       ┌───────────────┐       ┌────────────────────────┐
│ Desarrollador│──────▶│ GitHub Repo   │──────▶│ GitHub Actions         │
│ (git push)   │       │ (Rama main)   │       │ - Job: test (Node 20)  │
└──────────────┘       └───────────────┘       │ - Job: build (Docker)  │
                                               │ - Job: deploy (SSH)    │
                                               └───────────┬────────────┘
                                                           │
                                                           ▼
                                               ┌────────────────────────┐
                                               │ Servidor AWS EC2       │
                                               │ - Nginx en Docker      │
                                               │ - Puerto 80 público    │
                                               │ - IP: <EC2_PUBLIC_IP>  │
                                               └────────────────────────┘
```

El flujo de entrega continua está diseñado bajo el principio de **Zero-Downtime Deployment** mediante contenedores Docker orquestados por GitHub Actions.

---

## 🔐 2. Variables Secretas Requeridas en GitHub Actions

> [!IMPORTANT]
> **Estado Actual:** Los secretos de infraestructura en AWS están **PENDIENTES DE CONFIGURACIÓN** en el repositorio remoto. Por tanto, el job `deploy` de `.github/workflows/ci.yml` se encuentra en estado **configurado-no-ejecutado** (resiliente), evitando inventar credenciales o simular despliegues no verificados.

Para activar la conexión real hacia AWS EC2, se deben registrar los siguientes secretos en el repositorio:

> **Ruta en GitHub:** `Settings` > `Secrets and variables` > `Actions` > `New repository secret`

| Nombre del Secret | Obligatorio | Descripción | Ejemplo / Valor | Estado Actual |
|---|---|---|---|---|
| `EC2_HOST` | **Sí** | Dirección IP pública o DNS público de la instancia AWS EC2. | `54.210.123.45` | PENDIENTE |
| `EC2_USER` | **Sí** | Usuario del sistema operativo en la instancia EC2. | `ec2-user` (Amazon Linux 2023) | PENDIENTE |
| `EC2_SSH_KEY` | **Sí** | Contenido completo de la llave privada SSH (`.pem`), incluyendo cabecera y pie. | `-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----` | PENDIENTE |
| `EC2_SSH_PORT` | No | Puerto de conexión SSH (por defecto: 22). | `22` | Opcional |
| `GHCR_TOKEN` | No | Token de GitHub si el paquete GHCR es privado. *(Usa GITHUB_TOKEN por defecto)*. | `ghp_xxxxxxxxxxxx` | Opcional |

---

## ☁️ 3. Aprovisionamiento de Infraestructura con Terraform

La infraestructura base en AWS se define mediante Infraestructura como Código (IaC) en `terraform.tf`.

### Requisitos previos:
- AWS CLI configurado con credenciales (`aws configure`).
- Terraform >= 1.5.0 instalado.

### Pasos de inicialización y validación:
```bash
# 1. Inicializar proveedores de Terraform
terraform init

# 2. Formatear y validar sintaxis
terraform fmt
terraform validate

# 3. Planificar aprovisionamiento
terraform plan -var="ssh_cidr=[\"TU_IP_PUBLICA/32\"]"

# 4. Aplicar despliegue (SOLO cuando se autorice aprovisionamiento real)
terraform apply -var="ssh_cidr=[\"TU_IP_PUBLICA/32\"]"
```

### Parámetros de Terraform:
- `aws_region`: `us-east-1` (por defecto).
- `instance_type`: `t2.micro` (capa gratuita).
- `ami_id`: AMI oficial de Amazon Linux 2023 (`ami-0c101f26f147fa7fd`).
- `ssh_cidr`: Lista de IPs autorizadas para conexión SSH (bloqueado por defecto contra `0.0.0.0/0` para proteger el servidor).

---

## 🔄 4. Flujo de Despliegue Automatizado (CD por GitHub Actions)

Cada vez que se realiza un merge o push a la rama `main`:

1. **Job `test`:**
   - Descarga el código y configura Node.js 20.
   - Ejecuta `node tests/test.js` (40 pruebas unitarias y de integración en Node puro).
2. **Job `build`:**
   - Construye la imagen Docker `novatech:latest` y `novatech:<SHA>`.
   - Levanta un contenedor efímero en el runner y comprueba que todas las páginas (`/`, `index.html`, `inventario.html`, `pedidos.html`, `incidencias.html`, `Login.html`) y scripts (`script.js`, `incidencias.js`, `style.css`) respondan HTTP 200 sin 404.
   - Publica la imagen en GitHub Container Registry (`ghcr.io/sebahhs10/novatech-hd:latest`).
3. **Job `deploy`:**
   - Verifica preventivamente si los secretos existen. Si no están configurados, emite aviso informativo (`::notice::`) y no rompe el pipeline.
   - Si están presentes, establece sesión SSH segura con la instancia EC2, descarga la imagen desde GHCR, reinicia el contenedor y ejecuta un smoke test con curl.

---

## 💻 5. Despliegue Local para Desarrollo y Pruebas

Si necesitas ejecutar la aplicación en tu entorno local antes de hacer push a GitHub, tienes dos alternativas:

### Opción A: Despliegue con Docker (Recomendado)
Usa el script automatizado en PowerShell:
```powershell
# Ejecuta construcción, inicio y healthcheck en http://localhost:8080
.\scripts\deploy.ps1 -Tag "v1.0.0" -Port 8080
```
O directamente con comandos Docker:
```bash
docker build -t novatech:v1.0.0 .
docker run -d -p 8080:80 --name novatech-web novatech:v1.0.0
```

### Opción B: Verificación sin Docker (Node.js Nativo)
Si no tienes Docker instalado en tu estación de trabajo:
```bash
# Servidor local de verificación de endpoints
node scripts/verify-endpoints.js

# O levantar con un servidor estático ligero
npx serve -l 8080 .
```

---

## 🩺 6. Troubleshooting y Preguntas Frecuentes

### ¿El contenedor inicia pero la página de incidencias muestra errores de consola?
Asegúrate de que el Dockerfile contenga `COPY incidencias.js ./`. Esto fue resuelto en la versión actual del módulo.

### ¿Fallo de conexión SSH en el job `deploy`?
1. Verifica que la IP en `EC2_HOST` esté activa y no haya cambiado por un reinicio de la instancia EC2.
2. Comprueba que el Security Group permita tráfico en el puerto 22 desde el rango autorizado.
3. Asegúrate de copiar la clave SSH privada completa en `EC2_SSH_KEY`, incluyendo cabecera y pie.
