import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import { GenshinUser, getGenshinUser } from "@/services/enka";

type UseGenshinUserOptions = Omit<UndefinedInitialDataOptions<GenshinUser>, "queryKey" | "queryFn">;

export const STALE_TIME = 65 * 1000;

export function useGenshinUser(uid: string = "", options: UseGenshinUserOptions) {
  return useQuery({
    queryKey: ["genshin-users", uid],
    queryFn: () => getGenshinUser(uid),
    staleTime: STALE_TIME,
    ...options,
    enabled: !!uid && options.enabled,
  });
}
