import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { BookingRequest } from '../models/booking.model';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch lawyers', () => {
    const dummyLawyers = [{ id: 1, nombre: 'Ana' }];

    service.getLawyers().subscribe(lawyers => {
      expect(lawyers.length).toBe(1);
      expect(lawyers).toEqual(dummyLawyers);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/lawyers');
    expect(req.request.method).toBe('GET');
    req.flush(dummyLawyers);
  });

  it('should get availability', () => {
    const dummyResponse = { metadata: {request_tz: 'UTC', input_date: '2026-05-10'}, slots_habilitados: [] };
    
    // Stub timezone
    spyOn(service, 'getClientTimezone').and.returnValue('UTC');

    service.getAvailability(1, '2026-05-10').subscribe(res => {
      expect(res).toEqual(dummyResponse as any);
    });

    const req = httpMock.expectOne(request => request.url === 'http://localhost:3000/api/availability');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('lawyer_id')).toBe('1');
    expect(req.request.params.get('date')).toBe('2026-05-10');
    req.flush(dummyResponse);
  });

  it('should book an appointment', () => {
    const payload: BookingRequest = { 
        lawyer_id: 1, 
        client_id: 1, 
        start_time_utc: '2026-05-10T10:00:00Z', 
        end_time_utc: '2026-05-10T11:00:00Z', 
        tipo: 'VIDEO' 
    };
    const dummyResponse = { status: 'RESERVA_CONFIRMADA', id_transaccion_db: 123, instrucciones_encuentro: 'test' };

    service.bookAppointment(payload).subscribe(res => {
      expect(res).toEqual(dummyResponse as any);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/book');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(dummyResponse);
  });
});
