const { Pool } = require('pg');

let pool;

async function initialize() {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Pool de PostgreSQL Inicializado exitosamente.');
    } catch (err) {
        console.error('🔥 Falla Crítica inicializando PostgreSQL:', err);
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('El Pool de PostgreSQL no ha sido inicializado.');
    }
    return pool;
}

module.exports = {
    initialize,
    getPool
};
