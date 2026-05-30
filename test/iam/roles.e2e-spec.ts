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

describe('Roles (e2e)', () => {
  let app: INestApplication;
  let userRepo: IUserRepository;
  let adminRoleId: string;
  let adminUserId: string;

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

    // Get the admin role from DB
    const rolesRes = await request(app.getHttpServer())
      .get('/api/v1/roles')
      .set('Authorization', 'Bearer fake-token');

    const adminRole = rolesRes.body.data.find(
      (r: { name: string }) => r.name === RoleEnum.SUPER_ADMIN,
    );
    adminRoleId = adminRole?.id;

    // Create an admin user in DB so the guard can find them
    adminUserId = crypto.randomUUID();
    const adminUser = new UserBuilder()
      .withId(adminUserId)
      .withFirebaseUid('admin-firebase-uid')
      .withEmail('admin@test.com')
      .withRoleId(adminRoleId)
      .build();
    await userRepo.save(adminUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/roles', () => {
    it('returns the list of roles (seeded)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('GET /api/v1/roles/permissions', () => {
    it('returns the list of permissions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/roles/permissions')
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('name');
    });
  });

  describe('PATCH /api/v1/roles/:id/permissions', () => {
    it('replaces permissions for a role', async () => {
      // Get a permission id first
      const permsRes = await request(app.getHttpServer())
        .get('/api/v1/roles/permissions')
        .set('Authorization', 'Bearer any-token');

      const permId = permsRes.body.data[0].id;
      const userRole = (
        await request(app.getHttpServer())
          .get('/api/v1/roles')
          .set('Authorization', 'Bearer any-token')
      ).body.data.find((r: { name: string }) => r.name === RoleEnum.GUEST);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/roles/${userRole.id}/permissions`)
        .set('Authorization', 'Bearer any-token')
        .send({ permissionIds: [permId] })
        .expect(200);

      expect(res.body.data.permissions).toHaveLength(1);
    });

    it('returns 404 for nonexistent role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/roles/${crypto.randomUUID()}/permissions`)
        .set('Authorization', 'Bearer any-token')
        .send({ permissionIds: [] })
        .expect(404);

      expect(res.body.errorCode).toBe('ROLE_NOT_FOUND');
    });

    it('returns 400 for invalid permission UUID', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/roles/${adminRoleId}/permissions`)
        .set('Authorization', 'Bearer any-token')
        .send({ permissionIds: ['not-a-uuid'] })
        .expect(400);
    });
  });
});
