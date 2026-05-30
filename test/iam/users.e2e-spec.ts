import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { FirebaseAuthService } from '../../src/contexts/iam/infrastructure/firebase/firebase-auth.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../src/contexts/iam/domain/user/user.repository.interface';
import { UserBuilder } from '../../src/contexts/iam/test/builders/user.builder';
import { Role as RoleEnum } from '../../src/contexts/iam/domain/role/role.enum';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let userRepo: IUserRepository;
  let userRoleId: string;
  let adminRoleId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FirebaseAuthService)
      .useValue({
        verifyToken: jest.fn().mockResolvedValue({
          uid: 'admin-firebase-uid',
          email: 'admin@test.com',
        }),
      })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    userRepo = module.get<IUserRepository>(USER_REPOSITORY);

    // Get role IDs from seeded data
    const rolesRes = await request(app.getHttpServer())
      .get('/api/v1/roles')
      .set('Authorization', 'Bearer fake-token');

    userRoleId = rolesRes.body.data.find(
      (r: { name: string }) => r.name === RoleEnum.USER,
    )?.id;
    adminRoleId = rolesRes.body.data.find(
      (r: { name: string }) => r.name === RoleEnum.SUPER_ADMIN,
    )?.id;

    // Seed an admin user so the guard resolves correctly
    const adminUser = new UserBuilder()
      .withId(crypto.randomUUID())
      .withFirebaseUid('admin-firebase-uid')
      .withEmail('admin@test.com')
      .withRoleId(adminRoleId)
      .build();
    await userRepo.save(adminUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    it('creates a new user and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', 'Bearer any-token')
        .send({
          firebaseUid: 'new-firebase-uid',
          email: 'newuser@example.com',
          roleId: userRoleId,
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe('newuser@example.com');
      expect(res.body.data.roleId).toBe(userRoleId);
    });

    it('returns 409 when email is already registered', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', 'Bearer any-token')
        .send({
          firebaseUid: 'another-uid',
          email: 'newuser@example.com',
          roleId: userRoleId,
        })
        .expect(409);

      expect(res.body.errorCode).toBe('USER_ALREADY_EXISTS');
    });

    it('returns 400 for missing fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', 'Bearer any-token')
        .send({ email: 'incomplete@example.com' })
        .expect(400);
    });

    it('returns 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', 'Bearer any-token')
        .send({
          firebaseUid: 'uid-x',
          email: 'not-an-email',
          roleId: userRoleId,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('returns the user by id', async () => {
      // First create
      const created = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', 'Bearer any-token')
        .send({
          firebaseUid: 'get-test-uid',
          email: 'get@example.com',
          roleId: userRoleId,
        });

      const userId = created.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.email).toBe('get@example.com');
    });

    it('returns 404 for nonexistent user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${crypto.randomUUID()}`)
        .set('Authorization', 'Bearer any-token')
        .expect(404);

      expect(res.body.errorCode).toBe('USER_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/users/:id/role', () => {
    it('changes the user role', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', 'Bearer any-token')
        .send({
          firebaseUid: 'role-change-uid',
          email: 'rolechange@example.com',
          roleId: userRoleId,
        });

      const userId = created.body.data.id;

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}/role`)
        .set('Authorization', 'Bearer any-token')
        .send({ roleId: adminRoleId })
        .expect(200);

      expect(res.body.data.roleId).toBe(adminRoleId);
    });

    it('returns 404 for nonexistent user', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${crypto.randomUUID()}/role`)
        .set('Authorization', 'Bearer any-token')
        .send({ roleId: userRoleId })
        .expect(404);
    });
  });
});
