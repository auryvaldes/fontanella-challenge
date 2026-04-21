// =========================================================================
// RUTAS DE LA API (ROUTING)
// Lógica Comercial: Agrupamos las responsabilidades aisladas de endpoints.
// =========================================================================
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Enrutamos 'GET /api/availability' hacia la lógica de consulta del controlador.
router.get('/availability', appointmentController.checkAvailability);

// Enrutamos 'GET /api/lawyers' para listar abogados.
router.get('/lawyers', appointmentController.getLawyers);

// Enrutamos 'POST /api/book' para la transacción de reserva.
router.post('/book', appointmentController.bookAppointment);

module.exports = router;
