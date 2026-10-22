# ===============================================
# DOCKERFILE - NOVATECH S.A.C. (FRONTEND + BACKEND)
# ===============================================
FROM node:18-alpine

# Definir directorio de trabajo principal en el contenedor
WORKDIR /app

# Copiar manifiestos de dependencias del backend
COPY backend/package*.json ./backend/

# Instalar dependencias limpias de producción en el backend
WORKDIR /app/backend
RUN npm ci --only=production

# Copiar el código fuente del backend
COPY backend/ ./

# Regresar a la raíz de la app y copiar archivos estáticos del frontend
WORKDIR /app
COPY *.html ./
COPY style.css ./
COPY script.js ./

# Duplicar archivos estáticos en carpeta public para compatibilidad de rutas
RUN mkdir -p /app/public && cp *.html style.css script.js /app/public/

# Configurar variables de entorno por defecto
ENV PORT=3000
ENV NODE_ENV=production

# Exponer el puerto de la aplicación (Backend + Frontend)
EXPOSE 3000

# Directorio de ejecución final
WORKDIR /app/backend

# Comando de inicio del servidor
CMD ["node", "server.js"]
