import type { AppData } from "./types";

import { queryOptions } from "@tanstack/react-query";
import { AppDataServiceError } from "./errors";
import { getSharedAppData } from "./getSharedAppData";

export const appDataQueryOptions = queryOptions<AppData, AppDataServiceError>({
  queryKey: ["app-data"],
  queryFn: () => {
    try {
      return getSharedAppData();
    } catch (error) {
      if (error instanceof AppDataServiceError) {
        throw error;
      }

      const { message } = error instanceof Error ? error : { message: "Unknown error" };

      throw new AppDataServiceError(500, message, { cooldown: 300 });
    }
  },
  staleTime: Infinity,
});
