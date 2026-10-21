FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# Incluye todas las vistas HTML (dashboard, login, inventario y pedidos)
COPY ./*.html ./
COPY style.css ./style.css
COPY script.js ./script.js
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
