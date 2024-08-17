import { ARTIFACT_TYPES } from "@Backend";

import type { CalcSetupOption, CalcSetupTeammate } from "./setup-selects-utils";
import { useStoreSnapshot } from "@Src/features";
import { $AppArtifact } from "@Src/services";
import { SetupOptions } from "./SetupOptions";

interface CalcSetupSelectProps {
  onSelect: (setup: CalcSetupOption) => void;
}
export function CalcSetupSelect(props: CalcSetupSelectProps) {
  //
  const setups = useStoreSnapshot((state) => {
    const { setupManageInfos, setupsById } = state.calculator;

    return setupManageInfos.map<CalcSetupOption>((info) => {
      const { char, weapon, artifacts, party } = setupsById[info.ID];
      const setupOption: CalcSetupOption = {
        id: info.ID,
        name: info.name,
        members: [
          {
            ...char,
            weapon,
            artifacts,
          },
        ],
      };

      for (const member of party) {
        if (member) {
          const setupOptionMember: CalcSetupTeammate = {
            name: member.name,
            weapon: member.weapon,
            artifacts: [],
          };

          if (member.artifact.code) {
            const appArtifactSet = $AppArtifact.getSet(member.artifact.code);
            const rarity = appArtifactSet ? appArtifactSet.variants[appArtifactSet.variants.length - 1] : null;

            if (rarity) {
              for (const type of ARTIFACT_TYPES) {
                setupOptionMember.artifacts.push({
                  code: member.artifact.code,
                  type,
                  rarity,
                });
              }
            }
          } else {
            setupOptionMember.artifacts = [null, null, null, null, null];
          }
          setupOption.members.push(setupOptionMember);
        }
      }

      return setupOption;
    });
  });

  return (
    <div className="p-4">
      <SetupOptions setups={setups} onSelect={props.onSelect} />
    </div>
  );
}
