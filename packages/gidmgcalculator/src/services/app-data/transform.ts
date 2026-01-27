import { TalentType } from "@/types";
import { NO_DESCRIPTION_MSG } from "./config";

type GenshinDevResponse = {
  skillTalents?: {
    name: string;
    type: "NORMAL_ATTACK" | "ELEMENTAL_SKILL" | "ELEMENTAL_BURST";
    description: string;
  }[];
  passiveTalents?: {
    name: string;
    description: string;
    level?: number;
  }[];
  constellations?: {
    name: string;
    description: string;
    level: number;
  }[];
};

export function transformGenshinDevResponse(response: GenshinDevResponse) {
  try {
    const { constellations = [], skillTalents = [], passiveTalents = [] } = response;

    const constellationDescriptions = Array.from(
      { length: 6 },
      (_, i) => constellations[i]?.description || NO_DESCRIPTION_MSG
    );

    const getTalentDescription = (type: string | undefined) => {
      return (
        skillTalents?.find((item: any) => item.type === type)?.description || NO_DESCRIPTION_MSG
      );
    };

    const skillDescriptions: Record<TalentType, string> = {
      NAs: getTalentDescription("NORMAL_ATTACK"),
      ES: getTalentDescription("ELEMENTAL_SKILL"),
      EB: getTalentDescription("ELEMENTAL_BURST"),
      // skillTalents for alternate sprint do not have a type => type undefined
      altSprint: getTalentDescription(undefined),
    };

    const passiveDescriptions = passiveTalents.map(
      (item) => item?.description || NO_DESCRIPTION_MSG
    );

    return {
      skillDescriptions,
      passiveDescriptions,
      constellationDescriptions,
    };
  } catch (e) {
    console.error(e);
    throw new Error("Internal Error");
  }
}

export type GenshinDevData = ReturnType<typeof transformGenshinDevResponse>;
