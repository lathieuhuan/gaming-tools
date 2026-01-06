import { RefCallback } from "react";
import { MdEdit } from "react-icons/md";

import type { AppCharacter, ICharacterBasic } from "@/types";
import type { CharacterSavingStep, SaveOutput } from "./_types";

import { genNewEntityMessage, getDifferentEntityMessage, CONTINUE_MSG } from "../_config";

import { CharacterPortrait } from "@/components";
import { EntityComparer } from "../_components/EntityComparer";
import { SavingStepLayout } from "../_components/SavingStepLayout";

export type SaveCharacterStepProps = {
  step: CharacterSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction?: (output: NonNullable<SaveOutput["character"]>) => void;
};

export function SaveCharacterStep({ step, ctaRef, onAction }: SaveCharacterStepProps) {
  const { config, data: character } = step;

  switch (config.status) {
    case "NEW":
    case "UNCHANGED":
      const isNew = config.status === "NEW";
      const message = isNew ? genNewEntityMessage("Character") : "This character is unchanged.";

      return (
        <SavingStepLayout
          className="h-full p-4"
          message={`${message} ${CONTINUE_MSG}`}
          continueRef={ctaRef}
          onContinue={() => {
            onAction?.({
              action: isNew ? "CREATE" : "NONE",
              character: character.basic,
            });
          }}
        >
          <Overview character={character.basic} data={character.data} />
        </SavingStepLayout>
      );
    case "CHANGED": {
      return (
        <SavingStepLayout
          className="h-full p-4"
          message={getDifferentEntityMessage("Character")}
          actions={[
            {
              refProp: ctaRef,
              children: "Update",
              icon: <MdEdit />,
              onClick: () => {
                onAction?.({
                  action: "UPDATE",
                  character: character.basic,
                });
              },
            },
          ]}
          continueText="Keep"
          onContinue={() => {
            onAction?.({
              action: "NONE",
              character: character.basic,
            });
          }}
        >
          <EntityComparer
            items={[
              {
                label: "Current",
                children: <Overview character={config.existedCharacter} data={character.data} />,
              },
              {
                label: "To be saved",
                children: <Overview character={character.basic} data={character.data} />,
              },
            ]}
          />
        </SavingStepLayout>
      );
    }
    default:
      return null;
  }
}

type OverviewProps = {
  character: ICharacterBasic;
  data: AppCharacter;
};

function Overview({ character, data }: OverviewProps) {
  const elmtText = `text-${data.vision}`;

  return (
    <div
      data-slot="character-overview"
      className="p-4 rounded-md bg-dark-1 flex items-center gap-3"
    >
      <CharacterPortrait zoomable={false} info={{ icon: data.icon }} />
      <div>
        <p className={`text-xl font-bold ${elmtText}`}>{character.name}</p>
        <div className="flex items-center gap-1">
          <span>
            <span className="text-light-4">Level:</span>{" "}
            <span className="font-medium">{character.level}</span>
          </span>
          <span className="text-dark-line">|</span>
          <span className="font-medium">C{character.cons}</span>
        </div>
        <p>
          <span className="text-light-4">Talents:</span>{" "}
          <span className="font-medium">
            {character.NAs} - {character.ES} - {character.EB}
          </span>
        </p>
      </div>
    </div>
  );
}
