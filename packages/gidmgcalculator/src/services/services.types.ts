export type StandardResponse<T> = Promise<{
  code: number;
  message?: string;
  data: T | null;
}>;
