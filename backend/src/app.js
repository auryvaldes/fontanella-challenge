// =========================================================================
// SERVIDOR BASE: EXPRESS.JS (APP.JS) POSTGRESQL VERSION
// =========================================================================
const express = require('express'); 
const cors = require('cors');       
const dotenv = require('dotenv');   
const db = require('./config/db');  

dotenv.config();                    

const app = express();              
const PORT = process.env.PORT || 3000; 

app.use(cors());                    
app.use(express.json());            

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api', appointmentRoutes);

app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem;">
            <h1>Backend de Fontanella Activo 🚀</h1>
            <p>Este es el microservicio API REST para el Challenge.</p>
            <h2>Rutas de la API (Endpoints)</h2>
            <ul style="line-height: 2;">
                <li>🟢 <b><a href="/api/health" target="_blank" style="color: #2563eb; text-decoration: none; border-bottom: 1px dotted #2563eb;">GET /api/health</a></b>: Verifica el estado del servidor y conexión a PostgreSQL.</li>
                <li>🟢 <b><a href="/api/lawyers" target="_blank" style="color: #2563eb; text-decoration: none; border-bottom: 1px dotted #2563eb;">GET /api/lawyers</a></b>: Listado de abogados, sus especialidades y días de atención activos.</li>
                <li>🟢 <b><a href="/api/availability?lawyer_id=1&date=2026-05-10&timezone=America/Argentina/Buenos_Aires" target="_blank" style="color: #2563eb; text-decoration: none; border-bottom: 1px dotted #2563eb;">GET /api/availability</a></b>: Obtiene turnos libres. <br><span style="color: #4b5563; font-size: 0.9em;">(☝️ Click para ver un ejemplo de disponibilidad para el 10 de Mayo de 2026 en Buenos Aires)</span></li>
                <li>🔵 <b style="color: #475569;">POST /api/book</b>: Checkout transaccional para registrar cita. <br><span style="color: #4b5563; font-size: 0.9em;">(Requiere Body JSON: <code>{ "lawyer_id": 1, "client_id": 1, "start_time_utc": "2026-05-10T14:00:00.000Z", "end_time_utc": "2026-05-10T14:30:00.000Z", "tipo": "VIDEO" }</code>)</span></li>
            </ul>
            <hr style="margin-top: 2rem;">
            <p>Para interactuar visualmente, <a href="https://fontanella-challenge.netlify.app/">ingresa al Frontend desplegado en Netlify</a>.</p>
        </div>
    `);
});

app.get('/api/health', async (req, res) => {
    try {
        const result = await db.getPool().query(`SELECT 'Base de Datos Fontanella PG Operativa' AS STATUS`); 
        res.status(200).json({
            status: 'VIVO',                           
            message: 'API activa HTTP y conectada', 
            db_status: result.rows[0].status        
        });
    } catch (error) {
        console.error("📛 Alarma Crítica en Health Check DB:", error);
        res.status(500).json({ status: 'ERROR', message: 'Falla Base Datos', info: error.message });
    }
});

async function startServer() {
    try {
        await db.initialize(); 
        app.listen(PORT, () => {
            console.log(`🚀 Sistema Backend en puerto http://localhost:${PORT}`);      
            console.log(`🩺 Health Cheack disponible en HTTP GET /api/health`); 
        });
    } catch (err) {
        console.error("🔥 Abortando Encendido. El núcleo PostgreSQL no superó pruebas iniciales.", err); 
        process.exit(1); 
    }
}

startServer(); 
