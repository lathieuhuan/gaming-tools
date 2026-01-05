import { IS_DEV_ENV } from "@/constants/config";
import { mock } from "./mock";
import { GenshinUserResponse } from "./types";
import { transformResponse } from "./transform";
import IdStore from "@/utils/IdStore";
import { delay } from "@/utils/pure-utils";

export * from "./types";

const baseUrl = IS_DEV_ENV ? "http://localhost:3001" : "https://gicalculator.ronqueroc.com";

export async function getGenshinUser(uid: string) {
  const timeStart = Date.now();
  const idStore = new IdStore(timeStart);

  const user = transformResponse(mock, idStore);
  const timeEnd = Date.now();
  const elapsedTime = timeEnd - idStore.latest;

  // If the number of ids generated is more than the time this transformResponse took,
  // we need to wait to avoid generating duplicate ids
  if (elapsedTime < 0) {
    await delay(-elapsedTime);
  }

  return user;

  // const response = await fetch(`${baseUrl}/enka/uid/${uid}`);

  // if (response.ok) {
  //   const res: GenshinUserResponse = await response.json();

  //   const timeStart = Date.now();
  //   const idStore = new IdStore(timeStart);

  //   const user = transformResponse(res, idStore);
  //   const timeEnd = Date.now();
  //   const elapsedTime = timeEnd - idStore.latest;

  //   // If the number of ids generated is more than the time this transformResponse took,
  //   // we need to wait to avoid generating duplicate ids
  //   if (elapsedTime < 0) {
  //     await delay(-elapsedTime);
  //   }

  //   return user;
  // }

  // throw await response.json();
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
