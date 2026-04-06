import { RefCallback } from "react";
import { FaAngleDoubleRight, FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

import type { AppCharacter, RawCharacter } from "@/types";
import type { CharacterSavingStep, SaveOutput } from "./types";

import { genNewEntityText, getDifferentEntityMessage } from "../config";
import { isExactCharacter } from "../logic";

import { CharacterPortrait } from "@/components";
import { EntityComparer } from "../components/EntityComparer";
import { SavingStepLayout } from "../components/SavingStepLayout";

export type SaveCharacterStepProps = {
  step: CharacterSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction?: (output: NonNullable<SaveOutput["character"]>) => void;
};

export function SaveCharacterStep({ step, ctaRef, onAction }: SaveCharacterStepProps) {
  const { data: character, current } = step;

  const skip = () => {
    onAction?.({
      action: "NONE",
      character: character.basic,
    });
  };

  if (!current) {
    return (
      <SavingStepLayout
        className="h-full p-4"
        message={genNewEntityText("Character").message}
        actions={[
          {
            children: "Add new",
            icon: <FaPlus />,
            refProp: ctaRef,
            onClick: () => {
              onAction?.({
                action: "CREATE",
                character: character.basic,
              });
            },
          },
        ]}
      >
        <Overview character={character.basic} data={character.data} />
      </SavingStepLayout>
    );
  }

  if (isExactCharacter(character.basic, current)) {
    return (
      <SavingStepLayout
        className="h-full p-4"
        message={
          <span>
            This character is unchanged. Let's <b>Continue.</b>
          </span>
        }
        actions={[
          {
            children: "Continue",
            icon: <FaAngleDoubleRight />,
            refProp: ctaRef,
            onClick: skip,
          },
        ]}
      >
        <Overview character={character.basic} data={character.data} />
      </SavingStepLayout>
    );
  }

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
        {
          children: "Keep",
          icon: <FaAngleDoubleRight />,
          onClick: skip,
        },
      ]}
    >
      <EntityComparer
        items={[
          {
            label: "Current",
            children: <Overview character={current} data={character.data} />,
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

type OverviewProps = {
  character: RawCharacter;
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
        <p className={`text-xl font-bold ${elmtText}`}>{data.name}</p>
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
