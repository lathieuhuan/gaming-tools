import { Modal } from "rond";
import { ARTIFACT_TYPES } from "@Backend";

import { useStoreSnapshot } from "@Src/features";
import { $AppArtifact } from "@Src/services";
import { SetupOption, SetupOptions } from "./SetupOptions";

interface CalcSetupSelectProps {
  onSelect: (setup: SetupOption) => void;
}
export function CalcSetupSelect(props: CalcSetupSelectProps) {
  const setups = useStoreSnapshot((state) => {
    const { setupManageInfos, setupsById } = state.calculator;
    return setupManageInfos.map<SetupOption>((info) => {
      const { char, weapon, artifacts, party } = setupsById[info.ID];

      const setupOption: SetupOption = {
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
          const setupOptionMember: SetupOption["members"][number] = {
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
          }
        }
      }

      return setupOption;
    });
  });

  return (
    <>
      <Modal.Header withDivider>Select Setup</Modal.Header>

      <div className="p-4">
        <SetupOptions setups={setups} onSelect={props.onSelect} />
      </div>
    </>
  );
}
