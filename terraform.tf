# terraform.tf
# Propuesta de Infraestructura como Código (IaC) para NovaTech S.A.C.
# Herramienta: Terraform
# Proveedor: AWS (Amazon Web Services)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ============================================
# VARIABLES DE CONFIGURACIÓN
# ============================================

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Región de AWS donde se aprovisionarán los recursos de NovaTech"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Ambiente de despliegue (production, staging, dev)"
}

variable "project_name" {
  type        = string
  default     = "novatech-devops"
  description = "Nombre del proyecto empresarial"
}

variable "instance_type" {
  type        = string
  default     = "t2.micro"
  description = "Tipo de instancia EC2 (elegible para capa gratuita de AWS)"
}

variable "ami_id" {
  type        = string
  default     = "ami-0c101f26f147fa7fd"
  description = "AMI vigente para Amazon Linux 2023 (AMI oficial en us-east-1)"
}

variable "ssh_cidr" {
  type        = list(string)
  default     = ["190.237.0.0/16"]
  description = "Rango CIDR autorizado para acceso administrativo SSH. NUNCA usar 0.0.0.0/0 en producción por seguridad."
  
  validation {
    condition     = !contains(var.ssh_cidr, "0.0.0.0/0")
    error_message = "Por política de seguridad DevOps, SSH (puerto 22) no puede estar expuesto a 0.0.0.0/0."
  }
}

# ============================================
# CONFIGURACIÓN DEL PROVEEDOR
# ============================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Course      = "Herramientas de Desarrollo"
    }
  }
}

# ============================================
# RECURSOS DE RED Y SEGURIDAD
# ============================================

# Grupo de seguridad para el servidor web NovaTech
resource "aws_security_group" "novatech_sg" {
  name_prefix = "${var.project_name}-sg-"
  description = "Grupo de seguridad con politicas restrictivas para NovaTech S.A.C."

  # Acceso administrativo SSH: restringido exclusivamente a la red de administradores
  ingress {
    description = "Acceso administrativo SSH seguro"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidr
  }

  # Acceso web público HTTP
  ingress {
    description = "Trafico web HTTP publico para portal de pedidos"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Acceso web seguro HTTPS (preparado para SSL/TLS futuro)
  ingress {
    description = "Trafico web HTTPS seguro"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida de red abierta para descargas y actualizaciones de paquetes
  egress {
    description = "Permitir todo el trafico de salida"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# ============================================
# RECURSOS DE CÓMPUTO
# ============================================

# Instancia EC2 para la aplicación contenerizada NovaTech
resource "aws_instance" "novatech_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.novatech_sg.id]

  # Automatización de aprovisionamiento en arranque (Amazon Linux 2023)
  user_data = <<-EOF
    #!/bin/bash
    set -e
    echo "=== INICIANDO INSTALACION AUTOMATICA NOVATECH ==="
    
    # Actualizar paquetes del sistema
    dnf update -y
    
    # Instalar Docker y Git
    dnf install -y docker git
    
    # Iniciar y habilitar servicio Docker
    systemctl start docker
    systemctl enable docker
    
    # Dar permisos al usuario ec2-user
    usermod -a -G docker ec2-user
    
    # Clonar repositorio de la empresa
    cd /home/ec2-user
    git clone https://github.com/Sebahhs10/Novatech-HD.git || true
    
    # Desplegar version inicial contenerizada
    cd Novatech-HD
    docker build -t novatech:latest .
    docker run -d -p 80:80 --name novatech-web --restart always novatech:latest
    
    echo "=== DESPLIEGUE INICIAL NOVATECH FINALIZADO ==="
  EOF

  tags = {
    Name = "${var.project_name}-server"
  }
}

# ============================================
# SALIDAS (OUTPUTS)
# ============================================

output "instance_id" {
  description = "Identificador unico de la instancia EC2"
  value       = aws_instance.novatech_server.id
}

output "instance_public_ip" {
  description = "Direccion IP publica del servidor en AWS"
  value       = aws_instance.novatech_server.public_ip
}

output "application_url" {
  description = "URL publica para acceder al portal web NovaTech"
  value       = "http://${aws_instance.novatech_server.public_ip}"
}

output "security_group_id" {
  description = "Identificador del grupo de seguridad configurado"
  value       = aws_security_group.novatech_sg.id
}
