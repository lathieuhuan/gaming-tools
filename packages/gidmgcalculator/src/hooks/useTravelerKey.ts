import { useAccountStore } from "@Store/account";
import { genAccountTravelerKey } from "@/utils/genAccountTravelerKey";
import { useMemo } from "react";

export function useTravelerKey() {
  const traveler = useAccountStore((state) => state.traveler);
  const travelerKey = useMemo(() => genAccountTravelerKey(traveler), [traveler]);

  return [travelerKey, traveler] as const;
}
