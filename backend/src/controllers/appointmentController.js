// =========================================================================
// CAPA DE CONTROL: APPOINTMENT CONTROLLER
// Lógica de Negocio:
// El Controlador no realiza queries manuales ni conversiones TZ. Funciona como
// el 'Router' o Manager puro: Recibe HTTP Requests del Browser, comprueba que 
// nada grave falte (JSONs malformados), deriva el peso profundo al Servicio,
// y formatea/decora el Output Final con comodidades o links comerciales que
// demanda el negocio.
// =========================================================================

const appointmentService = require('../services/appointmentService'); // Módulo esclavo inyectado en scope global.

// =========================================================================
// ENDPOINT CONTROLLER: LISTAR HORARIOS DISPONIBLES
// Cómo: Interpreta la URL amigable con Queries, pasa por capas base.
// =========================================================================
async function checkAvailability(req, res) {
    try {
        // Rompemos el Query String ej. (/?lawyer_id=1&date=2026-05-10&timezone=Europe/Madrid).
        const { lawyer_id, date, timezone } = req.query; 

        // Chequeos defensivos mínimos "Guard-clauses" a prueba de ataques simplones.
        if (!lawyer_id || !date || !timezone) { 
            return res.status(400).json({ error: "Parám. requeridos incompletos. [lawyer_id, date, timezone]." }); // 400 Bad Request.
        }

        // Bloqueo hasta resolver la alta matemática del servicio.
        const slots = await appointmentService.getAvailability(lawyer_id, date, timezone); 

        // Devolución triunfante.
        res.status(200).json({ // Status Ok standard
            metadata: { request_tz: timezone, input_date: date }, // Retornamos para depuración del browser dev.
            slots_habilitados: slots // El gran payload calculado local.
        });

    } catch (error) {
        console.error("Crashed Control-Availability:", error); 
        res.status(500).json({ error: error.message }); // Error general fatal 500 no contemplado.
    }
}

// =========================================================================
// ENDPOINT CONTROLLER: EFECTUAR RESERVA FINAL ('CHECKOUT' DE HORARIO)
// =========================================================================
async function bookAppointment(req, res) {
    try {
        // En escritura HTTP, recibimos via HTTP POST Body y extraemos propiedades nativas.
        const { lawyer_id, client_id, start_time_utc, end_time_utc, tipo } = req.body; 

        // =====================================================================
        // TRASLAPSO AL SERVICIO (INSERT SEGURO ACID DB)
        // =====================================================================
        const result = await appointmentService.createAppointment(
            lawyer_id, 
            client_id, 
            start_time_utc, 
            end_time_utc, 
            tipo
        ); 

        // =====================================================================
        // DECORACIÓN METADATA 'AZÚCAR EMPRESARIAL' EXIGIDO
        // Lógica Comercial 'Por Qué': 
        // Si pagó / reservó...  ¿dónde se encuentra la persona en 2 dias?
        // =====================================================================
        let metadataInfo = ""; // Cadena condicional de direcciones.
        
        if (tipo === 'PRESENTIAL') { 
            // Para caras físicas...
            metadataInfo = "Sede de Oficinas Fontanella: Av. del Libertador 1234, CABA, Argentina."; // Locación oficial hardcoded o referencial
        } else if (tipo === 'VIDEO') {
            // Un generador temporal de URL para Video Link usando el ID propio de reserva inmutable y un hash.
            metadataInfo = `https://meet.fontanella-legal.com/sala/${result.appointment_id}`; 
        } else if (tipo === 'PHONE') {
            // Orientación textual al UX.
            metadataInfo = "Aguarde la llamada de su asesor el día de la operación desde central.";
        }

        // =====================================================================
        // RETORNO 201 DE ÉXITO RESTFUL COMPLETADO 
        // =====================================================================
        res.status(201).json({                            // 201 avisa una Re-generación exitosa o nuevo record
            status: "RESERVA_CONFIRMADA",                 // Tag de uso de estado front.
            id_transaccion_db: result.appointment_id,     // ID único transaccionado.
            instrucciones_encuentro: metadataInfo,        // Todo el metadata procesado en el if anterior.
            estado_interno: result.estado                 // Por default 'SCHEDULED_OK' que Oracle disparó local.
        });

    } catch (error) {
        // =====================================================================
        // PATRÓN DE INTERCEPTACIÓN A LA MEDIDA 
        // Lógica de negocio si se pisaron los dos usuarios usando la app simultáneos
        // =====================================================================
        if (error.message.includes("DOBLE_RESERVA")) { 
             return res.status(409).json({ error: "Horario Conflictivo. Alguien más ocupó esta reserva escasos instantes atrás.", log: error.message }); // Status de conflicto (HTTP 409).
        } // En caso que no sea 409...
        
        res.status(500).json({ error: "Fallo fatal DB.", dump: error.message }); // Log interno para administrador.
    }
}

async function getLawyers(req, res) {
    try {
        const lawyers = await appointmentService.getLawyers();
        res.status(200).json(lawyers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Exportamos Múltiple 
module.exports = {
   checkAvailability, 
   bookAppointment,
   getLawyers
};
