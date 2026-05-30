# Project Dolphin — Backend DDD

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 |
| ORM | TypeORM 1.0 (PostgreSQL) |
| Auth | Firebase Admin SDK (JWT verification) |
| CQRS | `@nestjs/cqrs` — CommandBus / QueryBus / EventPublisher |
| Validation | class-validator + class-transformer |
| Config | `@nestjs/config` + Joi schema validation |
| Logger | Winston via `nest-winston` (global, structured) |
| Throttling | `@nestjs/throttler` — `default` (100 req/min) and `strict` (10 req/min) |
| Docs | Swagger (non-production only) |

---

## Architecture

```
src/
  contexts/               ← vertical bounded contexts
    iam/                  ← Identity & Access Management
    audit/                ← Domain event auditing
  infrastructure/         ← shared global infrastructure
    config/               ← configuration.ts + config.validation.ts
    database/             ← typeorm.module.ts + data-source.ts + migrations/
    logger/               ← logger.module.ts + winston.config.ts
  shared/                 ← reusable abstractions across contexts
    domain/               ← Entity, AggregateRootBase, ValueObject, IRepository, DomainEvent
      events/             ← domain events consumed by more than one bounded context
    application/          ← CommandBase, QueryBase
    infrastructure/       ← TypeOrmRepositoryBase
    exceptions/           ← DomainException, NotFound, Conflict, Validation, typeorm-error.handler
    http/
      filters/            ← AllExceptionsFilter
      interceptors/       ← LoggingInterceptor, TransformInterceptor
      middleware/         ← RequestIdMiddleware
      health/             ← HealthController, HealthModule
    utils/                ← Result<T,E>, PaginatedResult, toPaginatedResult
  app.module.ts
  main.ts
```

### Internal structure of each bounded context

```
src/contexts/<context>/
  domain/
    <aggregate>/
      <aggregate>.aggregate.ts      ← extends AggregateRootBase
      <aggregate>.repository.interface.ts
      <value-object>.value-object.ts
    events/                         ← domain events
    exceptions/                     ← domain exceptions
  application/
    commands/                       ← <action>.command.ts + <action>.handler.ts
    queries/                        ← <query>.query.ts + <query>.handler.ts
  infrastructure/
    persistence/
      <entity>.orm-entity.ts        ← TypeORM entity
      <entity>.repository.ts        ← repository implementation
    (firebase/, cache/, etc.)
  interface/
    controllers/
    decorators/
    dto/
    guards/
    types/
  test/
    builders/                       ← test builders for domain objects
    fakes/                          ← in-memory fake repositories (no mocks)
  <context>.module.ts               ← imported in AppModule
```

---

## Path Aliases

Configured in `tsconfig.json` and `jest` config:

| Alias | Resolves to |
|-------|------------|
| `@shared/*` | `src/shared/*` |
| `@iam/*` | `src/contexts/iam/*` |
| `@infrastructure/*` | `src/infrastructure/*` |

---

## Security

- **`FirebaseAuthGuard`** (APP_GUARD) — verifies Firebase JWT, loads user + role + permissions in a single JOIN query, attaches `AuthUser` to the request.
- **`PermissionsGuard`** (APP_GUARD) — checks permissions from `AuthUser.permissions` (already loaded by the previous guard, no extra query).
- **`@Public()`** — marks endpoints that skip auth (e.g. health check).
- **`@RequirePermissions(...)`** — declares required permissions on an endpoint.
- **Guard order**: `ThrottlerGuard → FirebaseAuthGuard → PermissionsGuard`.

---

## CQRS and Domain Events

### Commands and Queries

- Handlers are registered as `providers` in the context module.
- Commands/queries are dispatched from controllers via `CommandBus.execute()` / `QueryBus.execute()`.

### Domain Events

Flow: aggregate → `apply(event)` → handler calls `publisher.mergeObjectContext(aggregate)` → after `save`, calls `aggregate.commit()` → `@EventsHandler` decorators in the receiving module pick up the event.

**Important**: a module that listens to events from another context (e.g. `AuditModule` listening to `IamModule` events) only needs to import `CqrsModule` — it does not import the source module. Events travel through the NestJS CQRS global bus.

**Cross-context events**: if a domain event is consumed by more than one bounded context, move it to `src/shared/domain/events/` and import it with `@shared/domain/events/<event-name>.event`. Events that are only emitted and handled within the same context can stay in `src/contexts/<context>/domain/events/`.

---

## HTTP Response Shape

All responses pass through `TransformInterceptor`:

- **Single resource**: `{ data: { id, ... } }`
- **Paginated collection**: `{ data: [...], meta: { total, page, limit, totalPages } }`
- **Empty** (204 No Content): no body.

Use `toPaginatedResult(data, total, params)` from `@shared/utils/pagination` in query handlers that return lists.

---

## Error Handling

Domain exceptions (`DomainException` and subclasses) are mapped to HTTP status codes in `AllExceptionsFilter`:

| Exception | HTTP |
|-----------|------|
| `NotFoundDomainException` | 404 |
| `ConflictDomainException` | 409 |
| `ValidationDomainException` | 422 |
| `DomainException` (base) | 400 |
| `HttpException` (NestJS) | its own status |
| Any unexpected error | 500 |

4xx errors are logged as `warn`, 5xx errors as `error`.

---

## Guidelines for New Contexts

### 1. Directory structure

Create `src/contexts/<new-context>/` following the same layout as `iam/`.

### 2. Module

- Create `<context>.module.ts` and import it in `AppModule`.
- Import `CqrsModule` and `TypeOrmModule.forFeature([...])` in the module.
- Register every handler as a provider.
- Use injection tokens for repositories.

### 3. Repositories — MUST extend `TypeOrmRepositoryBase`

Every repository that implements CRUD must extend `TypeOrmRepositoryBase`:

```typescript
@Injectable()
export class ProductRepository
  extends TypeOrmRepositoryBase<ProductOrmEntity, Product>
  implements IProductRepository
{
  constructor(
    @InjectRepository(ProductOrmEntity)
    repo: Repository<ProductOrmEntity>,
  ) {
    super(repo);
  }

  // Implement the abstract methods:
  toDomain(entity: ProductOrmEntity): Product { ... }
  toOrm(product: Product): ProductOrmEntity { ... }

  // Additional repository methods:
  async findBySku(sku: string): Promise<Product | null> { ... }
}
```

The base provides `findById`, `save` (with error handling), and `delete` (with error handling).

**Exception**: write-only repositories (like `AuditLogRepository`) have no `findById` or `delete` and do not extend the base — they implement their interface directly.

**Important**: if your `toDomain` needs relations (e.g. a `Category` with `tags`), override `findById` to include them explicitly:

```typescript
async findById(id: string): Promise<Product | null> {
  const entity = await this.repo.findOne({
    where: { id },
    relations: { category: true },
  });
  return entity ? this.toDomain(entity) : null;
}
```

Never use `eager: true` on ORM entities — always load relations explicitly with `relations: { ... }`.

### 4. Aggregates

```typescript
export class Product extends AggregateRootBase<string> {
  private constructor(props: ProductProps, id: string, ...) {
    super(id, createdAt, updatedAt);
  }

  // Factory for creation (emits domain event).
  // If creation can fail validation, return Result<Product, DomainException>
  // instead of throwing — callers decide how to handle the error.
  static create(props: CreateProductProps): Result<Product, InvalidSkuException> {
    const skuResult = Sku.create(props.sku);
    if (skuResult.isErr) return err(skuResult.error);

    const product = new Product({ ...props, sku: skuResult.value }, crypto.randomUUID());
    product.apply(new ProductCreatedEvent(...));
    return ok(product);
  }

  // Factory for reconstitution from DB (no event)
  static reconstitute(props, id, createdAt, updatedAt): Product {
    return new Product(props, id, createdAt, updatedAt);
  }
}
```

### 5. Permissions

Add the new context's permissions in `src/contexts/iam/domain/permission/permissions.ts` and run the seed to populate them in the database.

### 6. Tests

Create `test/builders/` and `test/fakes/` mirroring the `iam/` context. Fakes implement the repository interface in memory — do not use jest mocks for repositories.

```typescript
export class FakeProductRepository implements IProductRepository {
  private store: Product[] = [];
  seed(p: Product) { this.store.push(p); }
  all() { return [...this.store]; }
  async findById(id: string) { return this.store.find(p => p.id === id) ?? null; }
  async save(p: Product) { /* upsert */ }
  async delete(id: string) { this.store = this.store.filter(p => p.id !== id); }
}
```

### 7. Migrations

Never use `synchronize: true`. Generate a migration after every schema change:

```bash
pnpm migration:generate src/infrastructure/database/migrations/<DescriptiveName>
pnpm migration:run
```

---

## Useful Scripts

```bash
pnpm start:dev          # development with watch mode
pnpm test               # unit tests
pnpm test:cov           # test coverage
pnpm build              # TypeScript compilation
NAME=MigrationName pnpm migration:generate # generate migration
pnpm migration:run      # run pending migrations
pnpm migration:revert   # revert last migration
pnpm seed               # seed base data (roles, permissions)
```

---

## Required Environment Variables

See `.env.sample`. Validated with Joi in `src/infrastructure/config/config.validation.ts`:

- `PORT`, `NODE_ENV`, `CORS_ORIGINS`
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
