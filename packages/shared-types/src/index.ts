export type ApiStatus = 'ok' | 'error';

export interface ApiEnvelope<TData = unknown> {
  status: ApiStatus;
  data: TData;
  requestId?: string;
}

export interface HealthCheckDto {
  service: string;
  status: ApiStatus;
  timestamp: string;
}
