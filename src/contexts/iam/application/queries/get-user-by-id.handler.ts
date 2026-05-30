import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.aggregate';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<User> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) throw new UserNotFoundException(query.userId);
    return user;
  }
}
