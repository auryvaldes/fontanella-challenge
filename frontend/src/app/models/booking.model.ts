// =========================================================================
// MODELOS DE DATOS: BOOKING MODELS
// Lógica de UX (Por Qué):
// Definir interfaces tipadas nos permite prevenir errores al conectar el 
// FronEnd con el BackEnd. Garantizamos que el calendario sabrá exactamente 
// qué datos esperar de Node.js (como el 'display_time_client') y qué 
// empaquetar cuando hagamos un POST de reserva.
// =========================================================================

export interface AvailabilitySlot {
  slot_utc: string; // Fecha cruda universal necesaria para la transacción final.
  display_time_client: string; // Ej: "03:00 PM" renderizado para el UX local del usuario.
}

export interface AvailabilityResponse {
  metadata: { request_tz: string; input_date: string }; // Datos de rastreo de conexión.
  slots_habilitados: AvailabilitySlot[]; // El Array con la data dura del calendario.
}

export interface BookingRequest {
  lawyer_id: number; // Abogado al que le compramos el slot.
  client_id: number; // Identificador en sesión del paciente/cliente.
  start_time_utc: string; // Marca de tiempo.
  end_time_utc: string; // Marca de tiempo final teórica (ej. 30 u 60 mins extra).
  tipo: 'PRESENTIAL' | 'VIDEO' | 'PHONE'; // Enum estricto para modalidades de negocio.
}

export interface BookingResponse {
  status: string; // Bandera verde.
  id_transaccion_db: number; // ID autogenerado.
  instrucciones_encuentro: string; // El metadata invaluable con el link Zoom o la Dirección física para mostrar en Pop-up de éxito.
}
