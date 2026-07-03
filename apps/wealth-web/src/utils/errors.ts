import { ApiError } from '../api';

export function isNotFound(error: Error | null): boolean {
  return error instanceof ApiError && error.status === 404;
}
