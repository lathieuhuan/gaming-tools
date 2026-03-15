import { delay } from "ron-utils";

import type { EnkaUserResponse, GenshinUserResponse } from "./types";

// import { mock } from "./mock";
import IdStore from "@/utils/IdStore";
import { transformGenshinUserResponse } from "./transform";

const baseUrl = "https://gicalculator.ronqueroc.com";

export async function getGenshinUser(uid: string) {
  // const timeStart = Date.now();
  // const idStore = new IdStore(timeStart);

  // const user = transformResponse(mock, idStore);
  // const timeEnd = Date.now();
  // const elapsedTime = timeEnd - idStore.latest;

  // // If the number of ids generated is more than the time this transformResponse took,
  // // we need to wait to avoid generating duplicate ids
  // if (elapsedTime < 0) {
  //   await delay(-elapsedTime);
  // }

  // return user;

  const response = await fetch(`${baseUrl}/enka/uid/${uid}`);

  if (response.ok) {
    const res: GenshinUserResponse = await response.json();

    const timeStart = Date.now();
    const idStore = new IdStore(timeStart);

    const user = transformGenshinUserResponse(res, idStore);
    const timeEnd = Date.now();
    const elapsedTime = timeEnd - idStore.latest;

    // If the number of ids generated is more than the time this transformResponse took,
    // we need to wait to avoid generating duplicate ids
    if (elapsedTime < 0) {
      await delay(-elapsedTime);
    }

    return user;
  }

  throw await response.json();
}

export async function getEnkaUser(profile: string): Promise<EnkaUserResponse> {
  const response = await fetch(`${baseUrl}/enka/profile/${profile}`);

  return await response.json();
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
