const db = require('../config/db'); // Referencia general al pool de PG
const { DateTime } = require('luxon');

async function getAvailability(lawyer_id, dateStr, client_timezone) {
    const clientStartOfDay = DateTime.fromISO(dateStr, { zone: client_timezone }).startOf('day'); 
    const clientEndOfDay = clientStartOfDay.endOf('day');
    const startUtc = clientStartOfDay.toUTC().toISO(); 
    const endUtc = clientEndOfDay.toUTC().toISO();    

    const apptsQuery = `
        SELECT start_time, end_time 
        FROM appointments 
        WHERE lawyer_id = $1
          AND estado IN ('SCHEDULED') 
          AND start_time >= $2::timestamptz
          AND start_time <= $3::timestamptz
    `;
    const apptsResult = await db.getPool().query(apptsQuery, [lawyer_id, startUtc, endUtc]);
    const occupiedSlots = apptsResult.rows;

    const availQuery = `
        SELECT hora_inicio, hora_fin 
        FROM availability_slots 
        WHERE lawyer_id = $1
           AND dia_semana = $2
    `;
    const isoWeekday = clientStartOfDay.weekday; 
    const availResult = await db.getPool().query(availQuery, [lawyer_id, isoWeekday]);
    const masterSlots = availResult.rows; 

    const availableOptions = []; 
    for (const slot of masterSlots) {
        const simulatedStartUtc = DateTime.fromJSDate(slot.hora_inicio).toUTC(); 
        
        let isOccupied = false; 
        for (const occ of occupiedSlots) {
             const occStart = DateTime.fromJSDate(occ.start_time).toUTC(); 
             if (occStart.toISOTime() === simulatedStartUtc.toISOTime()) { 
                 isOccupied = true; 
                 break;             
             }
        }
        
        if (!isOccupied) {
            // Combinar la "Fecha solicitada" con la "Hora real de la DB" para saltar del 1970 teórico al presente.
            const requestedDayUtc = startUtc.split('T')[0]; 
            const slotTimeUtc = simulatedStartUtc.toISOTime(); 
            const combinedUtc = DateTime.fromISO(`${requestedDayUtc}T${slotTimeUtc}`, { zone: 'utc' });

            availableOptions.push({
                slot_utc: combinedUtc.toISO(), 
                display_time_client: combinedUtc.setZone(client_timezone).toFormat('hh:mm a') 
            }); 
        }
    }
    return availableOptions; 
}

async function createAppointment(lawyer_id, client_id, start_time_utc, end_time_utc, tipo) {
    const doubleBookingQuery = `
        SELECT COUNT(1) AS colisiones 
        FROM appointments 
        WHERE lawyer_id = $1
           AND estado != 'CANCELED' 
           AND (
               (start_time < $3::timestamptz AND end_time > $2::timestamptz)
           )
    `; 
    const checkResult = await db.getPool().query(doubleBookingQuery, [lawyer_id, start_time_utc, end_time_utc]); 
    
    // In PostgreSQL COUNT() returns a string (like '0' or '1')
    if (Number(checkResult.rows[0].colisiones) > 0) { 
        throw new Error("DOBLE_RESERVA: El horario está doblemente agendado."); 
    }

    const insertQuery = `
        INSERT INTO appointments (lawyer_id, client_id, start_time, end_time, tipo, estado) 
        VALUES ($1, $2, $3::timestamptz, $4::timestamptz, $5, 'SCHEDULED')
        RETURNING id, estado
    `; 
    const result = await db.getPool().query(insertQuery, [lawyer_id, client_id, start_time_utc, end_time_utc, tipo]);
    
    return {
        appointment_id: result.rows[0].id,        
        estado: result.rows[0].estado,            
    };
}

async function getLawyers() {
    const query = `
        SELECT l.id, l.nombre, l.especialidad, l.zona_horaria, 
               COALESCE(array_agg(DISTINCT a.dia_semana) FILTER (WHERE a.dia_semana IS NOT NULL), '{}') as working_days
        FROM lawyers l
        LEFT JOIN availability_slots a ON l.id = a.lawyer_id
        GROUP BY l.id, l.nombre, l.especialidad, l.zona_horaria
        ORDER BY l.id ASC
    `;
    const result = await db.getPool().query(query);
    return result.rows;
}

module.exports = {
   getAvailability,
   createAppointment,
   getLawyers
};
