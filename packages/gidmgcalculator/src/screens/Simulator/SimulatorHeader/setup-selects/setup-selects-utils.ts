import { Artifact, CalcSetup, Teammate } from "@Src/types";
import { SetupOption } from "./SetupOptions";
import { ARTIFACT_TYPES } from "@Backend";
import { $AppArtifact } from "@Src/services";

type CalcSetupTeammate = Pick<Teammate, "name" | "weapon"> & {
  artifacts: (Pick<Artifact, "code" | "type" | "rarity"> | null)[];
};

type CalcSetupOptionMember = CalcSetupTeammate | (CalcSetup["char"] & Pick<CalcSetup, "weapon" | "artifacts">);

export type CalcSetupOption = Pick<SetupOption, "id" | "name"> & {
  members: CalcSetupOptionMember[];
};

export function calcSetupToOption(id: number, name: string, setup: CalcSetup) {
  const { char, weapon, artifacts, party } = setup;
  const setupOption: CalcSetupOption = {
    id,
    name,
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
}
