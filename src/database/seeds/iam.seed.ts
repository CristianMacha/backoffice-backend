import { DataSource } from 'typeorm';
import { RoleOrmEntity } from '../../contexts/iam/infrastructure/persistence/role.orm-entity';
import { PermissionOrmEntity } from '../../contexts/iam/infrastructure/persistence/permission.orm-entity';
import { UserOrmEntity } from '../../contexts/iam/infrastructure/persistence/user.orm-entity';
import {
  ALL_PERMISSIONS,
  Permission,
  Permissions,
} from '../../contexts/iam/domain/permission/permissions';
import { Role } from '../../contexts/iam/domain/role/role.enum';

interface RoleSeed {
  name: string;
  description: string;
  permissions: Permission[];
}

const ROLES: RoleSeed[] = [
  {
    name: Role.SUPER_ADMIN,
    description: 'Super Administrator',
    permissions: ALL_PERMISSIONS,
  },
  {
    name: Role.ADMIN,
    description: 'Administrator',
    permissions: [
      Permissions.USERS.CREATE,
      Permissions.USERS.READ,
      Permissions.USERS.UPDATE,
      Permissions.USERS.DELETE,
      Permissions.ROLES.READ,
      Permissions.ROLES.UPDATE,
      Permissions.DASHBOARD.VIEW,
    ],
  },
  {
    name: Role.MANAGER,
    description: 'Manager',
    permissions: [Permissions.DASHBOARD.VIEW, Permissions.USERS.READ],
  },
  {
    name: Role.USER,
    description: 'Standard User',
    permissions: [Permissions.DASHBOARD.VIEW, Permissions.PROFILE.READ],
  },
  { name: Role.GUEST, description: 'Guest', permissions: [] },
];

export async function seedIam(dataSource: DataSource): Promise<void> {
  const permissionRepo = dataSource.getRepository(PermissionOrmEntity);
  const roleRepo = dataSource.getRepository(RoleOrmEntity);

  console.log('  → Seeding permissions...');
  const permissionEntities: PermissionOrmEntity[] = [];

  for (const name of ALL_PERMISSIONS) {
    let entity = await permissionRepo.findOne({ where: { name } });
    if (!entity) {
      entity = permissionRepo.create({
        id: crypto.randomUUID(),
        name,
        description: null,
      });
      await permissionRepo.save(entity);
      console.log(`    ✓ Permission: ${name}`);
    } else {
      console.log(`    ~ Permission already exists: ${name}`);
    }
    permissionEntities.push(entity);
  }

  console.log('  → Seeding roles...');
  for (const r of ROLES) {
    let roleEntity = await roleRepo.findOne({ where: { name: r.name } });

    if (!roleEntity) {
      roleEntity = roleRepo.create({
        id: crypto.randomUUID(),
        name: r.name,
        description: r.description,
      });
      console.log(`    ✓ Role: ${r.name}`);
    } else {
      console.log(`    ~ Role already exists: ${r.name}`);
    }

    roleEntity.permissions = permissionEntities.filter((p) =>
      r.permissions.includes(p.name as Permission),
    );

    await roleRepo.save(roleEntity);
  }

  console.log('  ✓ IAM seed complete');
}

export async function seedBootstrapAdmin(
  dataSource: DataSource,
): Promise<void> {
  const firebaseUid = process.env.SUPER_ADMIN_FIREBASE_UID;
  const email = process.env.SUPER_ADMIN_EMAIL;

  if (!firebaseUid || !email) {
    console.log(
      '  ~ Skipping bootstrap admin (SUPER_ADMIN_FIREBASE_UID / SUPER_ADMIN_EMAIL not set)',
    );
    return;
  }

  const userRepo = dataSource.getRepository(UserOrmEntity);
  const roleRepo = dataSource.getRepository(RoleOrmEntity);

  const existing = await userRepo.findOne({ where: { firebaseUid } });
  if (existing) {
    console.log(`  ~ Bootstrap admin already exists (${email})`);
    return;
  }

  const superAdminRole = await roleRepo.findOne({
    where: { name: Role.SUPER_ADMIN },
  });
  if (!superAdminRole) {
    throw new Error(
      'super_admin role not found — run seedIam before seedBootstrapAdmin',
    );
  }

  const user = userRepo.create({
    id: crypto.randomUUID(),
    firebaseUid,
    email,
    roleId: superAdminRole.id,
    status: 'active',
  });
  await userRepo.save(user);

  console.log(
    `  ✓ Bootstrap admin created: ${email} (role: ${Role.SUPER_ADMIN})`,
  );
}
