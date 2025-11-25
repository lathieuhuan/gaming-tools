import type { ArtifactModCtrl, CalcArtifacts, ModifierCtrl } from "@/types";
import type { ArtifactSetBonus, EntityModifier, ModInputConfig, ModInputType } from "@Calculation";

import TypeCounter from "@/utils/TypeCounter";

const DEFAULT_INITIAL_VALUES: Record<ModInputType, number> = {
  CHECK: 0,
  LEVEL: 1,
  TEXT: 0,
  SELECT: 1,
  STACKS: 1,
  ANEMOABLE: 0,
  DENDROABLE: 0,
  ELEMENTAL: 0,
};

function getDefaultInitialValue(type: ModInputType) {
  return DEFAULT_INITIAL_VALUES[type] ?? 0;
}

function createModCtrlInputs(
  inputConfigs: ModInputConfig[] = [],
  forSelf = true,
  useMaxValue = false
) {
  const forTarget = forSelf ? "FOR_TEAM" : "FOR_SELF";
  const initialValues = [];

  for (const config of inputConfigs) {
    if (!config.for || config.for !== forTarget) {
      let value = useMaxValue ? config.max : config.init;

      if (value === undefined) {
        const [firstOption] = config.options ?? [];

        if (typeof firstOption === "number") {
          value = firstOption;
        } else {
          value = getDefaultInitialValue(config.type);
        }
      }

      initialValues.push(value);
    }
  }

  return initialValues;
}

export function createModCtrl(mod: EntityModifier, forSelf: boolean): ModifierCtrl {
  const inputs = createModCtrlInputs(mod.inputConfigs, forSelf);

  return {
    index: mod.index,
    activated: false,
    ...(mod.teamBuffId ? { teamBuffId: mod.teamBuffId } : null),
    ...(inputs.length ? { inputs } : null),
  };
}

export function createArtifactDebuffCtrls(): ArtifactModCtrl[] {
  return [
    { code: 15, activated: false, index: 0, inputs: [0] },
    { code: 33, activated: false, index: 0 },
  ];
}

export function getArtifactSetBonuses(artifacts: CalcArtifacts = []): ArtifactSetBonus[] {
  const sets: ArtifactSetBonus[] = [];
  const counter = new TypeCounter();

  for (const artifact of artifacts) {
    if (artifact) {
      const codeCount = counter.add(artifact.code);

      if (codeCount === 2) {
        sets.push({ code: artifact.code, bonusLv: 0 });
      } else if (codeCount === 4) {
        sets[0].bonusLv = 1;
      }
    }
  }
  return sets;
}
