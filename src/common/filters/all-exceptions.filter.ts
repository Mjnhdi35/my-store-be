import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getResponse<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const error = {
      code: this.getCode(status),
      message: this.getMessage(exception),
    };

    this.logger.error(error.message);

    response.status(status).json({
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }

  private getCode(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }
      if (typeof exceptionResponse === 'object') {
        return (exceptionResponse as any).message || 'An error occurred';
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'An unexpected error occurred';
  }
}
