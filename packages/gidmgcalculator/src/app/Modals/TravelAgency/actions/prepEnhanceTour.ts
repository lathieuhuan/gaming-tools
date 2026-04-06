import type { AppCharacter } from "@/types";

import { SCREEN_PATH } from "@/constants";
import { router } from "@/lib/router";
import { createCharacter } from "@/logic/entity.logic";
import { CalcSetup, Team, TeammateCalc } from "@/models";
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
    teammates: [
      new TeammateCalc(
        {
          code: teammate.code,
        },
        teammate,
        new Team()
      ),
    ],
  });

  initSession({
    calcSetup,
  });

  router.navigate({
    to: SCREEN_PATH.CALCULATOR,
  });
}
