import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByFirebaseUidQuery } from './get-user-by-firebase-uid.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.aggregate';

@QueryHandler(GetUserByFirebaseUidQuery)
export class GetUserByFirebaseUidHandler implements IQueryHandler<
  GetUserByFirebaseUidQuery,
  User | null
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  execute(query: GetUserByFirebaseUidQuery): Promise<User | null> {
    return this.userRepository.findByFirebaseUid(query.firebaseUid);
  }
}
