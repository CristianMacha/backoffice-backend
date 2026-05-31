import {
  IUserRepository,
  UserWithRole,
} from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.aggregate';
import { PaginationParams } from '../../../../shared/utils/pagination';

export class FakeUserRepository implements IUserRepository {
  private readonly store = new Map<string, User>();

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByFirebaseUid(uid: string): Promise<User | null> {
    return Promise.resolve(
      [...this.store.values()].find((u) => u.firebaseUid === uid) ?? null,
    );
  }

  findByFirebaseUidWithRole(_uid: string): Promise<UserWithRole | null> {
    return Promise.resolve(null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(
      [...this.store.values()].find((u) => u.email.value === email) ?? null,
    );
  }

  save(user: User): Promise<void> {
    this.store.set(user.id, user);
    return Promise.resolve();
  }

  findAll(params: PaginationParams): Promise<{ users: User[]; total: number }> {
    const all = [...this.store.values()];
    const start = (params.page - 1) * params.limit;
    return Promise.resolve({
      users: all.slice(start, start + params.limit),
      total: all.length,
    });
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  seed(user: User): void {
    this.store.set(user.id, user);
  }

  all(): User[] {
    return [...this.store.values()];
  }

  clear(): void {
    this.store.clear();
  }
}
