import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SendPasswordResetCommand } from './send-password-reset.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import { FirebaseAuthService } from '../../infrastructure/firebase/firebase-auth.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

export interface PasswordResetResult {
  resetLink: string;
}

@CommandHandler(SendPasswordResetCommand)
export class SendPasswordResetHandler implements ICommandHandler<
  SendPasswordResetCommand,
  PasswordResetResult
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async execute(
    command: SendPasswordResetCommand,
  ): Promise<PasswordResetResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new UserNotFoundException(command.userId);

    const resetLink = await this.firebaseAuthService.generatePasswordResetLink(
      user.email.value,
    );

    return { resetLink };
  }
}
