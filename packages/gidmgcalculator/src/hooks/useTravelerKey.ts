import { genAccountTravelerKey, selectTraveler } from "@Store/account-slice";
import { useSelector } from "@Store/hooks";
import { useMemo } from "react";

export function useTravelerKey() {
  const traveler = useSelector(selectTraveler);
  return useMemo(() => genAccountTravelerKey(traveler), [traveler]);
}
