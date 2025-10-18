import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

import { GenshinUser, getGenshinUser } from "@/services/enka";

type UseGenshinUserOptions = Omit<UndefinedInitialDataOptions<GenshinUser>, "queryKey" | "queryFn">;

export function useGenshinUser(uid: string = "", options: UseGenshinUserOptions) {
  return useQuery({
    ...options,
    queryKey: ["genshin-user", uid],
    queryFn: () => getGenshinUser(uid),
    enabled: !!uid && options.enabled,
    staleTime: Infinity,
  });
}
