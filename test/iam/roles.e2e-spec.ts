import * as http from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { FirebaseAuthService } from '../../src/contexts/iam/infrastructure/firebase/firebase-auth.service';
import { FIREBASE_ADMIN } from '../../src/contexts/iam/infrastructure/firebase/firebase-admin.provider';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../src/contexts/iam/domain/user/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../src/contexts/iam/domain/role/role.repository.interface';
import { UserBuilder } from '../../src/contexts/iam/test/builders/user.builder';
import { Role as RoleEnum } from '../../src/contexts/iam/domain/role/role.enum';
import { AllExceptionsFilter } from '../../src/shared/http/filters/all-exceptions.filter';
import { TransformInterceptor } from '../../src/shared/http/interceptors/transform.interceptor';

type RoleDto = { id: string; name: RoleEnum };
type PermissionDto = { id: string; name: string };
type ApiList<T> = { data: T[] };
type ApiItem<T> = { data: T };
type ApiError = { errorCode: string };

describe('Roles (e2e)', () => {
  let app: INestApplication;
  let server: http.Server;
  let adminRoleId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FIREBASE_ADMIN)
      .useValue(null)
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
    app.useGlobalFilters(app.get(AllExceptionsFilter));
    app.useGlobalInterceptors(app.get(TransformInterceptor));
    await app.init();
    server = app.getHttpServer() as http.Server;

    // Get role IDs directly from the repository — no HTTP request needed here
    const roleRepo = module.get<IRoleRepository>(ROLE_REPOSITORY);
    const roles = await roleRepo.findAll();
    adminRoleId =
      roles.find((r) => (r.name as RoleEnum) === RoleEnum.SUPER_ADMIN)?.id ??
      '';

    // Seed admin user BEFORE any authenticated HTTP requests
    const userRepo = module.get<IUserRepository>(USER_REPOSITORY);
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

  describe('GET /api/v1/roles', () => {
    it('returns the list of roles (seeded)', async () => {
      const res = await request(server)
        .get('/api/v1/roles')
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      const body = res.body as ApiList<RoleDto>;
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('GET /api/v1/roles/permissions', () => {
    it('returns the list of permissions', async () => {
      const res = await request(server)
        .get('/api/v1/roles/permissions')
        .set('Authorization', 'Bearer any-token')
        .expect(200);

      const body = res.body as ApiList<PermissionDto>;
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(5);
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('name');
    });
  });

  describe('PATCH /api/v1/roles/:id/permissions', () => {
    it('replaces permissions for a role', async () => {
      const permsRes = await request(server)
        .get('/api/v1/roles/permissions')
        .set('Authorization', 'Bearer any-token');

      const permId = (permsRes.body as ApiList<PermissionDto>).data[0].id;

      const rolesRes = await request(server)
        .get('/api/v1/roles')
        .set('Authorization', 'Bearer any-token');

      const userRole = (rolesRes.body as ApiList<RoleDto>).data.find(
        (r) => r.name === RoleEnum.GUEST,
      );
      if (!userRole) throw new Error('GUEST role not found in seed data');

      const res = await request(server)
        .patch(`/api/v1/roles/${userRole.id}/permissions`)
        .set('Authorization', 'Bearer any-token')
        .send({ permissionIds: [permId] })
        .expect(200);

      const body = res.body as ApiItem<{ permissions: unknown[] }>;
      expect(body.data.permissions).toHaveLength(1);
    });

    it('returns 404 for nonexistent role', async () => {
      const res = await request(server)
        .patch(`/api/v1/roles/${crypto.randomUUID()}/permissions`)
        .set('Authorization', 'Bearer any-token')
        .send({ permissionIds: [] })
        .expect(404);

      expect((res.body as ApiError).errorCode).toBe('ROLE_NOT_FOUND');
    });

    it('returns 400 for invalid permission UUID', async () => {
      await request(server)
        .patch(`/api/v1/roles/${adminRoleId}/permissions`)
        .set('Authorization', 'Bearer any-token')
        .send({ permissionIds: ['not-a-uuid'] })
        .expect(400);
    });
  });
});
