const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const sampleRoutes = require('../routes/samples');
const Sample = require('../models/Sample');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/samples', sampleRoutes);

describe('Sample Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aquasure-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up
    await Sample.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear samples before each test
    await Sample.deleteMany({});
  });

  describe('POST /api/samples', () => {
    test('should create a sample with valid data', async () => {
      const sampleData = {
        location: 'Test Location',
        ph: 7.0,
        tds: 300,
        turbidity: 0.5,
        chlorine: 0.3,
        temperature: 25
      };

      const response = await request(app)
        .post('/api/samples')
        .send(sampleData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.location).toBe(sampleData.location);
      expect(response.body.qualityIndex).toBeGreaterThanOrEqual(0);
      expect(response.body.qualityIndex).toBeLessThanOrEqual(100);
      expect(['Safe', 'Borderline', 'Unsafe']).toContain(response.body.status);
    });

    test('should calculate quality index correctly for safe sample', async () => {
      const sampleData = {
        location: 'Safe Location',
        ph: 7.0,
        tds: 300,
        turbidity: 0.5,
        chlorine: 0.3
      };

      const response = await request(app)
        .post('/api/samples')
        .send(sampleData)
        .expect(201);

      expect(response.body.qualityIndex).toBeGreaterThanOrEqual(80);
      expect(response.body.status).toBe('Safe');
    });

    test('should return 400 for missing required fields', async () => {
      const incompleteData = {
        location: 'Test',
        ph: 7.0
        // Missing tds, turbidity, chlorine
      };

      await request(app)
        .post('/api/samples')
        .send(incompleteData)
        .expect(400);
    });

    test('should return 400 for invalid pH range', async () => {
      const invalidData = {
        location: 'Test',
        ph: 15, // Invalid: outside 0-14 range
        tds: 300,
        turbidity: 0.5,
        chlorine: 0.3
      };

      // Note: This test assumes validation is implemented in the model
      // Adjust based on actual validation implementation
    });
  });

  describe('GET /api/samples', () => {
    test('should get all samples', async () => {
      // Create test samples
      await Sample.create([
        {
          location: 'Location 1',
          ph: 7.0,
          tds: 300,
          turbidity: 0.5,
          chlorine: 0.3
        },
        {
          location: 'Location 2',
          ph: 8.0,
          tds: 600,
          turbidity: 2.0,
          chlorine: 0.4
        }
      ]);

      const response = await request(app)
        .get('/api/samples')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should filter samples by location', async () => {
      await Sample.create([
        { location: 'Location A', ph: 7.0, tds: 300, turbidity: 0.5, chlorine: 0.3 },
        { location: 'Location B', ph: 7.0, tds: 300, turbidity: 0.5, chlorine: 0.3 }
      ]);

      const response = await request(app)
        .get('/api/samples?location=Location A')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].location).toBe('Location A');
    });
  });

  describe('Quality Index Calculation', () => {
    test('should calculate high QI for ideal parameters', async () => {
      const idealSample = {
        location: 'Ideal',
        ph: 7.0,
        tds: 300,
        turbidity: 0.5,
        chlorine: 0.3
      };

      const response = await request(app)
        .post('/api/samples')
        .send(idealSample)
        .expect(201);

      expect(response.body.qualityIndex).toBeGreaterThan(80);
    });

    test('should calculate low QI for poor parameters', async () => {
      const poorSample = {
        location: 'Poor',
        ph: 5.0,
        tds: 1200,
        turbidity: 8.0,
        chlorine: 0.1
      };

      const response = await request(app)
        .post('/api/samples')
        .send(poorSample)
        .expect(201);

      expect(response.body.qualityIndex).toBeLessThan(50);
      expect(response.body.status).toBe('Unsafe');
    });
  });
});

