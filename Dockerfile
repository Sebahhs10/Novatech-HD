FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Incluye todas las vistas HTML (dashboard, login, inventario, pedidos e incidencias)
COPY ./*.html ./
COPY style.css ./style.css
COPY script.js ./script.js
COPY incidencias.js ./incidencias.js

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
