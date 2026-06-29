import request from 'supertest';
import app from '../app.js';

describe('App API', () => {
  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('OK');
  });

  it('GET /api/unknown should return 404', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });
});
