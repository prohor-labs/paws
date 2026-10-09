import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import compression from 'compression';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import helmet from 'helmet';
import { env } from '../../common/env.js';
import { errorBody } from '../../common/errors/api-error.js';

function runMiddleware(
  middleware: RequestHandler,
  request: Request,
  response: Response,
): Promise<void> {
  return new Promise((resolve, reject) => {
    middleware(request, response, (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

@Injectable()
export class AppPipelineMiddleware implements NestMiddleware {
  private readonly secureHeaders = helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  private readonly compress = compression();

  async use(request: Request, response: Response, next: NextFunction): Promise<void> {
    await runMiddleware(this.secureHeaders, request, response);
    await runMiddleware(this.compress, request, response);

    const incomingRequestId = request.headers['x-request-id'];
    const requestId =
      typeof incomingRequestId === 'string' && incomingRequestId.length > 0
        ? incomingRequestId
        : randomUUID();
    response.setHeader('X-Request-Id', requestId);

    const startedAt = performance.now();
    response.on('finish', () => {
      const duration = performance.now() - startedAt;
      const slowTag = duration > 500 ? ' [SLOW]' : '';
      console.info(
        `[API] ${request.method} ${request.originalUrl.split('?')[0]} ${response.statusCode} ${duration.toFixed(1)}ms${slowTag}`,
      );
    });

    if (request.method !== 'OPTIONS' && !request.originalUrl.startsWith('/api/auth') && !request.originalUrl.startsWith('/api/v1/auth')) {
      const secret = env.internalProxySecret;
      if (secret && request.headers['x-internal-proxy-secret'] !== secret) {
        response
          .status(403)
          .json(errorBody('FORBIDDEN', 'Direct access forbidden'));
        return;
      }
    }

    next();
  }
}
