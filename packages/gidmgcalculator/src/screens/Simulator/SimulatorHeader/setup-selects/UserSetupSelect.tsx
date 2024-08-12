import type { RequiredPick } from "rond";
import { ARTIFACT_TYPES } from "@Backend";

import type { CalcCharacter, Teammate } from "@Src/types";
import { useStoreSnapshot } from "@Src/features";
import { $AppArtifact } from "@Src/services";
import { Setup_, findById } from "@Src/utils";
import { calcSetupToOption, type CalcSetupOption } from "./setup-selects-utils";
import { SetupOptions, type SetupOption, type SetupOptionMember } from "./SetupOptions";

type UserSetupOptionMember = RequiredPick<CalcCharacter, "name"> & Pick<SetupOptionMember, "weapon" | "artifacts">;

export type UserSetupOption = Pick<SetupOption, "id" | "name" | "isComplex"> & {
  members: UserSetupOptionMember[];
};

interface UserSetupSelectProps {
  onSelect: (setup: UserSetupOption | CalcSetupOption) => void;
}
export function UserSetupSelect(props: UserSetupSelectProps) {
  //
  const setupOptions = useStoreSnapshot((state) => {
    const { userWps, userArts, userSetups = [] } = state.userdb;
    const options: (UserSetupOption | CalcSetupOption)[] = [];

    for (const setup of userSetups) {
      const option: UserSetupOption = {
        id: setup.ID,
        name: setup.name,
        members: [],
      };

      if (!Setup_.isUserSetup(setup)) {
        const mergedMembers: Record<string, Teammate> = {};

        option.isComplex = true;

        for (const id of Object.values(setup.allIDs)) {
          const memberSetup = findById(userSetups, id);

          if (memberSetup && Setup_.isUserSetup(memberSetup)) {
            const { weapon, artifacts } = Setup_.getUserSetupItems(memberSetup, userWps, userArts);

            if (weapon) {
              option.members.push({
                ...memberSetup.char,
                weapon,
                artifacts,
              });

              memberSetup.party.forEach((member) => {
                if (member) mergedMembers[member.name] = member;
              });
            }
          }
        }

        for (const name in mergedMembers) {
          if (option.members.every((member) => member.name !== name)) {
            const { weapon, artifact } = mergedMembers[name];
            const optionMember: UserSetupOptionMember = {
              name,
              weapon,
              artifacts: [null, null, null, null, null],
            };
            const appArtifact = artifact.code ? $AppArtifact.getSet(artifact.code) : null;

            if (appArtifact) {
              const rarity = appArtifact.variants.at(-1)!;

              optionMember.artifacts = ARTIFACT_TYPES.map((type) => ({
                code: artifact.code,
                type,
                rarity,
              }));
            }
            option.members.push(optionMember);
          }
        }

        if (option.members.length && option.members.length <= 4) {
          options.push(option);
        }
      } else {
        const { weapon, artifacts } = Setup_.getUserSetupItems(setup, userWps, userArts);

        if (weapon) {
          const calcSetup = Setup_.userSetupToCalcSetup(setup, weapon, artifacts);
          options.push(calcSetupToOption(setup.ID, setup.name, calcSetup));
        }
      }
    }

    return options;
  });

  return (
    <div className="p-4">
      <SetupOptions setups={setupOptions} onSelect={props.onSelect} />
    </div>
  );
}
