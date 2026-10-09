import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { env } from '../../common/env.js';
import { ApiError, codeForStatus, errorBody } from '../../common/errors/api-error.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiException');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ApiError) {
      response
        .status(exception.status)
        .json(errorBody(exception.code, exception.message, exception.details));
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      let message = exception.message || 'Request failed';
      let details: unknown;

      if (payload && typeof payload === 'object') {
        const record = payload as { message?: string | string[]; error?: string };
        if (Array.isArray(record.message)) {
          details = record.message;
          message = record.error ?? 'Validation failed';
        } else if (typeof record.message === 'string') {
          message = record.message;
        }
      } else if (typeof payload === 'string') {
        message = payload;
      }

      response.status(status).json(errorBody(codeForStatus(status), message, details));
      return;
    }

    const error = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(error.message, error.stack);
    response.status(500).json(
      errorBody(
        'INTERNAL_ERROR',
        env.isProduction ? 'An unexpected error occurred' : error.message || 'Unexpected error',
      ),
    );
  }
}
