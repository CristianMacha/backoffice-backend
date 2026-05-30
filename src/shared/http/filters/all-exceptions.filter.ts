import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { DomainException } from '../../exceptions/domain.exception';
import { NotFoundDomainException } from '../../exceptions/not-found.exception';
import { ConflictDomainException } from '../../exceptions/conflict.exception';
import { ValidationDomainException } from '../../exceptions/validation.exception';
import { ErrorResponse } from '../../exceptions/error-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = req['requestId'] as string | undefined;

    const { status, errorCode, message } = this.resolveError(exception);

    if (status >= 500) {
      this.logger.error('Unhandled exception', {
        requestId,
        status,
        errorCode,
        error:
          exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
        context: 'ExceptionFilter',
      });
    } else if (status >= 400) {
      this.logger.warn('Client error', {
        requestId,
        status,
        errorCode,
        message,
        path: req.url,
        method: req.method,
        context: 'ExceptionFilter',
      });
    }

    const body: ErrorResponse = {
      statusCode: status,
      errorCode,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: req.url,
    };

    res.status(status).json(body);
  }

  private resolveError(exception: unknown): {
    status: number;
    errorCode: string;
    message: string;
  } {
    // Excepciones de dominio propias
    if (exception instanceof NotFoundDomainException) {
      return {
        status: HttpStatus.NOT_FOUND,
        errorCode: exception.errorCode,
        message: exception.message,
      };
    }
    if (exception instanceof ConflictDomainException) {
      return {
        status: HttpStatus.CONFLICT,
        errorCode: exception.errorCode,
        message: exception.message,
      };
    }
    if (exception instanceof ValidationDomainException) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errorCode: exception.errorCode,
        message: exception.message,
      };
    }
    if (exception instanceof DomainException) {
      return {
        status: HttpStatus.BAD_REQUEST,
        errorCode: exception.errorCode,
        message: exception.message,
      };
    }

    // Excepciones HTTP de NestJS (guards, pipes, etc.)
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message = this.extractHttpMessage(response);
      const errorCode = this.httpStatusToCode(exception.getStatus());
      return { status: exception.getStatus(), errorCode, message };
    }

    // Error inesperado
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private extractHttpMessage(response: string | object): string {
    if (typeof response === 'string') return response;

    // ValidationPipe devuelve { message: string[] | string, error: string }
    if ('message' in response) {
      const msg = response.message;
      if (Array.isArray(msg)) return msg.join('; ');
      if (typeof msg === 'string') return msg;
    }

    return 'Request failed';
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'HTTP_ERROR';
  }
}
