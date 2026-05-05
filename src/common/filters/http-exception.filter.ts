import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ApiError {
  code: string;
  message: string;
}

interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let error: ApiError;

    if (typeof exceptionResponse === 'string') {
      error = {
        code: this.getCode(status),
        message: exceptionResponse,
      };
    } else if (typeof exceptionResponse === 'object') {
      const obj = exceptionResponse as any;
      error = {
        code: obj.code || this.getCode(status),
        message: obj.message || this.getDefaultMessage(status),
      };
    } else {
      error = {
        code: this.getCode(status),
        message: this.getDefaultMessage(status),
      };
    }

    const logData = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: error.message,
    };

    this.logger.error(logData);

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

  private getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Failed',
      500: 'Internal Server Error',
    };
    return messages[status] || 'An error occurred';
  }
}
