import { useEffect, useState } from "react";
import type { ArtifactModCtrl } from "@Src/types";

import { GenshinModifierView } from "@Src/components";
import { ArtifactFilterSet } from "@Src/components/ArtifactFilter/hooks";
import { getArtifactDescription } from "@Src/components/modifier-list/modifiers.utils";
import Array_ from "@Src/utils/array-utils";

export type ArtifactBuffConfig = Record<number, Pick<ArtifactModCtrl, "index" | "activated" | "inputs">[]>;

export type ArtifactModifierConfig = {
  buffs?: ArtifactBuffConfig;
};

export interface StepArtifactModConfigProps {
  id: string;
  initialValue: ArtifactModifierConfig;
  artifactSets?: ArtifactFilterSet[];
  onChangeValid?: (valid: boolean) => void;
  onSubmit: (modConfig: ArtifactModifierConfig) => void;
}
export function StepArtifactModConfig(props: StepArtifactModConfigProps) {
  const [configs, setConfigs] = useState<ArtifactBuffConfig>(props.initialValue.buffs || {});

  useEffect(() => {
    props.onChangeValid?.(true);
  }, []);

  const toggleConfig = (code: number, index: number) => {
    const newConfigs = { ...configs };
    const newConfig = newConfigs[code];

    if (newConfig[index]) {
      newConfig[index] = {
        ...newConfig[index],
        index,
        activated: !newConfig[index].activated,
      };

      setConfigs(newConfigs);
    }
  };

  const changeConfig = (code: number, index: number, inputs: ArtifactModCtrl["inputs"]) => {
    const newConfigs = { ...configs };
    const newConfig = newConfigs[code];

    if (newConfig[index]) {
      newConfig[index] = {
        ...newConfig[index],
        inputs,
      };

      setConfigs(newConfigs);
    }
  };

  return (
    <form
      id={props.id}
      className="h-full flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(configs);
      }}
    >
      <p>Artifact buffs to be activated</p>

      <div className="mt-2 grow custom-scrollbar space-y-2">
        {props.artifactSets?.map(({ code, data }) => {
          const configsByCode = configs[code] || [];
          if (!configsByCode.length || !data.buffs) return null;

          return (
            <div key={code} className="p-3 bg-surface-1 rounded space-y-2">
              {configsByCode.map((config, configIndex) => {
                const buff = Array_.findByIndex(data.buffs, config.index);
                if (!buff) return null;

                const description = getArtifactDescription(data, buff);

                const changeThisInputs = (value: number, index: number) => {
                  if (config.inputs) {
                    const newInputs = [...config.inputs];
                    newInputs[index] = value;
                    changeConfig(code, configIndex, newInputs);
                  }
                };

                return (
                  <GenshinModifierView
                    key={`${code}-${config.index}`}
                    mutable
                    checked={config.activated}
                    heading={data.name}
                    description={description}
                    inputs={config.inputs}
                    inputConfigs={buff.inputConfigs}
                    onToggle={() => toggleConfig(code, configIndex)}
                    onToggleCheck={(input, index) => {
                      changeThisInputs(input ? 0 : 1, index);
                    }}
                    onChangeText={changeThisInputs}
                    onSelectOption={changeThisInputs}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </form>
  );
}
