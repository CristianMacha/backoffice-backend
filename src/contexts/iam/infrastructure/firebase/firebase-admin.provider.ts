import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider = {
  provide: FIREBASE_ADMIN,
  inject: [ConfigService],
  useFactory: (config: ConfigService): admin.app.App => {
    if (admin.apps.length > 0) return admin.apps[0]!;

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.getOrThrow<string>('firebase.projectId'),
        clientEmail: config.getOrThrow<string>('firebase.clientEmail'),
        privateKey: config
          .getOrThrow<string>('firebase.privateKey')
          .replace(/\\n/g, '\n'),
      }),
    });
  },
};
