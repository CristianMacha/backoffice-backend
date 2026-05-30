import { Role } from './role.entity';
import { Permissions } from '../permission/permissions';
import { RoleBuilder } from '../../test/builders/role.builder';

describe('Role entity', () => {
  describe('create()', () => {
    it('creates a role with given props', () => {
      const role = Role.create({
        name: 'admin',
        description: 'Administrator',
        permissions: [Permissions.USERS.READ],
      });
      expect(role.name).toBe('admin');
      expect(role.description).toBe('Administrator');
      expect(role.permissions).toEqual([Permissions.USERS.READ]);
    });

    it('generates a UUID id', () => {
      const role = Role.create({
        name: 'user',
        description: null,
        permissions: [],
      });
      expect(role.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('returns a copy of permissions (immutable)', () => {
      const role = Role.create({
        name: 'user',
        description: null,
        permissions: [Permissions.USERS.READ],
      });
      const perms = role.permissions;
      perms.push(Permissions.USERS.CREATE);
      expect(role.permissions).toHaveLength(1);
    });
  });

  describe('replacePermissions()', () => {
    it('replaces permissions', () => {
      const role = new RoleBuilder()
        .withPermissions(Permissions.USERS.READ)
        .build();
      role.replacePermissions([
        Permissions.USERS.CREATE,
        Permissions.DASHBOARD.VIEW,
      ]);
      expect(role.permissions).toEqual([
        Permissions.USERS.CREATE,
        Permissions.DASHBOARD.VIEW,
      ]);
    });

    it('can clear all permissions', () => {
      const role = new RoleBuilder()
        .withPermissions(Permissions.USERS.READ)
        .build();
      role.replacePermissions([]);
      expect(role.permissions).toHaveLength(0);
    });

    it('updates updatedAt', () => {
      const role = new RoleBuilder().build();
      const before = role.updatedAt;
      role.replacePermissions([Permissions.USERS.CREATE]);
      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('equals()', () => {
    it('two roles with same id are equal', () => {
      const id = crypto.randomUUID();
      const a = new RoleBuilder().withId(id).build();
      const b = new RoleBuilder().withId(id).build();
      expect(a.equals(b)).toBe(true);
    });

    it('two roles with different ids are not equal', () => {
      const a = new RoleBuilder().build();
      const b = new RoleBuilder().build();
      expect(a.equals(b)).toBe(false);
    });
  });
});
