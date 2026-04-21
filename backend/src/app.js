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
    res.send("<h1>Backend de Fontanella Activo 🚀</h1><p>Por favor abre el Frontend en http://localhost:4200</p>");
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
