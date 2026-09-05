import { queryOptions } from "@tanstack/react-query";

import { ServiceError } from "../ServiceError";
import { getCharacter } from "./service";
import { selectConsDescription, selectTalentDescriptions } from "./transform";
import type { CharacterResponseData } from "./types";

export const talentQueryOptions = (code: number) =>
  queryOptions<CharacterResponseData, ServiceError<null>, string[]>({
    queryKey: ["genshin-dev", "character", code],
    queryFn: () => getCharacter(code),
    staleTime: Infinity,
    select: selectTalentDescriptions,
  });

export const consQueryOptions = (code: number) =>
  queryOptions<CharacterResponseData, ServiceError<null>, string[]>({
    queryKey: ["genshin-dev", "character", code],
    queryFn: () => getCharacter(code),
    staleTime: Infinity,
    select: selectConsDescription,
  });
