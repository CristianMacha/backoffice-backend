import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { IRepository } from '../domain/repository.interface';
import { handleTypeOrmError } from '../exceptions/typeorm-error.handler';

export abstract class TypeOrmRepositoryBase<
  TEntity extends ObjectLiteral,
  TDomain,
  TId = string,
> implements IRepository<TDomain, TId> {
  constructor(protected readonly repo: Repository<TEntity>) {}

  abstract toDomain(ormEntity: TEntity): TDomain;
  abstract toOrm(domain: TDomain): TEntity;

  async findById(id: TId): Promise<TDomain | null> {
    const entity = await this.repo.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(domain: TDomain): Promise<void> {
    try {
      await this.repo.save(this.toOrm(domain));
    } catch (error) {
      handleTypeOrmError(error);
    }
  }

  async delete(id: TId): Promise<void> {
    try {
      await this.repo.delete(id as string);
    } catch (error) {
      handleTypeOrmError(error);
    }
  }
}
