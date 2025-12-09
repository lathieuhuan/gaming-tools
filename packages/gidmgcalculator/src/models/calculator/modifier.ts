import type {
  AppArtifact,
  AppCharacter,
  AppWeapon,
  ElementalEvent,
  EntityModifier,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IArtifactBuffCtrl,
  IArtifactDebuffCtrl,
  IArtifactGearSet,
  IModifierCtrlBasic,
  ITeam,
  ITeamBuffCtrl,
  IWeaponBuffCtrl,
  ModifierAffectType,
  ModInputConfig,
  ModInputType,
  ResonanceModCtrl,
} from "@/types";
import type { CalcSetup } from "./CalcSetup";
import type { CalcTeammate } from "./CalcTeammate";

import { $AppArtifact, $AppData } from "@/services";
import Array_ from "@/utils/Array";
import { isManualRsnElmt } from "../base/utils/isManualRsnElmt";

export const MS_ASCENDANT_BUFF_ID = 1;

function getDefaultInitValue(type: ModInputType) {
  switch (type) {
    case "LEVEL":
    case "SELECT":
    case "STACKS":
      return 1;
    default:
      return 0;
  }
}

function createModCtrlInputs(
  inputConfigs: ModInputConfig[] = [],
  forSelf = true,
  useMaxValue = false
) {
  const undesiredFor = forSelf ? "FOR_TEAM" : "FOR_SELF";
  const inputs: number[] = [];

  for (const config of inputConfigs) {
    if (!config.for || config.for !== undesiredFor) {
      let value = useMaxValue ? config.max : config.init;

      if (value === undefined) {
        const [firstOption] = config.options ?? [];

        if (typeof firstOption === "number") {
          value = firstOption;
        } else {
          value = getDefaultInitValue(config.type);
        }
      }

      inputs.push(value);
    }
  }

  return inputs;
}

export function createModCtrl(forSelf: boolean) {
  //
  return <T extends EntityModifier>(mod: T): IModifierCtrlBasic & { data: T } => {
    const inputs = createModCtrlInputs(mod.inputConfigs, forSelf);

    return {
      id: mod.index,
      activated: false,
      data: mod,
      ...(inputs.length ? { inputs } : null),
    };
  };
}

export function createTeamBuffCtrls(setup: CalcSetup): ITeamBuffCtrl[] {
  const { team, artBuffCtrls = [] } = setup;

  // Find available team buff ids

  const teamBuffIds = new Set<number>();

  if (team.moonsignLv >= 2) {
    teamBuffIds.add(MS_ASCENDANT_BUFF_ID);
  }

  for (const { data } of artBuffCtrls) {
    data.teamBuffId && teamBuffIds.add(data.teamBuffId);
  }

  for (const teammate of setup.teammates) {
    const { buffCtrls = [] } = teammate.artifact || {};

    for (const { data } of buffCtrls) {
      data.teamBuffId && teamBuffIds.add(data.teamBuffId);
    }
  }

  // Turn ids into ctrls based on $AppData.teamBuffs

  return Array_.filterMap(
    $AppData.teamBuffs,
    (buff) => teamBuffIds.has(buff.index),
    createModCtrl(false)
  );
}

type RefModifier = EntityModifier & {
  affect?: ModifierAffectType;
};

function filterFor(forSelf: boolean) {
  const undesiredAffect: ModifierAffectType = forSelf ? "TEAMMATE" : "SELF";

  return (modifier: RefModifier) => !modifier.affect || modifier.affect !== undesiredAffect;
}

export function createAbilityBuffCtrls(data: AppCharacter, forSelf: boolean): IAbilityBuffCtrl[] {
  const { buffs = [] } = data || {};

  return Array_.filterMap(buffs, filterFor(forSelf), createModCtrl(forSelf));
}

export function createAbilityDebuffCtrls(
  data: AppCharacter,
  forSelf: boolean
): IAbilityDebuffCtrl[] {
  return data.debuffs?.map(createModCtrl(forSelf)) || [];
}

export function createWeaponBuffCtrls(
  weapon: AppWeapon | undefined,
  forSelf: boolean
): IWeaponBuffCtrl[] {
  const { buffs = [] } = weapon || {};
  return Array_.filterMap(buffs, filterFor(forSelf), createModCtrl(forSelf));
}

export function createMainArtifactBuffCtrls(sets: IArtifactGearSet[]): IArtifactBuffCtrl[] {
  const ctrls: IArtifactBuffCtrl[] = [];

  for (const set of sets) {
    const { buffs = [] } = set.data;

    for (const buff of buffs) {
      const { bonusLv = 1 } = buff;

      if (buff.affect !== "TEAMMATE" && set.bonusLv >= bonusLv) {
        ctrls.push({
          code: set.data.code,
          setData: set.data,
          ...createModCtrl(true)(buff),
        });
      }
    }
  }

  return ctrls;
}

export function createArtifactBuffCtrls(
  artifact: AppArtifact | undefined,
  forSelf: boolean,
  maxBonusLv = 1
): IArtifactBuffCtrl[] {
  if (artifact?.buffs) {
    return Array_.filterMap(
      artifact.buffs,
      (buff) => filterFor(forSelf)(buff) && (buff.bonusLv ?? 1) <= maxBonusLv,
      (buff) => ({
        setData: artifact,
        code: artifact.code,
        ...createModCtrl(true)(buff),
      })
    );
  }

  return [];
}

export function createArtifactDebuffCtrls(sets: IArtifactGearSet[], teammates: CalcTeammate[]) {
  const ctrls: IArtifactDebuffCtrl[] = [];
  const vvArtifact = $AppArtifact.vvArtifact;
  const deepwoodArtifact = $AppArtifact.deepwoodArtifact;
  const usedCodeSet = new Set<number>();

  const [firstSet] = sets;

  if (firstSet?.bonusLv === 1) {
    usedCodeSet.add(firstSet.data.code);
  }

  for (const teammate of teammates) {
    const code = teammate.artifact?.code;

    if (code) {
      usedCodeSet.add(code);
    }
  }

  if (vvArtifact?.debuff && usedCodeSet.has(vvArtifact.data.code)) {
    ctrls.push({
      id: 0,
      code: vvArtifact.data.code,
      activated: false,
      inputs: [0],
      setData: vvArtifact.data,
      data: vvArtifact.debuff,
    });
  }

  if (deepwoodArtifact?.debuff && usedCodeSet.has(deepwoodArtifact.data.code)) {
    ctrls.push({
      id: 0,
      code: deepwoodArtifact.data.code,
      activated: false,
      setData: deepwoodArtifact.data,
      data: deepwoodArtifact.debuff,
    });
  }

  return ctrls;
}

export function createRsnModCtrls(team: ITeam) {
  const buffCtrls: ResonanceModCtrl[] = [];
  const debuffCtrls: ResonanceModCtrl[] = [];

  team.elmtCount.forEach((element, count) => {
    if (isManualRsnElmt(element) && count >= 2) {
      const ctrl: ResonanceModCtrl = {
        element,
        activated: false,
      };

      if (element === "dendro") {
        ctrl.activated = true;
        ctrl.inputs = [0, 0];
      }

      buffCtrls.push(ctrl);

      if (element === "geo") {
        debuffCtrls.push({
          element,
          activated: false,
        });
      }
    }
  });

  return { buffCtrls, debuffCtrls };
}

export function createElementalEvent(): ElementalEvent {
  return {
    superconduct: false,
    infusion: null,
    infuseReaction: null,
    reaction: null,
    absorbReaction: null,
    absorption: null,
  };
}
