import { clsx } from "rond";

import type { Character } from "@/models/Character";

import { AttributeTable } from "@/components/AttributeTable";
import { SetBonusesView } from "@/components/SetBonusesView";

type CharacterStatsProps = {
  className?: string;
  character: Character;
};

export function CharacterStats({ className, character }: CharacterStatsProps) {
  return (
    <div className={clsx("flex hide-scrollbar gap-8", className)}>
      <div className="w-76 flex flex-col shrink-0">
        <p className="text-lg text-center font-semibold">Attributes</p>
        <div className="mt-1 custom-scrollbar">
          <AttributeTable
            attributes={character.finalAttrs}
            attkBonusCtrl={character.attkBonusCtrl}
          />
        </div>
      </div>

      <div className="w-76 flex flex-col shrink-0">
        <p className="text-lg text-center font-semibold">Artifact Stats</p>
        <div className="mt-1 custom-scrollbar">
          <AttributeTable attributes={character.atfGear.finalAttrs} />
        </div>
      </div>

      <div className="w-72 flex flex-col shrink-0">
        <p className="text-lg text-center font-semibold">Set bonus</p>
        <div className="grow custom-scrollbar">
          <SetBonusesView hideTitle sets={character.atfGear.sets} />
        </div>
      </div>
    </div>
  );
}
