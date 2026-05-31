import { IRoleRepository } from '../../domain/role/role.repository.interface';
import { Role } from '../../domain/role/role.entity';

export class FakeRoleRepository implements IRoleRepository {
  private readonly store = new Map<string, Role>();

  findById(id: string): Promise<Role | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByName(name: string): Promise<Role | null> {
    return Promise.resolve(
      [...this.store.values()].find((r) => r.name === name) ?? null,
    );
  }

  findAll(): Promise<Role[]> {
    return Promise.resolve([...this.store.values()]);
  }

  save(role: Role): Promise<void> {
    this.store.set(role.id, role);
    return Promise.resolve();
  }

  replacePermissions(_roleId: string, _permissionIds: string[]): Promise<void> {
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  seed(role: Role): void {
    this.store.set(role.id, role);
  }

  all(): Role[] {
    return [...this.store.values()];
  }

  clear(): void {
    this.store.clear();
  }
}
