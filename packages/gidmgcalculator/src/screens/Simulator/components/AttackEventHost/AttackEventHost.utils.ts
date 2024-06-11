import { AppCharacter, AttackPattern, CalcItem, NORMAL_ATTACKS, TalentType } from "@Backend";

type AttackEventConfigGroup = {
  type: AttackPattern;
  items: CalcItem[];
};

export type TalentAttackEventConfig = {
  title: TalentType;
  groups: AttackEventConfigGroup[];
};

export function getTalentAttackEventConfig(appChar: AppCharacter) {
  const filter = (items: CalcItem[], cb: (item: CalcItem) => void) => {
    for (const item of items) {
      if ((!item.type || item.type === "attack") && !item.notOfficial) cb(item);
    }
  };

  const NAs: TalentAttackEventConfig = {
    title: "NAs",
    groups: [],
  };
  for (const NA of NORMAL_ATTACKS) {
    const group: AttackEventConfigGroup = {
      type: NA,
      items: [],
    };

    filter(appChar.calcList[NA], (item) => group.items.push(item));
    NAs.groups.push(group);
  }

  const configs = [NAs];

  for (const attPatt of ["ES", "EB"] as const) {
    const config: TalentAttackEventConfig = {
      title: attPatt,
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
