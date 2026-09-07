import type { CharacterResponseData } from "./types";

const NO_DESCRIPTION_MSG = "[Description missing]";

export function selectTalentDescriptions(data: CharacterResponseData) {
  const { skillTalents = [], passiveTalents = [] } = data;

  const getTalentDescription = (type: string | undefined) => {
    const talent = skillTalents?.find((item) => item.type === type);
    return talent?.description || NO_DESCRIPTION_MSG;
  };

  const descriptions = [
    getTalentDescription("NORMAL_ATTACK"),
    getTalentDescription("ELEMENTAL_SKILL"),
    getTalentDescription("ELEMENTAL_BURST"),
  ];

  const altSprintDescription = getTalentDescription(undefined);

  if (altSprintDescription !== NO_DESCRIPTION_MSG) {
    descriptions.push(altSprintDescription);
  }

  return descriptions.concat(passiveTalents.map((item) => item?.description || NO_DESCRIPTION_MSG));
}

export function selectConsDescription(data: CharacterResponseData) {
  return Array.from(
    { length: 6 },
    (_, i) => data.constellations?.at(i)?.description || NO_DESCRIPTION_MSG,
  );
}
