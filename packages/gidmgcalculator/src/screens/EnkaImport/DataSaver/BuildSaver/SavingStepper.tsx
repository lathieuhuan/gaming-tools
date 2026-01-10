import { RefCallback, useRef, useState } from "react";
import { CarouselSpace, notification } from "rond";

import type { SaveOutput, SavingSteps } from "./_types";

import { useSaveOutputHandler } from "./_hooks";

import { SaverLayout } from "../_components/SaverLayout";
import { SaveArtifactStep } from "./SaveArtifactStep";
import { SaveCharacterStep } from "./SaveCharacterStep";
import { SaveWeaponStep } from "./SaveWeaponStep";

type SavingStepperProps = {
  steps: SavingSteps;
  onComplete?: () => void;
};

export function SavingStepper({ steps, onComplete }: SavingStepperProps) {
  const [currIndex, setCurrIndex] = useState(0);
  const [atfSavePendingCount, setAtfSavePendingCount] = useState(0);
  const saveOutput = useRef<SaveOutput>({});

  const handleSaveOutput = useSaveOutputHandler();

  const handleCompleteStep = () => {
    const nextIndex = currIndex + 1;

    if (steps[nextIndex]) {
      setCurrIndex(nextIndex);
      return;
    }

    const {
      character: characterOutput,
      weapon: weaponOutput,
      artifacts: artifactsOutput = [],
    } = saveOutput.current;

    if (characterOutput && weaponOutput) {
      handleSaveOutput(characterOutput, weaponOutput, artifactsOutput, steps);

      notification.success({
        content: `This ${characterOutput.character.name}'s build has been saved successfully.`,
      });
    }

    onComplete?.();
  };

  const getStepContent = (step: SavingSteps[number], shouldFocus: boolean): React.ReactNode => {
    //
    const ctaRef: RefCallback<HTMLButtonElement> = (button) => {
      // if (shouldFocus) {
      //   button?.focus({ preventScroll: true });
      // }
    };

    switch (step.type) {
      case "CHARACTER":
        return (
          <SaveCharacterStep
            step={step}
            ctaRef={ctaRef}
            onAction={(output) => {
              saveOutput.current.character = output;
              handleCompleteStep();
            }}
          />
        );
      case "WEAPON":
        return (
          <SaveWeaponStep
            className="h-full custom-scrollbar"
            step={step}
            ctaRef={ctaRef}
            onAction={(output) => {
              saveOutput.current.weapon = output;
              handleCompleteStep();
            }}
          />
        );
      case "ARTIFACT": {
        return (
          <SaveArtifactStep
            className="h-full custom-scrollbar"
            step={step}
            savePendingCount={atfSavePendingCount}
            ctaRef={ctaRef}
            onAction={(output) => {
              if (output.action === "CREATE") {
                setAtfSavePendingCount(atfSavePendingCount + 1);
              }

              const newArtifacts = saveOutput.current.artifacts ?? [];
              newArtifacts.push(output);

              saveOutput.current.artifacts = newArtifacts;
              handleCompleteStep();
            }}
          />
        );
      }

      default:
        return null;
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
