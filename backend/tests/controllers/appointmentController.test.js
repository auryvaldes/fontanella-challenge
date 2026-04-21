const appointmentController = require('../../src/controllers/appointmentController');
const appointmentService = require('../../src/services/appointmentService');

jest.mock('../../src/services/appointmentService');

describe('appointmentController', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            query: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('checkAvailability', () => {
        it('should return 400 if missing parameters', async () => {
            await appointmentController.checkAvailability(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
        });

        it('should return 200 and slots if valid', async () => {
            req.query = { lawyer_id: 1, date: '2026-05-10', timezone: 'UTC' };
            const mockSlots = [{ slot_utc: '2026-05-10T10:00:00Z' }];
            appointmentService.getAvailability.mockResolvedValueOnce(mockSlots);

            await appointmentController.checkAvailability(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ slots_habilitados: mockSlots }));
        });
    });

    describe('getLawyers', () => {
        it('should return stringified lawyers on success', async () => {
            const lawyers = [{ id: 1 }];
            appointmentService.getLawyers.mockResolvedValueOnce(lawyers);

            await appointmentController.getLawyers(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(lawyers);
        });
    });
});
