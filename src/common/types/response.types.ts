export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta: ResponseMeta;
}

export interface ResponseMeta {
  timestamp: string;
  path: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ResponseMeta;
}

export type ResponseType<T = any> = ApiResponse<T> | ApiErrorResponse;
