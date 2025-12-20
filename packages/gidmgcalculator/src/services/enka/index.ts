import { IS_DEV_ENV } from "@/constants/config";
import { GenshinUserResponse } from "./types";
import { transformResponse } from "./transform";
export * from "./types";

const baseUrl = IS_DEV_ENV
  ? "http://localhost:3001"
  : "https://gicalculator.ronqueroc.com";

export async function getGenshinUser(uid: string) {
  const response = await fetch(`${baseUrl}/enka/uid/${uid}`);

  if (response.ok) {
    const res: GenshinUserResponse = await response.json();

    return transformResponse(res);
  }

  throw await response.json();
}

export async function updateCache() {
  const response = await fetch(`${baseUrl}/cache/update`, {
    method: "POST",
  });

  if (response.ok) {
    return await response.json();
  }

  throw await response.json();
}
