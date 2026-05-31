import { Type, applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponse } from '../../exceptions/error-response.dto';

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
  422: 'Unprocessable entity',
  429: 'Too many requests',
  500: 'Internal server error',
};

export function ApiErrorResponses(
  ...statuses: number[]
): MethodDecorator & ClassDecorator {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiExtraModels(ErrorResponse),
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: ERROR_DESCRIPTIONS[status] ?? 'Error',
        type: ErrorResponse,
      }),
    ),
  ];
  return applyDecorators(...decorators);
}

export function ApiDataResponse<T>(model: Type<T>, status = HttpStatus.OK) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        properties: {
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}

export function ApiArrayDataResponse<T>(model: Type<T>) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
  );
}

export function ApiPaginatedResponse<T>(model: Type<T>) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 100 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 20 },
              totalPages: { type: 'number', example: 5 },
            },
          },
        },
      },
    }),
  );
}
