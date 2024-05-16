import { $AppCharacter } from "@Src/services";
import { useQuery } from "./useQuery";

export function useAppCharacter(name = "") {
  return useQuery([name], ([name]) => $AppCharacter.fetch(name), { auto: name !== "" });
}
