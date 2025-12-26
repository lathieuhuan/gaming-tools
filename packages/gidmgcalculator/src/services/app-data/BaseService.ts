import type { StandardResponse } from "../services.types";

export async function fetchData<T, E = unknown>(
  url: string,
  options?: { processData?: (res: any) => T; processError?: (res: E) => string }
): StandardResponse<T> {
  const { processData, processError } = options || {};

  return await fetch(url)
    .then(async (res) => {
      const response = await res.json();

      if (res.ok) {
        return {
          code: 200,
          data: processData ? processData(response) : response?.data || null,
        };
      }

      throw {
        code: res.status,
        message: processError?.(response),
      };
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
