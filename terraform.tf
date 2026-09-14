# terraform.tf
# Propuesta de Infraestructura como Código para NovaTech S.A.C.
# Herramienta: Terraform
# Proveedor: AWS

# ============================================
# CONFIGURACIÓN DEL PROVEEDOR
# ============================================
provider "aws" {
  region = "us-east-1"
}

# ============================================
# RECURSOS DE RED
# ============================================

# Grupo de seguridad para la instancia
resource "aws_security_group" "novatech_sg" {
  name_prefix = "novatech-sg"
  description = "Seguridad para servidor NovaTech"
  
  # Permitir SSH (acceso administrativo)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }
  
  # Permitir HTTP (aplicación web)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }
  
  # Permitir HTTPS (para futuro)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }
  
  # Tráfico de salida permitido
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "novatech-sg"
    Environment = "production"
    Project     = "novatech-devops"
  }
}

# ============================================
# RECURSOS DE CÓMPUTO
# ============================================

# Instancia EC2 para la aplicación NovaTech
resource "aws_instance" "novatech_server" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2
  instance_type = "t2.micro"
  
  # Asociar el grupo de seguridad
  vpc_security_group_ids = [aws_security_group.novatech_sg.id]
  
  # Script de automatización al iniciar
  user_data = <<-EOF
    #!/bin/bash
    echo "=== INICIANDO CONFIGURACIÓN DE NOVATECH ==="
    
    # Actualizar sistema
    yum update -y
    
    # Instalar Docker y Git
    yum install -y docker git
    
    # Iniciar Docker
    service docker start
    
    # Agregar usuario ec2-user al grupo docker
    usermod -a -G docker ec2-user
    
    # Clonar repositorio
    cd /home/ec2-user
    git clone https://github.com/WhariCDH/novatech-devops.git
    
    # Construir imagen Docker
    cd novatech-devops
    docker build -t novatech:latest .
    
    # Ejecutar contenedor
    docker run -d -p 80:80 --name novatech-web --restart always novatech:latest
    
    echo "=== NOVATECH DESPLEGADO CORRECTAMENTE ==="
  EOF
  
  tags = {
    Name        = "novatech-server"
    Environment = "production"
    Project     = "novatech-devops"
    ManagedBy   = "Terraform"
  }
}

# ============================================
# SALIDAS (OUTPUTS)
# ============================================

# IP pública de la instancia
output "instance_public_ip" {
  value       = aws_instance.novatech_server.public_ip
  description = "IP pública para acceder a NovaTech"
}

# URL de la aplicación
output "application_url" {
  value       = "http://${aws_instance.novatech_server.public_ip}"
  description = "URL de la aplicación NovaTech"
}

# ID de la instancia
output "instance_id" {
  value       = aws_instance.novatech_server.id
  description = "ID de la instancia EC2"
}