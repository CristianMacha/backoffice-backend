import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './infrastructure/config/configuration';
import { configValidationSchema } from './infrastructure/config/config.validation';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { TypeOrmConfigModule } from './infrastructure/database/typeorm.module';
import { IamModule } from './contexts/iam/iam.module';
import { AuditModule } from './contexts/audit/audit.module';
import { FirebaseAuthGuard } from './contexts/iam/interface/guards/firebase-auth.guard';
import { PermissionsGuard } from './contexts/iam/interface/guards/permissions.guard';
import { RequestIdMiddleware } from './shared/http/middleware/request-id.middleware';
import { HealthModule } from './shared/http/health/health.module';
import { AllExceptionsFilter } from './shared/http/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/http/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/http/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: true },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
      {
        name: 'strict',
        ttl: 60_000,
        limit: 10,
      },
    ]),
    LoggerModule,
    TypeOrmConfigModule,
    IamModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: FirebaseAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    AllExceptionsFilter,
    LoggingInterceptor,
    TransformInterceptor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
