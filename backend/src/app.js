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
            <ul style="line-height: 1.8;">
                <li>🟢 <b>GET /api/health</b>: Verifica el estado del servidor y conexión a PostgreSQL.</li>
                <li>🟢 <b>GET /api/lawyers</b>: Listado de abogados, sus especialidades y días de atención activos.</li>
                <li>🟢 <b>GET /api/availability</b>: Obtiene turnos libres. <br><i>(Ej: /api/availability?lawyer_id=1&date=2026-05-10&timezone=America/Argentina/Buenos_Aires)</i></li>
                <li>🔵 <b>POST /api/book</b>: Checkout transaccional para registrar cita. <br><i>(Requiere Body: { lawyer_id, client_id, start_time_utc, end_time_utc, tipo })</i></li>
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
