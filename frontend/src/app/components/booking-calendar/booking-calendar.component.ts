// =========================================================================
// COMPONENTE: BOOKING CALENDAR (LOGIC)
// Lógica de UX (Por Qué):
// Un componente inteligente (Smart Component). Une la UI con el cerebro de
// datos. Reacciona a cuando un paciente elige un "Día", detona carga (Spinners)
// para relajar la ansiedad, procesa la data y abre Modales defensivos de 
// confirmación para que no reserven cosas "sin querer" con un click falso.
// =========================================================================

import { Component, OnInit } from '@angular/core'; // Primitivas de Angular Framework (Decorador y Lifecycle Hook).
import { BookingService } from '../../services/booking.service'; // Conexión a la bomba de datos HTTP custom externa.
import { AvailabilitySlot, BookingRequest } from '../../models/booking.model'; // Moldeos estrictos de los datos a fluir en memoria local.
import { CommonModule } from '@angular/common'; // Agregador nativo de utilidades *ngIf / *ngFor.
import { FormsModule } from '@angular/forms'; // Módulo de banana-box [(ngModel)] para capturar entradas de inputs html (Datepicker/Selects).

@Component({
  selector: 'app-booking-calendar', // Etiqueta HTML con la que se inyectará este componente (<app-booking-calendar></app-booking-calendar>).
  standalone: true, // Angular Nativo 14+: No necesita ngModule global pesado. Se empaqueta atómicamente.
  imports: [CommonModule, FormsModule], // Declara dependencias exclusivas para su scope.
  templateUrl: './booking-calendar.component.html' // Llama al template separado de HTML (Tailwind).
})
export class BookingCalendarComponent implements OnInit {

  // =========================================================================
  // ESTADOS DE LA UI (Signal Flags)
  // Controlan qué partes del HTML reaccionan y cambian de forma (Hide/Show, Spinners).
  // =========================================================================
  selectedDate: string = ''; // Recibe via input el '2026-06-01'
  availableSlots: AvailabilitySlot[] = []; // Contenedor vacío donde volcar el Array del servidor de Node.
  isLoading: boolean = false; // Flag para activar la ruedita de carga y desactivar clicks prematuros.
  errorMessage: string | null = null; // String tóxico: Si se llena, se muestra banner rojo en UX.
  successMessage: string | null = null; // String amigable: Muestra Link de Zoom.

  // Variables de Modal de Reserva (checkout)
  isModalOpen: boolean = false; // Frena visual natural.
  selectedSlot: AvailabilitySlot | null = null; // Aísla el turno a comprar en memoria.
  selectedType: 'PRESENTIAL' | 'VIDEO' | 'PHONE' = 'VIDEO'; // Por default se alienta a remota.

  // Estados de Abogado
  lawyers: any[] = [];
  selectedLawyerId: number = 1; // Default a 1 o al primero

  constructor(private bookingService: BookingService) { } // DI: Recibir motor RxJs.

  ngOnInit(): void {
    // Definimos una fecha base Default (UX amigable para no ver calendario vacío primer frame).
    const today = new Date(); // Objeto fecha crudo de la pc base.
    this.selectedDate = today.toISOString().split('T')[0]; // Parsea brutalmente al standard que nuestra BD espera "yyyy-mm-dd".
    
    // Primero cargamos los abogados y luego consultamos el primero por defecto.
    this.bookingService.getLawyers().subscribe({
      next: (data) => {
        this.lawyers = data;
        if (this.lawyers.length > 0) {
           this.selectedLawyerId = this.lawyers[0].id;
        }
        this.fetchSlots(); 
      }
    });
  }

  // =========================================================================
  // DETONADOR PRINCIPAL: AL CAMBIAR DE DÍA EN CALENDARIO
  // =========================================================================
  fetchSlots(): void {
    if (!this.selectedDate) return; // Guard-Clause anti clicks nulos que pudren la URL.

    this.isLoading = true; // Empieza ruedita interactiva FrontEnd limitando botones.
    this.errorMessage = null; // Limpia fallos antiguos al re-intentar navegación.
    this.successMessage = null; // Limpia modales pasados de confirmación.

    // Nos suscribimos a cañería asíncrona del Backend Express/Oracle.
    this.bookingService.getAvailability(this.selectedLawyerId, this.selectedDate).subscribe({
      next: (response) => {
        // En caso verde Restful 200..
        this.availableSlots = response.slots_habilitados; // Guardamos variable reactiva local.
        this.isLoading = false; // Matamos carga. (DOM Re-Renders)
      },
      error: (err) => {
        // En caso rojo Server/Network..
        this.errorMessage = err.message; // Propagamos alerta.
        this.isLoading = false; // Matamos carga.
      }
    });
  }

  // =========================================================================
  // FLUJOS DEL DOM MODAL
  // =========================================================================
  openBookingModal(slot: AvailabilitySlot) {
    this.selectedSlot = slot; // Reservar el horario elegido.
    this.isModalOpen = true;  // Detonar la cortina negra css.
  }

  closeModal() {
    this.isModalOpen = false; // Cerrar cortina.
    this.selectedSlot = null; // Purgar cache memory.
  }

  // =========================================================================
  // EVENTO FINAL: DISPARAR TRANSACCIÓN (CHECKOUT ACID ORACLE)
  // =========================================================================
  confirmBooking() {
    if (!this.selectedSlot) return; // Validación interna paranoica.

    this.isLoading = true; // Activa spinner del botón CONFIRMAR para evitar multi-clicks del ansioso y romper DB.

    // Acomodar datos para matchar Modelo de Node/Oracle.
    const payload: BookingRequest = {
      lawyer_id: this.selectedLawyerId, 
      client_id: 1, // ¡AQUÍ ESTABA EL ERROR! Cliente Dummy con ID 1 que es el único real en DB.
      start_time_utc: this.selectedSlot.slot_utc, // Mandar Crudo universal.
      
      // Armamos límite teório (ej: Media hora despues del start).
      // En prod, luxon sumaria 30 mins, hoy engañamos string a nivel prototipo.
      end_time_utc: this.selectedSlot.slot_utc.replace('00.000Z', '30.000Z'), 
      
      tipo: this.selectedType // El select del combobox "Phone" o "Video" bidireccionalizado (ngModel).
    };

    // Subir peticion final destructiva.
    this.bookingService.bookAppointment(payload).subscribe({
      next: (res) => {
        // Se comiteó exitosamente la fila transaccional de Oracle.
        this.isLoading = false;
        this.closeModal(); // Chau ventana intermedia.
        this.successMessage = res.instrucciones_encuentro; // Magia UX ("Te enviamos un zoom, etc...")
        this.fetchSlots(); // RE-CARGAR grilla de hoy para que el turno desaparezca dinámicamente frente a ojos!.
      },
      error: (err) => {
        this.isLoading = false; 
        this.closeModal(); 
        this.errorMessage = err.message; // Transponer 409 Double-Booking a Toast de terror UX.
      }
    });
  }
}
