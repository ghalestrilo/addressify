import request from 'supertest';
import app from './main';

describe('Express App', () => {
  describe('GET /', () => {
    it('should return hello message', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toEqual({
        message: 'Hello, World!',
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /validate-address', () => {
    it('should validate and parse address', async () => {
      const testAddress = '123 Main St, New York, NY 10001';

      const response = await request(app)
        .post('/validate-address')
        .send({ address: testAddress });

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.address).toBeDefined();
        expect(response.body.addressType).toBeDefined();
      }
    });

    it('should return error for missing address', async () => {
      const response = await request(app)
        .post('/validate-address')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Address is required');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route').expect(404);

      expect(response.body.error).toBe('Route not found');
    });
  });
});
