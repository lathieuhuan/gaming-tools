type ServiceErrorOptions = ErrorOptions;

export class ServiceError<T extends object | null> extends Error {
  static readonly NAME = "ServiceError" as const;

  public readonly name: string = ServiceError.NAME;
  public readonly data: T = null as T;

  constructor(
    public readonly code: number,
    message: string,
    data?: T,
    options: ServiceErrorOptions = {},
  ) {
    super(message, options);

    if (data !== undefined) {
      this.data = data;
    }
  }
}
