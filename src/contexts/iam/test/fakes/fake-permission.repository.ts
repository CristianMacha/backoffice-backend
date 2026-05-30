import { IPermissionRepository } from '../../domain/permission/permission.repository.interface';
import { PermissionEntity } from '../../domain/permission/permission.entity';

export class FakePermissionRepository implements IPermissionRepository {
  private readonly store = new Map<string, PermissionEntity>();

  async findById(id: string): Promise<PermissionEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByIds(ids: string[]): Promise<PermissionEntity[]> {
    return ids
      .map((id) => this.store.get(id))
      .filter((p): p is PermissionEntity => p !== undefined);
  }

  async findAll(): Promise<PermissionEntity[]> {
    return [...this.store.values()];
  }

  async save(permission: PermissionEntity): Promise<void> {
    this.store.set(permission.id, permission);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  seed(permission: PermissionEntity): void {
    this.store.set(permission.id, permission);
  }

  all(): PermissionEntity[] {
    return [...this.store.values()];
  }

  clear(): void {
    this.store.clear();
  }
}
