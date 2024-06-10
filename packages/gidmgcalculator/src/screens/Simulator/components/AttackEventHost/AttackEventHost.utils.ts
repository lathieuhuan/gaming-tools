import { AppCharacter, AttackPattern, CalcItem, NORMAL_ATTACKS, TalentType } from "@Backend";

export type AttackEventConfigItem = CalcItem & {
  underPatt: AttackPattern;
};

export type AttackEventConfigGroup = {
  name: TalentType;
  items: AttackEventConfigItem[];
};

export function getAttackEventConfigGroups(appChar: AppCharacter) {
  const filter = (items: CalcItem[], cb: (item: CalcItem) => void) => {
    for (const item of items) {
      if (!item.type || item.type === "attack") cb(item);
    }
  };

  const NAs: AttackEventConfigGroup = {
    name: "NAs",
    items: [],
  };
  for (const NA of NORMAL_ATTACKS) {
    filter(appChar.calcList[NA], (item) => NAs.items.push(Object.assign({ underPatt: NA }, item)));
  }

  const configGroups: AttackEventConfigGroup[] = [NAs];

  for (const attPatt of ["ES", "EB"] as const) {
    const group: AttackEventConfigGroup = {
      name: attPatt,
      items: [],
    };
    filter(appChar.calcList[attPatt], (item) => group.items.push(Object.assign({ underPatt: attPatt }, item)));

    configGroups.push(group);
  }

  return configGroups;
}
