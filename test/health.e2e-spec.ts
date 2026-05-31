import * as http from 'http';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { FirebaseAuthService } from '../src/contexts/iam/infrastructure/firebase/firebase-auth.service';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService)
      .useValue({ verifyToken: jest.fn() })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns service status', async () => {
    const res = await request(server).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect((res.body as { data: unknown }).data).toHaveProperty('status');
  });
});
