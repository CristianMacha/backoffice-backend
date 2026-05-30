import { PermissionEntity } from './permission.entity';
import { Permissions } from './permissions';
import { PermissionBuilder } from '../../test/builders/permission.builder';

describe('PermissionEntity', () => {
  describe('create()', () => {
    it('creates a permission with given props', () => {
      const p = PermissionEntity.create({
        name: Permissions.USERS.READ,
        description: 'View users',
      });
      expect(p.name).toBe(Permissions.USERS.READ);
      expect(p.description).toBe('View users');
    });

    it('generates a UUID id', () => {
      const p = PermissionEntity.create({
        name: Permissions.USERS.CREATE,
        description: null,
      });
      expect(p.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('allows null description', () => {
      const p = PermissionEntity.create({
        name: Permissions.DASHBOARD.VIEW,
        description: null,
      });
      expect(p.description).toBeNull();
    });
  });

  describe('reconstitute()', () => {
    it('restores a permission with existing id and timestamps', () => {
      const id = crypto.randomUUID();
      const createdAt = new Date('2024-01-01');
      const p = PermissionEntity.reconstitute(
        { name: Permissions.USERS.DELETE, description: 'Delete users' },
        id,
        createdAt,
        createdAt,
      );
      expect(p.id).toBe(id);
      expect(p.createdAt).toBe(createdAt);
    });
  });

  describe('equals()', () => {
    it('two permissions with same id are equal', () => {
      const id = crypto.randomUUID();
      const a = new PermissionBuilder().withId(id).build();
      const b = new PermissionBuilder().withId(id).build();
      expect(a.equals(b)).toBe(true);
    });

    it('two permissions with different ids are not equal', () => {
      const a = new PermissionBuilder().build();
      const b = new PermissionBuilder().build();
      expect(a.equals(b)).toBe(false);
    });
  });
});
