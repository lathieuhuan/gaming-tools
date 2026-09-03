import type { AppCharacter } from "@/types";

import { SCREEN_PATH } from "@/constants";
import { router } from "@/lib/router";
import { CalcSetup } from "@/logic/calculator";
import { createCharacter, createTeammate } from "@/logic/entity.logic";
import { $AppCharacter } from "@/services";
import { initSession } from "@Store/calculator/actions";

export function prepEnhanceTour() {
  const characters = $AppCharacter.getAll();
  let appMain: AppCharacter | undefined = undefined;
  let appTeammate: AppCharacter | undefined = undefined;

  for (const character of characters) {
    if (appMain) {
      if (character.enhanceType === appMain.enhanceType) {
        appTeammate = character;
        break;
      }
    } else if (character.enhanceType) {
      appMain = character;
    }
  }

  if (!appMain || !appTeammate) return;

  const main = createCharacter({ code: appMain.code }, appMain);
  const calcSetup = CalcSetup.create(Date.now(), main, {
    teammates: [createTeammate({ code: appTeammate.code }, appTeammate)],
  });

  initSession({
    calcSetup,
  });

  router.navigate({
    to: SCREEN_PATH.CALCULATOR,
  });
}
