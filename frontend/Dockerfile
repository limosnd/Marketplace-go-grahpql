# Etapa 1: Build del proyecto Angular SSR
FROM node:22 AS build
WORKDIR /app

# Copiar dependencias
COPY marketplace/package*.json ./marketplace/
WORKDIR /app/marketplace
RUN npm install

# Copiar el resto del código Angular
COPY marketplace/ ./ 

# Compilar Angular SSR
RUN npm run build

# Etapa 2: Ejecutar el servidor SSR
FROM node:22
WORKDIR /app/marketplace

# Copiar el build desde la etapa anterior
COPY --from=build /app/marketplace/dist ./dist
COPY --from=build /app/marketplace/package*.json ./

# Instalar dependencias necesarias para producción
RUN npm install --omit=dev

EXPOSE 4000
CMD ["node", "dist/marketplace/server/server.mjs"]
