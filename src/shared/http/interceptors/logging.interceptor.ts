import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, path } = req;
    const requestId = req['requestId'] as string | undefined;
    const start = Date.now();

    this.logger.info(`→ ${method} ${path}`, { requestId, context: 'HTTP' });

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.info(`← ${method} ${path} +${ms}ms`, {
            requestId,
            context: 'HTTP',
          });
        },
        error: (err: Error) => {
          const ms = Date.now() - start;
          this.logger.warn(`✗ ${method} ${path} +${ms}ms — ${err.message}`, {
            requestId,
            context: 'HTTP',
          });
        },
      }),
    );
  }
}
