import type { AppSettingsState } from "@Store/settings";
import type { OnSettingChange } from "./types";

import { MAX_TARGET_LEVEL } from "@/constants";
import { genSequentialOptions } from "@/utils/pure.utils";

// Components
import { CharacterLevelControl, WeaponLevelControl } from "@/components";
import { SettingsGroup, SettingsGroupItem } from "./SettingsGroup";

type DefaultValuesSettingsProps = {
  initialValues: AppSettingsState;
  onChange?: OnSettingChange<
    | "charLevel"
    | "charCons"
    | "charEnhanced"
    | "charNAs"
    | "charES"
    | "charEB"
    | "wpLevel"
    | "wpRefi"
    | "artLevel"
    | "targetLevel"
  >;
};

export function DefaultValuesSettings({ initialValues, onChange }: DefaultValuesSettingsProps) {
  const artLevelOptions = Array.from({ length: 6 }, (_, i) => {
    const value = i * 4;
    return { label: value, value };
  });

  const items: SettingsGroupItem[] = [
    {
      key: "charLevel",
      label: "Character level",
      type: "CUSTOM",
      control: (
        <CharacterLevelControl
          className="h-8 bg-light-1 text-black rounded-sm"
          defaultValue={initialValues.charLevel}
          onChange={(value) => onChange?.("charLevel", value)}
        />
      ),
    },
    {
      key: "charCons",
      label: "Character constellation",
      type: "SELECT",
      controlProps: {
        options: genSequentialOptions(7, 0),
        defaultValue: initialValues.charCons,
        onChange: (value) => onChange?.("charCons", value as number),
      },
    },
    {
      key: "charEnhanced",
      label: "Character enhanced",
      type: "CHECK",
      align: "right",
      controlProps: {
        defaultChecked: initialValues.charEnhanced,
        onChange: (value) => onChange?.("charEnhanced", value),
      },
    },
    {
      key: "charNAs",
      label: "Character Normal Attack level",
      type: "SELECT",
      controlProps: {
        options: genSequentialOptions(10),
        defaultValue: initialValues.charNAs,
        onChange: (value) => onChange?.("charNAs", value as number),
      },
    },
    {
      key: "charES",
      label: "Character Elemental Skill level",
      type: "SELECT",
      controlProps: {
        options: genSequentialOptions(10),
        defaultValue: initialValues.charES,
        onChange: (value) => onChange?.("charES", value as number),
      },
    },
    {
      key: "charEB",
      label: "Character Elemental Burst level",
      type: "SELECT",
      controlProps: {
        options: genSequentialOptions(10),
        defaultValue: initialValues.charEB,
        onChange: (value) => onChange?.("charEB", value as number),
      },
    },
    {
      key: "wpLevel",
      label: "Weapon level",
      type: "CUSTOM",
      control: (
        <WeaponLevelControl
          className="w-23 h-8 bg-light-1 text-black rounded-sm"
          defaultValue={initialValues.wpLevel}
          onChange={(value) => onChange?.("wpLevel", value)}
        />
      ),
    },
    {
      key: "wpRefi",
      label: "Weapon refinement",
      type: "SELECT",
      controlProps: {
        options: genSequentialOptions(5),
        defaultValue: initialValues.wpRefi,
        onChange: (value) => onChange?.("wpRefi", value as number),
      },
    },
    {
      key: "artLevel",
      label: "Artifact level",
      type: "SELECT",
      controlProps: {
        options: artLevelOptions,
        defaultValue: initialValues.artLevel,
        onChange: (value) => onChange?.("artLevel", value as number),
      },
    },
    {
      key: "targetLevel",
      label: "Target level",
      type: "INPUT",
      controlProps: {
        max: MAX_TARGET_LEVEL,
        defaultValue: initialValues.targetLevel,
        onChange: (value) => onChange?.("targetLevel", value),
      },
    },
  ];
  return <SettingsGroup title="Default values" items={items} />;
}
