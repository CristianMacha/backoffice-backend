import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { FirebaseAuthService } from '../../infrastructure/firebase/firebase-auth.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import { UserStatus } from '../../domain/user/user-status.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role as RoleEnum } from '../../domain/role/role.enum';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAuth: FirebaseAuthService,
    private readonly reflector: Reflector,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let firebaseUid: string;
    let firebaseEmail: string | undefined;

    try {
      const decoded = await this.firebaseAuth.verifyToken(token);
      firebaseUid = decoded.uid;
      firebaseEmail = decoded.email;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const result =
      await this.userRepository.findByFirebaseUidWithRole(firebaseUid);
    if (!result) throw new UnauthorizedException('User account not found');

    const { user, roleName, permissions } = result;

    if (user.status === UserStatus.INACTIVE)
      throw new UnauthorizedException('Account is inactive');
    if (user.status === UserStatus.BANNED)
      throw new UnauthorizedException('Account is banned');

    const authUser: AuthUser = {
      uid: firebaseUid,
      email: firebaseEmail ?? user.email.value,
      role: roleName as RoleEnum,
      userId: user.id,
      roleId: user.roleId,
      status: user.status,
      permissions,
    };
    request['user'] = authUser;

    return true;
  }

  private extractBearerToken(req: Request): string | null {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? (token ?? null) : null;
  }
}
