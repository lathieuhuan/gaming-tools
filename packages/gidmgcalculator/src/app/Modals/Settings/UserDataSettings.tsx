import { AppSettingsState } from "@Store/settings";
import { SettingsGroup, SettingsGroupItem } from "./SettingsGroup";
import { OnSettingChange } from "./types";

type UserDataSettingsProps = {
  initialValues: AppSettingsState;
  onChange?: OnSettingChange<"persistUserData">;
};

export function UserDataSettings({ initialValues, onChange }: UserDataSettingsProps) {
  const items: SettingsGroupItem[] = [
    {
      key: "persistUserData",
      label: "Auto save my database to browser's local storage",
      description: [
        "Your data is available on this browser only and will be lost if the local storage is cleared. Does not work as expected in Incognito mode.",
      ],
      type: "CHECK",
      controlProps: {
        defaultChecked: initialValues.persistUserData,
        onChange: (value) => onChange?.("persistUserData", value),
      },
    },
  ];

  return <SettingsGroup title="User Data" items={items} />;
}
