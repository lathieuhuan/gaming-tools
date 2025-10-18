import { IS_DEV_ENV } from "@/constants";
import { GenshinUserResponse } from "./types";
import { transformResponse } from "./transform";
export * from "./types";

const baseUrl = IS_DEV_ENV
  ? "http://localhost:3001/enka"
  : "https://gicalculator.ronqueroc.com/enka";

export async function getGenshinUser(uid: string) {
  const response = await fetch(`${baseUrl}/uid/${uid}`);

  if (response.ok) {
    const res: GenshinUserResponse = await response.json();

    return transformResponse(res);
  }

  throw await response.json();
}
