import { IPermissionRepository } from '../../domain/permission/permission.repository.interface';
import { PermissionEntity } from '../../domain/permission/permission.entity';

export class FakePermissionRepository implements IPermissionRepository {
  private readonly store = new Map<string, PermissionEntity>();

  findById(id: string): Promise<PermissionEntity | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByIds(ids: string[]): Promise<PermissionEntity[]> {
    return Promise.resolve(
      ids
        .map((id) => this.store.get(id))
        .filter((p): p is PermissionEntity => p !== undefined),
    );
  }

  findAll(): Promise<PermissionEntity[]> {
    return Promise.resolve([...this.store.values()]);
  }

  save(permission: PermissionEntity): Promise<void> {
    this.store.set(permission.id, permission);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
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
