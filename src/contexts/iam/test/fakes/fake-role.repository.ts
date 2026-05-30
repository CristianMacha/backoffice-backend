import { IRoleRepository } from '../../domain/role/role.repository.interface';
import { Role } from '../../domain/role/role.entity';

export class FakeRoleRepository implements IRoleRepository {
  private readonly store = new Map<string, Role>();

  async findById(id: string): Promise<Role | null> {
    return this.store.get(id) ?? null;
  }

  async findByName(name: string): Promise<Role | null> {
    return [...this.store.values()].find((r) => r.name === name) ?? null;
  }

  async findAll(): Promise<Role[]> {
    return [...this.store.values()];
  }

  async save(role: Role): Promise<void> {
    this.store.set(role.id, role);
  }

  async replacePermissions(
    _roleId: string,
    _permissionIds: string[],
  ): Promise<void> {
    // no-op in tests — test the handler logic, not the ORM relation
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
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
