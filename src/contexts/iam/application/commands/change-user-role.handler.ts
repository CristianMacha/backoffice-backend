import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangeUserRoleCommand } from './change-user-role.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../domain/role/role.repository.interface';
import { User } from '../../domain/user/user.aggregate';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { CannotChangeOwnRoleException } from '../../domain/exceptions/cannot-change-own-role.exception';

@CommandHandler(ChangeUserRoleCommand)
export class ChangeUserRoleHandler implements ICommandHandler<
  ChangeUserRoleCommand,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: ChangeUserRoleCommand): Promise<User> {
    if (command.userId === command.requesterId) {
      throw new CannotChangeOwnRoleException();
    }

    const [user, role] = await Promise.all([
      this.userRepository.findById(command.userId),
      this.roleRepository.findById(command.newRoleId),
    ]);

    if (!user) throw new UserNotFoundException(command.userId);
    if (!role) throw new RoleNotFoundException(command.newRoleId);

    const contextualUser = this.publisher.mergeObjectContext(user);
    contextualUser.changeRole(role.id);

    await this.userRepository.save(contextualUser);
    contextualUser.commit();

    return contextualUser;
  }
}
