import { ModifierView } from "rond";

import type { ModInputSpec } from "@/types";
import type { ModifierViewInputConfig, ModifierViewProps } from "rond";

import { genSequentialOptions } from "@/utils/ui.utils";

const genOptions = (config: ModInputSpec) => {
  const { max = 0, init } = config;
  return genSequentialOptions(init === 0 ? max + 1 : max, init);
};

export type GenshinModifierViewProps = Omit<ModifierViewProps, "inputConfigs"> & {
  inputConfigs?: ModInputSpec[];
  isTeamMod?: boolean;
};

export function GenshinModifierView({
  inputConfigs,
  isTeamMod,
  ...viewProps
}: GenshinModifierViewProps) {
  if (isTeamMod) {
    return <ModifierView {...viewProps} mutable={false} headingVariant="custom" />;
  }

  const viewInputConfigs = inputConfigs?.map<ModifierViewInputConfig>((config) => {
    const label = config.label || "[missing label]";
    const configOptions = config.options;

    switch (config.type) {
      case "TEXT":
        return { type: "text", label, max: config.max };
      case "LEVEL":
        return { type: "text", label, max: 15 };
      case "CHECK":
        return { type: "check", label };
      case "SELECT": {
        if (configOptions) {
          const { menuWidth = 7 } = config;

          return {
            type: "select",
            label,
            options: configOptions.map((option, optionIndex) => ({
              label: option,
              value: optionIndex,
            })),
            style: { maxWidth: `${menuWidth}rem` },
          };
        }

        return { type: "select", label, options: genOptions(config) };
      }
      case "STACKS":
        return {
          type: "select",
          label: config.label || "Stacks",
          style: { maxWidth: "3.25rem" },
          options: genOptions(config),
        };
      case "ANEMOABLE":
        return {
          type: "select",
          label,
          options: [OPTION_PYRO, OPTION_HYDRO, OPTION_ELECTRO, OPTION_CRYO],
        };
      case "DENDROABLE":
        return {
          type: "select",
          label,
          options: [OPTION_PYRO, OPTION_HYDRO, OPTION_ELECTRO],
        };
      case "ELEMENTAL": {
        const options = [
          OPTION_PYRO,
          OPTION_HYDRO,
          OPTION_ELECTRO,
          OPTION_CRYO,
          OPTION_GEO,
          OPTION_ANEMO,
          OPTION_DENDRO,
        ];

        return {
          type: "select",
          label,
          options: configOptions
            ? options.filter((option) => configOptions.includes(option.value))
            : options,
          style: { maxWidth: configOptions ? "6rem" : undefined },
        };
      }
      default:
        config.type satisfies never;

        return {
          label: "[unmatched type]",
          type: "text",
        };
    }
  });

  return <ModifierView {...viewProps} inputConfigs={viewInputConfigs} />;
}

type SelectOption = {
  label: string;
  value: number;
};

const OPTION_PYRO: SelectOption = { label: "Pyro", value: 0 };
const OPTION_HYDRO: SelectOption = { label: "Hydro", value: 1 };
const OPTION_ELECTRO: SelectOption = { label: "Electro", value: 2 };
const OPTION_CRYO: SelectOption = { label: "Cryo", value: 3 };
const OPTION_GEO: SelectOption = { label: "Geo", value: 4 };
const OPTION_ANEMO: SelectOption = { label: "Anemo", value: 5 };
const OPTION_DENDRO: SelectOption = { label: "Dendro", value: 6 };
