import type { TourStep } from "../_types";

import { ENHANCE_TOUR_SITE_ID, TOUR_STEP_ID } from "@/constants";
import { $AppCharacter } from "@/services";
import { nextFrame } from "@/utils/window";
import { useCalcStore } from "@Store/calculator";
import { setTeammate, toggleTeammateEnhance, updateMain } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { $ } from "../_utils";

export function getEnhanceTourSteps(): TourStep[] {
  const TOUR_STEPS: TourStep[] = [
    {
      id: ENHANCE_TOUR_SITE_ID.mainEnhance,
      description:
        "Tap this tag to toggle the enhanced state on characters. It is a condition to show some modifier controls",
      siteGutter: 12,
      go: () => {
        $(TOUR_STEP_ID.overviewPanel).act.click();
        $(TOUR_STEP_ID.calculatorSmall).set("scrollLeft", 0);
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
    TOUR_STEPS.push(
      {
        id: ENHANCE_TOUR_SITE_ID.subEnhance(teammate.code),
        description: "Tap to toggle the enhanced state on teammates.",
        siteGutter: 12,
        go: async () => {
          if (addSlot !== undefined) {
            setTeammate(teammate, addSlot);
            await nextFrame();
          }

          // Move to setup panel on Tab layout
          $(TOUR_STEP_ID.setupPanel).act.click();

          const slot = $(TOUR_STEP_ID.teammateSlot(teammate.code)).this;
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
      },
      {
        // TODO: when there're more enhance types, we need to switch this id
        id: ENHANCE_TOUR_SITE_ID.secretRiteBuff,
        description: "This effect is a condition to show some modifier controls.",
        siteGutter: 8,
        go: async () => {
          updateMain({ enhanced: true });
          toggleTeammateEnhance(teammate.code, true);

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
