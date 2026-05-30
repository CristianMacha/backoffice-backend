import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from './get-users.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/user/user.repository.interface';
import {
  PaginatedResult,
  toPaginatedResult,
} from '../../../../shared/utils/pagination';
import { User } from '../../domain/user/user.aggregate';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<
  GetUsersQuery,
  PaginatedResult<User>
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<PaginatedResult<User>> {
    const { users, total } = await this.userRepository.findAll(query.params);
    return toPaginatedResult(users, total, query.params);
  }
}
