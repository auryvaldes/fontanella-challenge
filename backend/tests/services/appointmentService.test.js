const appointmentService = require('../../src/services/appointmentService');
const db = require('../../src/config/db');

jest.mock('../../src/config/db', () => ({
    getPool: jest.fn().mockReturnValue({
        query: jest.fn()
    })
}));

describe('appointmentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getLawyers', () => {
        it('should return a list of lawyers', async () => {
            const mockLawyers = [{ id: 1, nombre: 'Ana Fontanella' }];
            db.getPool().query.mockResolvedValueOnce({ rows: mockLawyers });

            const result = await appointmentService.getLawyers();
            expect(result).toEqual(mockLawyers);
            expect(db.getPool().query).toHaveBeenCalledWith(expect.stringContaining('SELECT l.id, l.nombre, l.especialidad, l.zona_horaria'));
        });
    });

    describe('createAppointment', () => {
        it('should throw an error if double booking', async () => {
            db.getPool().query.mockResolvedValueOnce({ rows: [{ colisiones: '1' }] });
            
            await expect(appointmentService.createAppointment(1, 1, '2026-05-10T10:00:00Z', '2026-05-10T11:00:00Z', 'VIDEO'))
                .rejects.toThrow('DOBLE_RESERVA: El horario está doblemente agendado.');
        });

        it('should create an appointment successfully', async () => {
            db.getPool().query
                .mockResolvedValueOnce({ rows: [{ colisiones: '0' }] }) 
                .mockResolvedValueOnce({ rows: [{ id: 123, estado: 'SCHEDULED' }] });

            const result = await appointmentService.createAppointment(1, 1, '2026-05-10T10:00:00Z', '2026-05-10T11:00:00Z', 'VIDEO');
            expect(result.appointment_id).toBe(123);
            expect(result.estado).toBe('SCHEDULED');
        });
    });
});
