# CarroCo - Marketplace-go-graphql

## Descripción general

Marketplace cliente-servidor construido con **Go (Golang)**, **GraphQL**, **Angular (SSR)** y **MongoDB**, desplegado mediante **Docker Compose**.  
El objetivo del proyecto es ofrecer una arquitectura moderna y modular para aplicaciones web full-stack.

---

## Autores
Proyecto desarrollado por:
- Laura Isabel Blanco
- Diego Alejandro Jara Rojas

---

## Tecnologías utilizadas

| Componente | Descripción |
|-------------|-------------|
| **Frontend** | Angular 20 con SSR (Server-Side Rendering) |
| **Backend** | Go (Golang) con GraphQL |
| **Base de datos** | MongoDB |
| **Orquestación** | Docker y Docker Compose |

---

## Arquitectura 

- El **frontend Angular SSR** se ejecuta en **Node.js (puerto 4000)**.  
- El **backend en Go** expone su API GraphQL en **puerto 8080**.  
- La **base de datos MongoDB** corre en **puerto 27017**.  
- Todos los servicios se levantan coordinados por **docker-compose**.

---

## Requisitos previos

Asegúrate de tener instalado en tu sistema:

- 🐳 [Docker](https://www.docker.com/)
- 🐙 [Docker Compose](https://docs.docker.com/compose/)
  
---

## Instrucciones de despliegue

1. **Clona el repositorio**

- git clone https://github.com/<tu-usuario>/Marketplace-go-graphql.git
- cd Marketplace-go-graphql

2. **Construye e inicia los contenedores**

- sudo docker compose up -d --build

3. **Verifica que todo esté corriendo**

- docker ps

4. **Accede a la aplicación**

- http://localhost:4000/

