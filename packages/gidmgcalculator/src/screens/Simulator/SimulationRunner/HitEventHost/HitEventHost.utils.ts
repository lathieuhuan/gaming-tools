import { AppCharacter, AttackPattern, CalcItem, LevelableTalentType, NORMAL_ATTACKS } from "@Backend";

type TalentHitEventConfigGroup = {
  type: AttackPattern;
  items: CalcItem[];
};

type TalentHitEventConfig = {
  type: LevelableTalentType;
  groups: TalentHitEventConfigGroup[];
};

export function getTalentHitEventConfig(appChar: AppCharacter) {
  const filter = (items: CalcItem[], cb: (item: CalcItem) => void) => {
    for (const item of items) {
      if ((!item.type || item.type === "attack") && !item.notOfficial) cb(item);
    }
  };

  const NAs: TalentHitEventConfig = {
    type: "NAs",
    groups: [],
  };
  for (const NA of NORMAL_ATTACKS) {
    const group: TalentHitEventConfigGroup = {
      type: NA,
      items: [],
    };

    filter(appChar.calcList[NA], (item) => group.items.push(item));
    NAs.groups.push(group);
  }

  const configs = [NAs];

  for (const attPatt of ["ES", "EB"] as const) {
    const config: TalentHitEventConfig = {
      type: attPatt,
      groups: [
        {
          type: attPatt,
          items: [],
        },
      ],
    };
    filter(appChar.calcList[attPatt], (item) => config.groups[0].items.push(item));

    configs.push(config);
  }

  return configs;
}
