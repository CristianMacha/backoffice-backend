import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeactivateUserCommand } from './deactivate-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.aggregate';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { CannotDeactivateSelfException } from '../../domain/exceptions/cannot-deactivate-self.exception';

@CommandHandler(DeactivateUserCommand)
export class DeactivateUserHandler implements ICommandHandler<
  DeactivateUserCommand,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeactivateUserCommand): Promise<User> {
    if (command.userId === command.requesterId) {
      throw new CannotDeactivateSelfException();
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new UserNotFoundException(command.userId);

    const contextualUser = this.publisher.mergeObjectContext(user);
    contextualUser.deactivate();
    await this.userRepository.save(contextualUser);
    contextualUser.commit();

    return contextualUser;
  }
}
