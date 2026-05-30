import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from './firebase-admin.provider';

@Injectable()
export class FirebaseAuthService {
  constructor(@Inject(FIREBASE_ADMIN) private readonly app: admin.app.App) {}

  verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.app.auth().verifyIdToken(token, true);
  }

  async createUser(email: string): Promise<admin.auth.UserRecord> {
    return this.app.auth().createUser({ email });
  }

  async deleteUser(uid: string): Promise<void> {
    return this.app.auth().deleteUser(uid);
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    return this.app.auth().generatePasswordResetLink(email);
  }

  setCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void> {
    return this.app.auth().setCustomUserClaims(uid, claims);
  }

  revokeRefreshTokens(uid: string): Promise<void> {
    return this.app.auth().revokeRefreshTokens(uid);
  }
}
