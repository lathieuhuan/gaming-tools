import type { TourStep } from "../_types";

import { ENHANCE_TOUR_SITE_ID, TOUR_STEP_ID } from "@/constants";
import { $AppCharacter } from "@/services";
import { nextFrame } from "@/utils/window.utils";
import { useCalcStore } from "@Store/calculator";
import { setTeammate, toggleTeammateEnhance, updateMain } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { $ } from "../_utils";

function genTeammateStep(teammateCode: number): TourStep {
  return {
    id: ENHANCE_TOUR_SITE_ID.subEnhance(teammateCode),
    description: "Tap to toggle the enhanced state on this teammate.",
    siteGutter: 12,
    go: async () => {
      // Move to setup panel on Tab layout
      $(TOUR_STEP_ID.setupPanel).act.click();

      const slot = $(TOUR_STEP_ID.teammateSlot(teammateCode)).this;
      if (!slot) return;

      // Move to setup panel on scrollable layout
      $(TOUR_STEP_ID.calculatorSmall).set("scrollLeft", (calc) => {
        const rectChild = slot.getBoundingClientRect();
        const rectParent = calc.getBoundingClientRect();

        return calc.scrollLeft + rectChild.left - rectParent.left;
      });

      await nextFrame();

      slot.click();
    },
    lastCheck: () => {
      toggleTeammateEnhance(teammateCode, true);
    },
  };
}

function genEnhanceBuffStep(id: string): TourStep {
  return {
    id,
    description: "This effect is a condition to show some modifier controls.",
    siteGutter: 8,
    go: async () => {
      // Move to modifiers panel on Tab layout
      $(TOUR_STEP_ID.modifiersPanel).act.click();

      const triggerEl = $(TOUR_STEP_ID.teamBonus).get("firstElementChild").this;
      if (!triggerEl) return;

      // Move to modifiers panel on scrollable layout
      $(TOUR_STEP_ID.calculatorSmall).set("scrollLeft", (calc) => {
        const rectChild = triggerEl.getBoundingClientRect();
        const rectParent = calc.getBoundingClientRect();

        return calc.scrollLeft + rectChild.left - rectParent.left;
      });
      await nextFrame();

      $(TOUR_STEP_ID.buffsTab).act.click();
      await nextFrame();

      if (triggerEl instanceof HTMLElement && triggerEl.getAttribute("aria-expanded") !== "true") {
        triggerEl.click();
        await nextFrame();
      }

      triggerEl.scrollIntoView();
    },
  };
}

export function getMainEnhanceTourSteps(): TourStep[] {
  const TOUR_STEPS: TourStep[] = [
    {
      id: ENHANCE_TOUR_SITE_ID.mainEnhance,
      description:
        "Tap this tag to toggle the enhanced state the main character. It is a condition to show some modifier controls.",
      siteGutter: 12,
      go: () => {
        // Move to overview panel on Tab layout
        $(TOUR_STEP_ID.overviewPanel).act.click();

        // Move to overview panel on scrollable layout
        $(TOUR_STEP_ID.calculatorSmall).set("scrollLeft", 0);
      },
      lastCheck: () => {
        updateMain({ enhanced: true });
      },
    },
  ];

  const { main, teammates } = selectSetup(useCalcStore.getState());
  const teammateCalc = teammates.find((t) => t.data.enhanceType === main.data.enhanceType);

  if (!teammateCalc && teammates.length === 3) {
    // No teammate with the same enhance type, and slots are full
    return TOUR_STEPS;
  }

  let teammate = teammateCalc?.data;
  let addSlot: number | undefined = undefined;

  if (!teammate) {
    // No teammate with the same enhance type => add a new one
    teammate = $AppCharacter
      .getAll()
      .find(
        (c) =>
          c.enhanceType === main.data.enhanceType &&
          c.code !== main.code &&
          teammates.every((t) => t.data.code !== c.code)
      );

    addSlot = teammates.length;
  }

  if (teammate) {
    const activateTeammateStep = genTeammateStep(teammate.code);

    TOUR_STEPS.push(
      {
        ...activateTeammateStep,
        sitePrep: () => {
          if (addSlot !== undefined) {
            setTeammate(teammate, addSlot);
          }
        },
      },
      // TODO: when there're more enhance types, we need to switch this id
      genEnhanceBuffStep(ENHANCE_TOUR_SITE_ID.secretRiteBuff)
    );
  }

  return TOUR_STEPS;
}

export function getSubEnhanceTourSteps(): TourStep[] {
  const TOUR_STEPS: TourStep[] = [];

  const { teammates } = selectSetup(useCalcStore.getState());
  const teammate1 = teammates.find((t) => t.data.enhanceType)?.data;

  if (!teammate1) {
    return TOUR_STEPS;
  }

  TOUR_STEPS.push(genTeammateStep(teammate1.code));

  let teammate2Calc = teammates.find(
    (t) => t.data.enhanceType === teammate1.enhanceType && t.data.code !== teammate1.code
  );

  if (!teammate2Calc && teammates.length === 3) {
    // No other teammate with the same enhance type, or slots are full
    return TOUR_STEPS;
  }

  let teammate2 = teammate2Calc?.data;
  let addSlot: number | undefined = undefined;

  if (!teammate2) {
    teammate2 = $AppCharacter
      .getAll()
      .find(
        (c) =>
          c.enhanceType === teammate1.enhanceType && teammates.every((t) => t.data.code !== c.code)
      );

    addSlot = teammates.length;
  }

  if (teammate2) {
    const activateTeammate2Step = genTeammateStep(teammate2.code);

    TOUR_STEPS.push(
      {
        ...activateTeammate2Step,
        sitePrep: () => {
          if (addSlot !== undefined) {
            setTeammate(teammate2, addSlot);
          }
        },
      },
      // TODO: when there're more enhance types, we need to switch this id
      genEnhanceBuffStep(ENHANCE_TOUR_SITE_ID.secretRiteBuff)
    );
  }

  return TOUR_STEPS;
}
