import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { FirebaseAuthService } from '../../infrastructure/firebase/firebase-auth.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.firebaseAuth.revokeRefreshTokens(command.firebaseUid);
  }
}
