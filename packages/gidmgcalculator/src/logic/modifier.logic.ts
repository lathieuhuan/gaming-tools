import { Array_ } from "ron-utils";

import type { Teammate } from "@/models";
import type {
  AbilityBuffCtrl,
  AbilityDebuffCtrl,
  AppArtifact,
  AppCharacter,
  AppWeapon,
  ArtifactBuffCtrl,
  ArtifactDebuffCtrl,
  ArtifactGearSet,
  ElementalEvent,
  ElementCount,
  ModAffectType,
  ModifierBaseSpec,
  ModifierCtrl,
  ModifierCtrlState,
  ModInputSpec,
  ModInputType,
  ResonanceModCtrl,
  WeaponBuffCtrl,
} from "@/types";

import { DEFAULT_STELLAR_VORTEX_LV } from "@/constants";
import { getAppArtifact } from "@/services/app-data";
import { isManualRsnElmt } from "@/utils/element.utils";

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
  inputConfigs: ModInputSpec[] = [],
  forSelf = true,
  useMaxValue = false,
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
  return <T extends ModifierBaseSpec>(mod: T): ModifierCtrlState & { data: T } => {
    const inputs = createModCtrlInputs(mod.inputConfigs, forSelf);

    return {
      id: mod.id,
      activated: false,
      data: mod,
      ...(inputs.length ? { inputs } : null),
    };
  };
}

type RefModifier = ModifierBaseSpec & {
  affect?: ModAffectType;
};

function filterFor(forSelf: boolean) {
  const undesiredAffect: ModAffectType = forSelf ? "TEAMMATE" : "SELF";

  return (modifier: RefModifier) => !modifier.affect || modifier.affect !== undesiredAffect;
}

export function createAbilityBuffCtrls(data: AppCharacter, forSelf: boolean): AbilityBuffCtrl[] {
  const { buffs = [] } = data || {};

  return Array_.filterMap(buffs, filterFor(forSelf), createModCtrl(forSelf));
}

export function createAbilityDebuffCtrls(
  data: AppCharacter,
  forSelf: boolean,
): AbilityDebuffCtrl[] {
  return data.debuffs?.map(createModCtrl(forSelf)) || [];
}

export function createWeaponBuffCtrls(
  weapon: AppWeapon | undefined,
  forSelf: boolean,
): WeaponBuffCtrl[] {
  const { buffs = [] } = weapon || {};
  return Array_.filterMap(buffs, filterFor(forSelf), createModCtrl(forSelf));
}

export function createMainArtifactBuffCtrls(sets: ArtifactGearSet[]): ArtifactBuffCtrl[] {
  const ctrls: ArtifactBuffCtrl[] = [];

  for (const set of sets) {
    ctrls.push(...createArtifactBuffCtrls(set.data, true, set.bonusLv));
  }

  return ctrls;
}

export function createArtifactBuffCtrls(
  artifact: AppArtifact | undefined,
  forSelf: boolean,
  maxBonusLv = 1,
): ArtifactBuffCtrl[] {
  if (artifact?.buffs) {
    return Array_.filterMap(
      artifact.buffs,
      (buff) => filterFor(forSelf)(buff) && (buff.bonusLv ?? 1) <= maxBonusLv,
      (buff) => ({
        setData: artifact,
        code: artifact.code,
        ...createModCtrl(true)(buff),
      }),
    );
  }

  return [];
}

export function createArtifactDebuffCtrls(sets: ArtifactGearSet[], teammates: Teammate[]) {
  const ctrls: ArtifactDebuffCtrl[] = [];
  // TODO improve
  const vvArtifact = getAppArtifact(15);
  const deepwoodArtifact = getAppArtifact(33);
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

  if (vvArtifact?.debuffs && usedCodeSet.has(vvArtifact.code)) {
    ctrls.push({
      id: 0,
      code: vvArtifact.code,
      activated: false,
      inputs: [0],
      setData: vvArtifact,
      data: vvArtifact.debuffs[0],
    });
  }

  if (deepwoodArtifact?.debuffs && usedCodeSet.has(deepwoodArtifact.code)) {
    ctrls.push({
      id: 0,
      code: deepwoodArtifact.code,
      activated: false,
      setData: deepwoodArtifact,
      data: deepwoodArtifact.debuffs[0],
    });
  }

  return ctrls;
}

export function createRsnModCtrls(elmtCount: ElementCount) {
  const buffCtrls: ResonanceModCtrl[] = [];
  const debuffCtrls: ResonanceModCtrl[] = [];

  elmtCount.forEach((count, element) => {
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
    polestarProc: false,
    polestarCount: 0,
    vortexLv: DEFAULT_STELLAR_VORTEX_LV,
  };
}

export function enhanceCtrls<T extends ModifierBaseSpec, TExtra extends object = {}>(
  ctrls: ModifierCtrlState[],
  mods?: T[],
  extraProps: TExtra = {} as TExtra,
  extraCheck: (ctrl: ModifierCtrlState, mod: T) => boolean = () => true,
) {
  if (mods) {
    return ctrls.reduce<(ModifierCtrl<T> & TExtra)[]>((result, ctrl) => {
      const data = mods.find((mod) => mod.id === ctrl.id && extraCheck(ctrl, mod));
      return data ? result.concat({ ...ctrl, data, ...extraProps }) : result;
    }, []);
  }

  return [];
}
