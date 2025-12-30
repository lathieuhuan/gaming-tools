import { RefCallback, useRef, useState } from "react";
import { CarouselSpace, notification } from "rond";

import type { IArtifactBasic, ICharacterBasic, IWeaponBasic } from "@/types";
import type { SaveOutput, SavingStep } from "./_types";

import { useTranslation } from "@/hooks/useTranslation";
import { Weapon } from "@/models/base";
import { GenshinUserBuild } from "@/services/enka";
import { useStore } from "@/systems/dynamic-store";
import IdStore from "@/utils/IdStore";
import { useDispatch } from "@Store/hooks";
import { addUserArtifact, addUserWeapon } from "@Store/userdb-slice";

import { SaveArtifactStep } from "./SaveArtifactStep";
import { SaveCharacterStep, SaveCharacterStepProps } from "./SaveCharacterStep";
import { SaveWeaponStep, SaveWeaponStepProps } from "./SaveWeaponStep";
import { SaverLayout } from "../_components/SaverLayout";

/**
 * When the character is gonna be saved, we keep the items' ids for when
 * the character is actually saved, we can update the items' owner.
 * If users do not save the character, these items will not have owner.
 */
type TempData = {
  equippedAtfIds: number[];
};

type SavingStepperProps = {
  steps: SavingStep[];
  onComplete?: () => void;
};

export function SavingStepper({ steps, onComplete }: SavingStepperProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const store = useStore();
  const idStore = useRef(new IdStore());
  const saveOutput = useRef<SaveOutput>({});

  const [currIndex, setCurrIndex] = useState(0);

  const tempData = useRef<TempData>({
    equippedAtfIds: [],
  });

  const handleCompleteStep = () => {
    const nextIndex = currIndex + 1;

    if (steps[nextIndex]) {
      setCurrIndex(nextIndex);
      return;
    }

    console.log(saveOutput.current);
    onComplete?.();
  };

  const handleCharacterSave: SaveCharacterStepProps["onAction"] = (output) => {
    saveOutput.current.character = output;
    handleCompleteStep();
  };

  const handleSaveWeapon: SaveWeaponStepProps["onAction"] = (output) => {
    saveOutput.current.weapon = output;
    handleCompleteStep();
  };

  const handleSaveArtifact = (artifact: IArtifactBasic) => {
    tempData.current.equippedAtfIds.push(artifact.ID);
    dispatch(addUserArtifact(artifact));

    notification.success({
      content: "Artifact saved successfully!",
    });
    handleCompleteStep();
  };

  const getStepContent = (step: SavingStep, shouldFocus: boolean): React.JSX.Element => {
    //
    const ctaRef: RefCallback<HTMLButtonElement> = (button) => {
      if (shouldFocus) {
        button?.focus({ preventScroll: true });
      }
    };

    switch (step.type) {
      case "CHARACTER":
        return <SaveCharacterStep step={step} ctaRef={ctaRef} onAction={handleCharacterSave} />;

      case "WEAPON":
        return (
          <SaveWeaponStep
            className="h-full custom-scrollbar"
            step={step}
            ctaRef={ctaRef}
            onAction={handleSaveWeapon}
          />
        );

      case "ARTIFACT": {
        return (
          <SaveArtifactStep
            className="h-full custom-scrollbar"
            {...step}
            store={store}
            idStore={idStore.current}
            onSave={handleSaveArtifact}
            onSkip={handleCompleteStep}
            ctaRef={ctaRef}
          />
        );
      }
    }
  };

  const currentStep = steps[currIndex];

  return (
    <SaverLayout
      type={currentStep?.type}
      atfType={currentStep?.type === "ARTIFACT" ? currentStep.data.type : undefined}
    >
      <CarouselSpace current={currIndex}>
        {steps.map((step, stepIndex) => {
          const key = step.type === "ARTIFACT" ? `${step.type}/${step.data.type}` : step.type;

          return (
            <div key={key} className="size-full">
              {getStepContent(step, stepIndex === currIndex)}
            </div>
          );
        })}
      </CarouselSpace>
    </SaverLayout>
  );
}
