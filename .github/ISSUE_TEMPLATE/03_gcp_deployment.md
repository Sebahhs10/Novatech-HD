---
name: "ops(infra): Automatización de aprovisionamiento en GCP con Terraform y Docker"
about: Tarea para aprovisionamiento de infraestructura en la nube con Terraform y contenedorización
title: "ops(infra): Automatización de aprovisionamiento en GCP con Terraform y Docker"
labels: "devops, infrastructure, gcp"
assignees: ""
---

### 📋 Descripción / User Story
**Como** Ingeniero DevOps del equipo Novatech-HD,  
**Quiero** aprovisionar la infraestructura base en Google Cloud Platform mediante Terraform y desplegar la imagen Docker en Google Cloud Run / Compute Engine,  
**Para** tener un entorno de staging/producción reproducible, escalable y codificado como infraestructura (IaC).

---

### 🎯 Criterios de Aceptación (Definition of Done)
- [ ] El archivo `terraform.tf` define de forma declarativa el proveedor de GCP (`google`), la red VPC y la instancia de cómputo/Cloud Run.
- [ ] El contenedor construido a partir de `Dockerfile` pasa exitosamente las pruebas de salud (`curl -s http://localhost:8080`).
- [ ] La configuración no expone secretos, claves o credenciales de cuentas de servicio en texto plano.
- [ ] El script de despliegue `scripts/deploy.ps1` ejecuta `terraform plan` y `terraform apply` de forma idempotente.

---

### 🛠️ Tareas Técnicas
1. Configurar variables de entorno y Service Account en `terraform.tf`.
2. Validar sintaxis con `terraform validate` y `terraform fmt`.
3. Integrar la verificación del contenedor Docker en el pipeline de GitHub Actions.
