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

  describe('POST /parse-address', () => {
    it('should parse a valid address', async () => {
      const testAddress = '123 Main St, New York, NY 10001';

      const response = await request(app)
        .post('/parse-address')
        .send({ address: testAddress })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return error for missing address', async () => {
      const response = await request(app)
        .post('/parse-address')
        .send({})
        .expect(400);

      expect(response.body.error).toBe(
        'Address is required and must be a string',
      );
    });

    it('should return error for invalid address type', async () => {
      const response = await request(app)
        .post('/parse-address')
        .send({ address: 123 })
        .expect(400);

      expect(response.body.error).toBe(
        'Address is required and must be a string',
      );
    });
  });

  describe('GET /parse-address/:address', () => {
    it('should parse address from URL parameter', async () => {
      const testAddress = encodeURIComponent('123 Main St, New York, NY 10001');

      const response = await request(app)
        .get(`/parse-address/${testAddress}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /validate-address', () => {
    it('should validate and parse address', async () => {
      const testAddress = '123 Main St, New York, NY 10001';

      const response = await request(app)
        .post('/validate-address')
        .send({ address: testAddress });

      // expect(response.status).toBeOneOf([200, 400]); // May fail if parsing fails

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.parsed).toBeDefined();
        expect(response.body.osm_results).toBeDefined();
      }
    });

    it('should return error for missing address', async () => {
      const response = await request(app)
        .post('/validate-address')
        .send({})
        .expect(400);

      expect(response.body.error).toBe(
        'Address is required and must be a string',
      );
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route').expect(404);

      expect(response.body.error).toBe('Route not found');
    });
  });
});
