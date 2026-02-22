import type { TourStep } from "@/systems/tour-guide";

import { ENHANCE_TOUR_SITE_ID, TOUR_STEP_ID } from "@/constants";
import { $AppCharacter } from "@/services";
import { nextFrame } from "@/utils/window.utils";
import { useCalcStore } from "@Store/calculator";
import { setTeammate, toggleTeammateEnhance, updateMain } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { $ } from "../_utils";

const CONDITION_TEXT = "This is a condition for some buffs & debuffs.";

function genTeammateStep(teammateCode: number): TourStep {
  return {
    id: ENHANCE_TOUR_SITE_ID.subEnhance(teammateCode),
    dialogs: [`Tap to toggle the enhanced state of this teammate. ${CONDITION_TEXT}`],
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

      if (slot.getAttribute("aria-expanded") !== "true") {
        slot.click();
      }
    },
    lastCheck: () => {
      toggleTeammateEnhance(teammateCode, true);
    },
  };
}

export function getEnhanceTourSteps(): TourStep[] {
  const TOUR_STEPS: TourStep[] = [
    {
      id: ENHANCE_TOUR_SITE_ID.mainEnhance,
      dialogs: [
        `Tap this tag to toggle the enhanced state of the main character. ${CONDITION_TEXT}`,
      ],
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
      {
        // TODO: when there're more enhance types, we need to switch this id
        id: ENHANCE_TOUR_SITE_ID.secretRiteBuff,
        dialogs: [CONDITION_TEXT],
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

          if (
            triggerEl instanceof HTMLElement &&
            triggerEl.getAttribute("aria-expanded") !== "true"
          ) {
            triggerEl.click();
            await nextFrame();
          }

          triggerEl.scrollIntoView();
        },
      }
    );
  }

  return TOUR_STEPS;
}

export function getSubEnhanceTourSteps(): TourStep[] {
  const { teammates } = selectSetup(useCalcStore.getState());
  const teammate = teammates.find((t) => t.data.enhanceType)?.data;

  return teammate ? [genTeammateStep(teammate.code)] : [];
}
