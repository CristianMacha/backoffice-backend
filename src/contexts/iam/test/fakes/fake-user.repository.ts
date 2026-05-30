import {
  IUserRepository,
  UserWithRole,
} from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.aggregate';
import { PaginationParams } from '../../../../shared/utils/pagination';

export class FakeUserRepository implements IUserRepository {
  private readonly store = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByFirebaseUid(uid: string): Promise<User | null> {
    return [...this.store.values()].find((u) => u.firebaseUid === uid) ?? null;
  }

  async findByFirebaseUidWithRole(_uid: string): Promise<UserWithRole | null> {
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (
      [...this.store.values()].find((u) => u.email.value === email) ?? null
    );
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async findAll(
    params: PaginationParams,
  ): Promise<{ users: User[]; total: number }> {
    const all = [...this.store.values()];
    const start = (params.page - 1) * params.limit;
    return { users: all.slice(start, start + params.limit), total: all.length };
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
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
