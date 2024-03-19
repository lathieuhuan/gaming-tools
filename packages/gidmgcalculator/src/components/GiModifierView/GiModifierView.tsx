import { ModifierView, type ModifierViewProps, ModifierViewInputConfig } from "rond";
import type { ModInputConfig } from "@Src/types";

function genNumberSequenceOptions(max: number | undefined = 0, startsAt0: boolean = false, min: number = 1) {
  const result = [...Array(max)].map((_, i) => {
    const value = i + min;
    return { label: value, value };
  });
  return startsAt0 ? [{ label: 0, value: 0 }].concat(result) : result;
}

export interface GiModifierViewProps extends Omit<ModifierViewProps, "inputConfigs"> {
  inputConfigs?: ModInputConfig[];
}
export function GiModifierView({ inputConfigs, ...viewProps }: GiModifierViewProps) {
  const viewInputConfigs = inputConfigs?.map<ModifierViewInputConfig>((config) => {
    const label = config.label || "[missing label]";

    switch (config.type) {
      case "text":
        return { type: "text", label, max: config.max };
      case "level":
        return { type: "text", label, max: 13 };
      case "check":
        return { type: "check", label };
      case "select": {
        const options = config.options
          ? config.options.map((option, optionIndex) => ({
              label: option,
              value: optionIndex,
            }))
          : genNumberSequenceOptions(config.max, config.initialValue === 0);
        return { type: "select", label, options };
      }
      case "stacks":
        return {
          type: "select",
          label: "Stacks",
          options: genNumberSequenceOptions(config.max, config.initialValue === 0),
        };
      case "anemoable":
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
      case "dendroable":
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
