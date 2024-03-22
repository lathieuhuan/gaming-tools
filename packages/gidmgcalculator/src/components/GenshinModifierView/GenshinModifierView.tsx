import { ModifierView, type ModifierViewProps, ModifierViewInputConfig } from "rond";
import type { ModInputConfig } from "@Src/types";

function genNumberSequenceOptions(max: number | undefined = 0, startsAt0: boolean = false, min: number = 1) {
  const result = [...Array(max)].map((_, i) => {
    const value = i + min;
    return { label: value, value };
  });
  return startsAt0 ? [{ label: 0, value: 0 }].concat(result) : result;
}

export interface GenshinModifierViewProps extends Omit<ModifierViewProps, "inputConfigs"> {
  inputConfigs?: ModInputConfig[];
}
export function GenshinModifierView({ inputConfigs, ...viewProps }: GenshinModifierViewProps) {
  const viewInputConfigs = inputConfigs?.map<ModifierViewInputConfig>((config) => {
    const label = config.label || "[missing label]";

    switch (config.type) {
      case "TEXT":
        return { type: "text", label, max: config.max };
      case "LEVEL":
        return { type: "text", label, max: 13 };
      case "CHECK":
        return { type: "check", label };
      case "SELECT": {
        const options = config.options
          ? config.options.map((option, optionIndex) => ({
              label: option,
              value: optionIndex,
            }))
          : genNumberSequenceOptions(config.max, config.initialValue === 0);
        return { type: "select", label, options };
      }
      case "STACKS":
        return {
          type: "select",
          label: "Stacks",
          options: genNumberSequenceOptions(config.max, config.initialValue === 0),
        };
      case "ANEMOABLE":
        return {
          type: "select",
          label,
          options: [
            { label: "Pyro", value: 0 },
            { label: "Hydro", value: 1 },
            { label: "Electro", value: 2 },
            { label: "Cryo", value: 3 },
          ],
        };
      case "DENDROABLE":
        return {
          type: "select",
          label,
          options: [
            { label: "Pyro", value: 0 },
            { label: "Hydro", value: 1 },
            { label: "Electro", value: 2 },
          ],
        };
      default:
        return {
          label: "[unmatched type]",
          type: "text",
        };
    }
  });

  return <ModifierView {...viewProps} inputConfigs={viewInputConfigs} />;
}
