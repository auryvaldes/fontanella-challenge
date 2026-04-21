# Fontanella Challenge - Frontend

Esta es la aplicación web cliente del proyecto **Fontanella Challenge**, desarrollada con **Angular 17** y estilizada con **Tailwind CSS**.

## Tecnologías Utilizadas
- **Angular 17**: Framework principal utilizado para la interfaz de usuario.
- **Tailwind CSS**: Framework de CSS de utilidades para un diseño responsivo, rápido y moderno.
- **Jasmine & Karma**: Entorno para la ejecución de pruebas unitarias.

## Requisitos Previos
- **Node.js** (v18 o superior recomendado)
- **Angular CLI** (opcional pero recomendado instalar globalmente: `npm install -g @angular/cli`)

## Instalación y Ejecución

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Levanta el servidor de desarrollo:
   ```bash
   npm start
   ```
   *(Este comando ejecuta internamente `ng serve`).*

3. Abre tu navegador y navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si realizas cambios en el código fuente.

## Construcción (Build)

Para compilar el proyecto para un entorno de producción:
```bash
npm run build
```
Los archivos optimizados y listos para despliegue se guardarán en el directorio `dist/`.

## Pruebas

Para ejecutar las pruebas unitarias configuradas:
```bash
npm test
```
