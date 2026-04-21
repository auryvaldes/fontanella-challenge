// =========================================================================
// SERVICIO ANGULAR: BOOKING SERVICE
// Lógica de UX (Por Qué):
// Centralizar el tráfico HTTP en un servicio inyectable (Singleton) aísla 
// a los componentes visuales de "Cómo hablar con internet". Si en el futuro
// cambiamos la URL base, solo tocamos este archivo y todo el proyecto se entera.
// =========================================================================

import { Injectable } from '@angular/core'; // Decorador base que habilita Inyección de Dependencias.
import { HttpClient, HttpParams } from '@angular/common/http'; // Módulo asíncrono para Web Requests (Get/Post/Put/Delete).
import { Observable, throwError } from 'rxjs'; // Librería de flujos de datos Reactiva, pilar de Angular.
import { catchError } from 'rxjs/operators'; // Operador de tubería para atrapar fallas de backend y no asustar al usuario.
import { AvailabilityResponse, BookingRequest, BookingResponse } from '../models/booking.model'; // Tipos de contrato definidos previamente.

@Injectable({
  providedIn: 'root' // Patrón Singleton nativo: Toda la app comparte esta única instancia viva del servicio.
})
export class BookingService {
  
  private apiUrl = 'http://localhost:3000/api'; // Dirección del backend de Node.js en desarrollo.

  constructor(private http: HttpClient) { } // DI: El compilador inyecta un proveedor HttpClient preparado para uso interno.

  // =========================================================================
  // DETECCIÓN DE ZONA HORARIA
  // Lógica UX: No hacerle elegir al usuario su país. Javascript puede 
  // leer los settings del sistema operativo y resolverlo automáticamente.
  // =========================================================================
  getClientTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone; // API nativa JS que devuelve ej: 'Europe/Madrid' o 'America/Argentina/Buenos_Aires'.
  }

  // =========================================================================
  // REQUEST LECTURA: GET DISPONIBILIDAD
  // =========================================================================
  getAvailability(lawyerId: number, dateStr: string): Observable<AvailabilityResponse> {
    const tz = this.getClientTimezone(); // Extraemos dinámicamente timezone local para servir a la capa de Node/Luxon.
    
    // Construcción limpia y segura de los Query Params para la URL.
    let params = new HttpParams()
      .set('lawyer_id', lawyerId.toString())
      .set('date', dateStr)    // Ej: "2026-05-15"
      .set('timezone', tz);    // Inyección del dato que nos pidió el DBA backend.

    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/availability`, { params }) // Emite un flujo continuo (Observable).
      .pipe( // El "Pipe" es una cañería para transformar la data o atrapar errores en camino.
        catchError(err => {
          console.error("Fallo de red en obtención de Calendario:", err); // Loggea silenciosamente
          return throwError(() => new Error('Error al conectar con los servidores de reserva.')); // Retransmite error humanizado al Componente Visual.
        })
      );
  }

  // =========================================================================
  // REQUEST ESCRITURA: POST CITA (CHECKOUT)
  // =========================================================================
  bookAppointment(payload: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/book`, payload) 
      .pipe(
        catchError(err => {
            if (err.status === 409) {
                return throwError(() => new Error('Lo sentimos, este turno acaba de ser reservado. Por favor actualice.'));
            }
            return throwError(() => new Error('Error inesperado procesando su reserva.'));
        })
      );
  }

  getLawyers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lawyers`).pipe(
      catchError(err => throwError(() => new Error('Error obteniendo lista de abogados.')))
    );
  }
}
