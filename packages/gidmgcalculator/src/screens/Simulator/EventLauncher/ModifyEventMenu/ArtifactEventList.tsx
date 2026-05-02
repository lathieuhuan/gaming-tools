import type { ArtifactBuff, WeaponBuff } from "@/types";
import type { MemberOperations } from "../../models/Team";

import {
  triggerArtifactBuffEvent,
  triggerWeaponBuffEvent,
  updateAbilityInputs,
} from "../../actions/build";
import { selectModInputs, useSimulatorStore } from "../../store";

import { BuffEventItem } from "./BuffEventItem";

type ArtifactEventListProps = {
  memberOps: MemberOperations;
};

export function ArtifactEventList({ memberOps }: ArtifactEventListProps) {
  const inputsById = useSimulatorStore(selectModInputs("ARTIFACT_BUFF"));

  const { sets } = memberOps.member.atfGear;

  const handleInputChange = (modId: number, inputIndex: number, value: number) => {
    updateAbilityInputs("ARTIFACT_BUFF", modId, (inputs) => {
      const newInputs = inputs.length ? [...inputs] : [];
      newInputs[inputIndex] = value;

      return newInputs;
    });
  };

  const handleTrigger = (modId: number, inputs: number[]) => {
    triggerArtifactBuffEvent({
      performer: memberOps.member.code,
      modId,
      inputs,
    });
  };

  return (
    <div className="space-y-2">
      {sets.map((set) => {
        const { data } = set;

        return data.buffs?.map((buff) => {
          const atBonusLv = buff.bonusLv ?? 1;

          if (set.bonusLv < atBonusLv) {
            return null;
          }

          const inputs = inputsById[buff.id] || [];

          return (
            <BuffEventItem
              key={buff.id}
              heading={`${data.name}`}
              description={memberOps.show.artifactBuffText(buff, data)}
              inputs={inputs}
              inputConfigs={buff.inputConfigs}
              onInputChange={(inputIndex, value) => handleInputChange(buff.id, inputIndex, value)}
              onTrigger={() => handleTrigger(buff.id, inputs)}
            />
          );
        });
      })}
    </div>
  );
}
