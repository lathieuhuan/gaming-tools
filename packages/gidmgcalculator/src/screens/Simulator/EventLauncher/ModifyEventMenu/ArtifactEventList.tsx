import type { MemberOperations } from "../../models/Team";

import { triggerArtifactBuffEvent, updateAbilityInputs } from "../../actions/build";
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

  const handleTrigger = (modId: number, itemId: number, inputs: number[]) => {
    triggerArtifactBuffEvent({
      performer: memberOps.member.code,
      modId,
      itemId,
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

          const modInputId = set.bonusLv * 1000 + buff.id;
          const inputs = inputsById[modInputId] || [];

          return (
            <BuffEventItem
              key={modInputId}
              heading={`${data.name}`}
              description={memberOps.show.artifactBuffText(buff, data)}
              inputs={inputs}
              inputConfigs={buff.inputConfigs}
              onInputChange={(inputIndex, value) => {
                handleInputChange(modInputId, inputIndex, value);
              }}
              onTrigger={() => handleTrigger(buff.id, data.code, inputs)}
            />
          );
        });
      })}
    </div>
  );
}
