import { PaginationParams } from '../../../../shared/utils/pagination';

export class GetUsersQuery {
  constructor(readonly params: PaginationParams) {}
}
