import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../domain/role/role.repository.interface';
import { FirebaseAuthService } from '../../infrastructure/firebase/firebase-auth.service';
import { User } from '../../domain/user/user.aggregate';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<
  CreateUserCommand,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const [existingByEmail, role] = await Promise.all([
      this.userRepository.findByEmail(command.email),
      this.roleRepository.findById(command.roleId),
    ]);

    if (existingByEmail)
      throw new UserAlreadyExistsException('email', command.email);
    if (!role) throw new RoleNotFoundException(command.roleId);

    const firebaseUser = await this.createFirebaseUser(command.email);

    try {
      const userResult = User.create({
        firebaseUid: firebaseUser.uid,
        email: command.email,
        roleId: role.id,
      });
      if (userResult.isErr) throw userResult.error;

      const user = this.publisher.mergeObjectContext(userResult.value);

      await this.userRepository.save(user);
      user.commit();
      return user;
    } catch (error) {
      try {
        await this.firebaseAuthService.deleteUser(firebaseUser.uid);
      } catch {
        // rollback failed — original error is still rethrown below
      }
      throw error;
    }
  }

  private async createFirebaseUser(email: string): Promise<{ uid: string }> {
    try {
      return await this.firebaseAuthService.createUser(email);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-exists') {
        throw new UserAlreadyExistsException('email', email);
      }
      throw err;
    }
  }
}
