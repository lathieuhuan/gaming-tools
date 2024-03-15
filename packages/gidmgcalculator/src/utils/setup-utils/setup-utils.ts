import type { UserComplexSetup, UserSetup } from "@Src/types";

export function isUserSetup(setup: UserSetup | UserComplexSetup): setup is UserSetup {
  return ["original", "combined"].includes(setup.type);
}
