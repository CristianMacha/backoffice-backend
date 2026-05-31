import { LogoutHandler } from './logout.handler';
import { LogoutCommand } from './logout.command';
import { FirebaseAuthService } from '../../infrastructure/firebase/firebase-auth.service';

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
  let firebaseAuth: jest.Mocked<FirebaseAuthService>;

  beforeEach(() => {
    firebaseAuth = {
      revokeRefreshTokens: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<FirebaseAuthService>;
    handler = new LogoutHandler(firebaseAuth);
  });

  it('revokes Firebase refresh tokens for the given uid', async () => {
    await handler.execute(new LogoutCommand('firebase-uid-123'));
    expect(firebaseAuth.revokeRefreshTokens).toHaveBeenCalledWith(
      'firebase-uid-123',
    );
    expect(firebaseAuth.revokeRefreshTokens).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from Firebase', async () => {
    firebaseAuth.revokeRefreshTokens.mockRejectedValue(
      new Error('Firebase error'),
    );
    await expect(handler.execute(new LogoutCommand('uid'))).rejects.toThrow(
      'Firebase error',
    );
  });
});
