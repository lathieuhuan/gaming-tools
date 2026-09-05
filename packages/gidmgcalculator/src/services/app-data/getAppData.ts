import type { StandardResponse } from "../types";
import type { AppData } from "./types";

import { IS_DEV_ENV } from "@/constants/config";
import { AppDataServiceError } from "./errors";

const baseUrl = IS_DEV_ENV ? "http://localhost:3000/api" : "https://gidmgcalculator.vercel.app/api";

export async function getAppData(): Promise<StandardResponse<AppData>> {
  const response = await fetch(`${baseUrl}/meta-data`);

  if (response.ok) {
    return (await response.json()) as StandardResponse<AppData>;
  }

  // const data = await response.json();

  throw new AppDataServiceError(500, "Internal server error.", { cooldown: 60 });
}
