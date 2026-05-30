import { LogoutHandler } from './logout.handler';
import { LogoutCommand } from './logout.command';

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
  let revokeRefreshTokens: jest.Mock;

  beforeEach(() => {
    revokeRefreshTokens = jest.fn().mockResolvedValue(undefined);
    const firebaseAuth = { revokeRefreshTokens } as any;
    handler = new LogoutHandler(firebaseAuth);
  });

  it('revokes Firebase refresh tokens for the given uid', async () => {
    await handler.execute(new LogoutCommand('firebase-uid-123'));
    expect(revokeRefreshTokens).toHaveBeenCalledWith('firebase-uid-123');
    expect(revokeRefreshTokens).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from Firebase', async () => {
    revokeRefreshTokens.mockRejectedValue(new Error('Firebase error'));
    await expect(handler.execute(new LogoutCommand('uid'))).rejects.toThrow(
      'Firebase error',
    );
  });
});
