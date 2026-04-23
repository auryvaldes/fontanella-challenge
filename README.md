# Fontanella Challenge - Sistema de Agendamiento Multi-Zonal

[![CI/CD Pipeline](https://github.com/auryvaldes/fontanella-challenge/actions/workflows/ci.yml/badge.svg)](https://github.com/auryvaldes/fontanella-challenge/actions)

Este repositorio contiene la solución completa al desafío técnico "Fontanella Challenge", un sistema de agendamiento de citas legales que soporta múltiples zonas horarias.

## ⭐ Plus Valorados (Logrados)
Este proyecto cumple con **todos** los requerimientos diferenciales (Plus):
- ✅ **Repositorio público bien documentado**: READMEs detallados en la raíz y en cada subproyecto (`/frontend`, `/backend`, `/database`).
- ✅ **Pipeline de CI/CD**: Integración continua configurada mediante **GitHub Actions** (`.github/workflows/ci.yml`). Ejecuta pruebas automáticas y builds con cada *push*. El despliegue continuo (CD) está conectado automáticamente a Netlify y Render.
- ✅ **Aplicación desplegada**: Entorno 100% online y funcional (Ver sección de enlaces abajo).
- ✅ **Tests automatizados**: Pruebas unitarias implementadas usando **Jest** (Backend) y **Jasmine/Karma** (Frontend).
- ✅ **Documentación técnica**: Arquitectura, esquema de base de datos y decisiones técnicas explicadas detalladamente en este documento.

## 🚀 Aplicación Funcional (Live Demo)
El proyecto se encuentra desplegado y 100% funcional en la nube:
- **Frontend (Aplicación Cliente):** [https://fontanella-challenge.netlify.app/](https://fontanella-challenge.netlify.app/)
- **Backend (API Base):** [https://fontanella-challenge.onrender.com](https://fontanella-challenge.onrender.com)
- **Base de Datos:** Alojada en Neon.tech (PostgreSQL Serverless).

---

## 🏗️ Arquitectura del Sistema
El proyecto está dividido en tres capas principales que garantizan la escalabilidad y el desacoplamiento:

1. **Frontend (Capa de Presentación):** Desarrollado en **Angular 17** utilizando *Standalone Components* para una estructura modular. Estilizado con **Tailwind CSS** para un diseño responsivo y ágil. Está alojado de forma estática en **Netlify**.
2. **Backend (Capa de Negocio / API REST):** Desarrollado en **Node.js** con el framework **Express**. Utiliza la librería **Luxon** para el procesamiento preciso de fechas y *Time Zones*, y **Jest** para las pruebas unitarias. Desplegado en **Render.com**.
3. **Base de Datos (Capa de Persistencia):** Motor **PostgreSQL 17** (migrado desde Oracle para un mejor soporte Cloud), alojado en **Neon.tech**. 

---

## 🧠 Decisiones Técnicas y Razonamiento

1. **Manejo de Zonas Horarias (El núcleo del problema):**
   - **En la Base de Datos:** Se utilizó el tipo de dato `TIMESTAMP WITH TIME ZONE`. Esto garantiza que todas las fechas se guarden internamente en **UTC**, resolviendo de raíz las discrepancias horarias.
   - **En el Backend:** Se utilizó **Luxon** en lugar de Date puro nativo, ya que Luxon es superior manejando conversiones exactas de IANA Time Zones (ej. `America/Argentina/Buenos_Aires` a `Europe/Madrid`). La API siempre expone las disponibilidades al cliente transformadas a la zona horaria del usuario que hace la consulta.
2. **Migración a PostgreSQL:** Inicialmente planificado en Oracle, se optó por migrar a PostgreSQL debido a su excelente integración con servicios en la nube gratuitos (Neon.tech) y su manejo nativo e intuitivo de las zonas horarias, facilitando las demostraciones en vivo sin dependencias pesadas locales.
3. **Desacoplamiento Frontend/Backend:** Permite que diferentes equipos trabajen en paralelo. Al usar servicios como Netlify y Render de manera separada, logramos escalamiento asimétrico (ej. podemos escalar el backend sin tocar el frontend).
4. **Mejora de UX Dinámica:** Se implementó una lógica reactiva en el Frontend que, conectada a una agregación SQL en el Backend (`array_agg` de días habilitados), le muestra instantáneamente al cliente qué días de la semana atiende cada profesional (Ej: "Lunes, Miércoles"). Esto reduce drásticamente la frustración del usuario de tener que "adivinar" fechas en el calendario.
5. **Onboarding Guiado y Estabilidad de UI:** Se añadió un Modal de Ayuda interactivo (con animaciones de atención) para guiar el flujo de usuarios nuevos. Además, se refinó el control del estado reactivo para garantizar que el "Banner de Éxito" permanezca visible tras el refresco automático de turnos luego de una reserva, dándole al usuario confianza absoluta de que su transacción fue procesada.

---

## 🗄️ Modelo de Datos (Esquema)
La base de datos se rige por el siguiente modelo (puedes ver el script completo en `database/init_schema.sql`):

- **`lawyers` (Abogados):** Almacena nombre, especialidad y su *zona horaria específica* (ej. `Europe/Madrid`).
- **`clients` (Clientes):** Registra los datos de contacto de los clientes (nombre, email).
- **`availability_slots` (Disponibilidad Absoluta):** Define las franjas de trabajo genéricas de un abogado (ej. "Los martes de 10:00 a 14:00"). Se guardan como una base de tiempo neutral de 1970 para calcular repeticiones semanales precisas.
- **`appointments` (Citas):** El registro final. Cruza a un cliente con un abogado en una fecha exacta (`start_time` y `end_time` en UTC).

---

## 🛠️ Ejecución Local (Paso a Paso)

Si deseas probar el proyecto en tu máquina local, sigue estas instrucciones:

### 1. Clonar el repositorio
```bash
git clone https://github.com/auryvaldes/fontanella-challenge.git
cd fontanella-challenge
```

### 2. Base de Datos
Debes tener PostgreSQL instalado o usar Docker.
1. Crea una base de datos.
2. Ejecuta el script `database/init_schema.sql` en tu nueva base de datos. Este script creará las tablas e insertará los **datos semilla** necesarios para las pruebas.

### 3. Backend (Node.js)
1. Navega a la carpeta del backend: `cd backend`
2. Instala las dependencias: `npm install`
3. Configuración de Entorno: Crea un archivo `.env` basado en `.env.example` y agrega tus credenciales:
   ```env
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tu_base_de_datos
   PORT=3000
   ```
4. Ejecuta el servidor: `npm run dev` o `npm start`
5. (Opcional) Ejecuta las pruebas: `npm test`

### 4. Frontend (Angular)
1. Abre otra terminal y navega a la carpeta del frontend: `cd frontend`
2. Instala las dependencias: `npm install`
3. (Importante) Asegúrate de que el archivo `src/app/services/booking.service.ts` apunte a tu servidor local cambiando la URL de la API a `http://localhost:3000/api` si deseas probarlo localmente sin usar la API de producción.
4. Levanta el servidor: `npm start`
5. Visita `http://localhost:4200/` en tu navegador.
