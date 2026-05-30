import { User } from './user.aggregate';
import { UserStatus } from './user-status.enum';
import { UserCreatedEvent } from '@shared/domain/events/user-created.event';
import { UserRoleChangedEvent } from '@shared/domain/events/user-role-changed.event';
import { InvalidEmailException } from '../exceptions/invalid-email.exception';
import { UserBuilder } from '../../test/builders/user.builder';

describe('User aggregate', () => {
  describe('create()', () => {
    it('creates a user with ACTIVE status', () => {
      const result = User.create({
        firebaseUid: 'uid-1',
        email: 'a@b.com',
        roleId: 'role-1',
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.status).toBe(UserStatus.ACTIVE);
        expect(result.value.firebaseUid).toBe('uid-1');
        expect(result.value.email.value).toBe('a@b.com');
        expect(result.value.roleId).toBe('role-1');
      }
    });

    it('generates a UUID id', () => {
      const result = User.create({
        firebaseUid: 'uid',
        email: 'a@b.com',
        roleId: 'r1',
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) expect(result.value.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('returns InvalidEmailException for invalid email', () => {
      const result = User.create({
        firebaseUid: 'uid',
        email: 'bad-email',
        roleId: 'r1',
      });
      expect(result.isErr).toBe(true);
      if (result.isErr) expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('emits UserCreatedEvent', () => {
      const result = User.create({
        firebaseUid: 'uid',
        email: 'a@b.com',
        roleId: 'role-1',
      });
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        const events = result.value.getUncommittedEvents();
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(UserCreatedEvent);
        const event = events[0] as UserCreatedEvent;
        expect(event.firebaseUid).toBe('uid');
        expect(event.email).toBe('a@b.com');
        expect(event.roleId).toBe('role-1');
      }
    });
  });

  describe('changeRole()', () => {
    it('updates roleId', () => {
      const user = new UserBuilder().withRoleId('old-role').build();
      user.changeRole('new-role');
      expect(user.roleId).toBe('new-role');
    });

    it('emits UserRoleChangedEvent with previous and new role', () => {
      const user = new UserBuilder().withRoleId('old-role').build();
      user.changeRole('new-role');
      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      const event = events[0] as UserRoleChangedEvent;
      expect(event).toBeInstanceOf(UserRoleChangedEvent);
      expect(event.newRoleId).toBe('new-role');
      expect(event.previousRoleId).toBe('old-role');
    });

    it('updates updatedAt', () => {
      const user = new UserBuilder().build();
      const before = user.updatedAt;
      user.changeRole('new-role');
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('deactivate()', () => {
    it('sets status to INACTIVE', () => {
      const user = new UserBuilder().build();
      user.deactivate();
      expect(user.status).toBe(UserStatus.INACTIVE);
    });
  });

  describe('ban()', () => {
    it('sets status to BANNED', () => {
      const user = new UserBuilder().build();
      user.ban();
      expect(user.status).toBe(UserStatus.BANNED);
    });
  });

  describe('reconstitute()', () => {
    it('restores user without emitting events', () => {
      const user = new UserBuilder().withRoleId('role-1').build();
      expect(user.getUncommittedEvents()).toHaveLength(0);
    });
  });
});
