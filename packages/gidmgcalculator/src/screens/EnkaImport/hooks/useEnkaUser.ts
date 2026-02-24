import { EnkaUserResponse, getEnkaUser } from "@/services/enka";
import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";

type UseEnkaUserOptions = Omit<
  UndefinedInitialDataOptions<EnkaUserResponse>,
  "queryKey" | "queryFn"
>;

export function useEnkaUser(profile: string = "", options: UseEnkaUserOptions = {}) {
  return useQuery({
    queryKey: ["enka-accounts", profile],
    queryFn: () => getEnkaUser(profile),
    staleTime: 5 * 60 * 1000,
    ...options,
    enabled: !!profile && options.enabled,
  });
}
