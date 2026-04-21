# Fontanella Challenge - Backend

Este es el backend del proyecto **Fontanella Challenge**, desarrollado en Node.js utilizando Express y conectado a una base de datos PostgreSQL.

## Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución.
- **Express**: Framework web para la creación de la API REST.
- **PostgreSQL (`pg`)**: Cliente de base de datos para la conexión con PostgreSQL.
- **Luxon**: Librería para el manejo avanzado de fechas y zonas horarias (Time Zones).
- **Jest & Supertest**: Frameworks utilizados para las pruebas unitarias y de integración.

## Requisitos Previos
- **Node.js** (v18 o superior recomendado)
- **PostgreSQL** (asegúrate de que la base de datos esté inicializada, revisa la documentación en la carpeta `database/`)

## Configuración del Entorno
1. Copia el archivo `.env.example` y renómbralo a `.env`.
2. Completa las variables de entorno con las credenciales de tu base de datos PostgreSQL:
   ```env
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fontanella_db
   PORT=3000
   ```

## Instalación y Ejecución

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Ejecuta el servidor:
   ```bash
   npm start
   ```
   El servidor se iniciará y estará escuchando peticiones (por defecto en `http://localhost:3000`).

## Pruebas
Para ejecutar la suite de pruebas automatizadas:
```bash
npm test
```
