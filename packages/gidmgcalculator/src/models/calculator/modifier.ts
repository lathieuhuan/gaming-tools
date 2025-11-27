import type { ArtifactGear } from "@/models/base";
import type { CalcTeam, ICalcSetup } from "@/models/calculator";
import type {
  AppArtifact,
  AppCharacter,
  AppWeapon,
  ElementalEvent,
  EntityModifier,
  IAbilityBuffCtrl,
  IAbilityDebuffCtrl,
  IArtifactBuffCtrl,
  IModifierCtrlBasic,
  ITeamBuffCtrl,
  IWeaponBuffCtrl,
  ModifierAffectType,
  ModInputConfig,
  ModInputType,
  ResonanceModCtrl,
} from "@/types";

import { $AppData } from "@/services";
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

export function createTeamBuffCtrls(setup: ICalcSetup): ITeamBuffCtrl[] {
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

export function createMainArtifactBuffCtrls(artifact: ArtifactGear): IArtifactBuffCtrl[] {
  const ctrls: IArtifactBuffCtrl[] = [];

  for (const set of artifact.sets) {
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

// export function createArtifactDebuffCtrls(): ArtifactModCtrl[] {
//   return [
//     { code: 15, activated: false, index: 0, inputs: [0] },
//     { code: 33, activated: false, index: 0 },
//   ];
// }

export function createRsnModCtrls(team: CalcTeam) {
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
