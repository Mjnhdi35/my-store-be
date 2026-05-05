import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  ResponseMeta,
  ResponseType,
} from '../types/response.types';

interface ResponsePayload<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseType<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseType<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const timestamp = new Date().toISOString();
    const path = request.url;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: { timestamp, path },
      })),
    );
  }
}
