import type { StandardResponse } from "../types";

class CustomError extends Error {
  constructor(public code: number, public message: string) {
    super(message);
  }
}

type Response = {
  data: unknown;
};

export async function customFetch<T, E = unknown>(
  url: string,
  options?: { processData?: (res: Response) => T; processError?: (res: E) => string }
): StandardResponse<T> {
  const { processData, processError } = options || {};

  return fetch(url)
    .then(async (res) => {
      const response = (await res.json()) as Response;

      if (res.ok) {
        return {
          code: 200,
          data: processData ? processData(response) : (response?.data as T) || null,
        };
      }

      const errorMessage = processError?.(response as E) || "Unknown error";

      throw new CustomError(res.status, errorMessage);
    })
    .catch((err) => {
      const { code = 500, message = "Error" } = err || {};

      return {
        code,
        message,
        data: null,
      };
    });
}
