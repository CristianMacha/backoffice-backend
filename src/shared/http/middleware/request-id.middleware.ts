import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private static readonly VALID_ID = /^[\w-]{1,64}$/;

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER] as string | undefined;
    const requestId =
      incoming && RequestIdMiddleware.VALID_ID.test(incoming)
        ? incoming
        : crypto.randomUUID();
    req['requestId'] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
