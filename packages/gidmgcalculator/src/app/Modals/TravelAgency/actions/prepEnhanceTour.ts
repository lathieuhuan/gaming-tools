import type { AppCharacter } from "@/types";

import { SCREEN_PATH } from "@/constants";
import { router } from "@/lib/router";
import { createCharacter, createTeammate } from "@/logic/entity.logic";
import { CalcSetup } from "@/models";
import { $AppCharacter } from "@/services";
import { initSession } from "@Store/calculator/actions";

export function prepEnhanceTour() {
  const characters = $AppCharacter.getAll();
  let main: AppCharacter | undefined = undefined;
  let teammate: AppCharacter | undefined = undefined;

  for (const character of characters) {
    if (main) {
      if (character.enhanceType === main.enhanceType) {
        teammate = character;
        break;
      }
    } else if (character.enhanceType) {
      main = character;
    }
  }

  if (!main || !teammate) return;

  const calcSetup = new CalcSetup({
    main: createCharacter({ code: main.code }, main),
    teammates: [createTeammate({ code: teammate.code }, teammate)],
  });

  initSession({
    calcSetup,
  });

  router.navigate({
    to: SCREEN_PATH.CALCULATOR,
  });
}
