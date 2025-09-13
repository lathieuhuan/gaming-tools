import { useState } from "react";
import { OverflowTrackingContainer } from "rond";

import type { ArtifactModCtrl } from "@/types";
import type {
  AppArtifact,
  ArtifactModifierDescription,
  ModInputConfig,
  OptimizerArtifactModConfigs,
} from "@Calculation";
import type { ArtifactManager, ChangeModConfigInputs, ToggleModConfig } from "@OptimizeDept/logic/ArtifactManager";

import { GenshinModifierView } from "@/components";
import Array_ from "@/utils/array-utils";
import { getArtifactDesc } from "@/utils/description-parsers";

type ArtifactModConfigProps = {
  artifactManager: ArtifactManager;
}

export function ArtifactModConfig({ artifactManager }: ArtifactModConfigProps) {
  const [buffConfigs, setBuffConfigs] = useState<OptimizerArtifactModConfigs>(artifactManager.buffConfigs);
  const [debuffConfigs, setDebuffConfigs] = useState<OptimizerArtifactModConfigs>(artifactManager.debuffConfigs);

  const renderModView = (
    keyPrefix: string,
    data: AppArtifact,
    mods: Array<{ description: ArtifactModifierDescription; inputConfigs?: ModInputConfig[] }> = [],
    onToggle: ToggleModConfig,
    onChangeInput: ChangeModConfigInputs,
    setChange: (value: ReturnType<ChangeModConfigInputs>) => void
  ) => {
    return (config: ArtifactModCtrl, configIndex: number) => {
      const mod = Array_.findByIndex(mods, config.index);
      if (!mod) return null;

      const description = getArtifactDesc(data, mod);

      const changeThisInput = (value: number, inpIndex: number) => {
        if (config.inputs) {
          const newInputs = config.inputs.map((input, index) => (index === inpIndex ? value : input));
          setChange(onChangeInput(data.code, configIndex, newInputs));
        }
      };

      return (
        <GenshinModifierView
          key={`${keyPrefix}-${data.code}-${config.index}`}
          mutable
          checked={config.activated}
          heading={data.name}
          description={description}
          inputs={config.inputs}
          inputConfigs={mod.inputConfigs}
          onToggle={() => {
            setChange(onToggle(data.code, configIndex));
          }}
          onToggleCheck={(input, index) => {
            changeThisInput(input ? 0 : 1, index);
          }}
          onChangeText={changeThisInput}
          onSelectOption={changeThisInput}
        />
      );
    };
  };

  return (
    <div className="h-full flex flex-col">
      <p>Artifact buffs & debuffs to be activated (if available)</p>

      <OverflowTrackingContainer className="mt-2 grow custom-scrollbar" overflowedCls="pr-3" wrapCls="space-y-2">
        {artifactManager.sets.map(({ data }) => {
          const buffConfigsByCode = buffConfigs[data.code] || [];
          const debuffConfigsByCode = debuffConfigs[data.code] || [];

          if ((!buffConfigsByCode.length || !data.buffs) && (!debuffConfigsByCode.length || !data.debuffs)) {
            return null;
          }

          return (
            <div key={data.code} className="p-3 bg-surface-1 rounded space-y-2">
              {buffConfigsByCode.map(
                renderModView(
                  "B",
                  data,
                  data.buffs,
                  artifactManager.toggleBuffConfig,
                  artifactManager.changeBuffConfigInputs,
                  setBuffConfigs
                )
              )}
              {debuffConfigsByCode.map(
                renderModView(
                  "D",
                  data,
                  data.debuffs,
                  artifactManager.toggleDebuffConfig,
                  artifactManager.changeDebuffConfigInputs,
                  setDebuffConfigs
                )
              )}
            </div>
          );
        })}
      </OverflowTrackingContainer>
    </div>
  );
}
