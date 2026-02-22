import { useRef } from "react";
import { Modal } from "rond";

import type { ElementType, TravelerConfig, TravelerKey } from "@/types";

import { genAccountTravelerKey } from "@/logic/genAccountTravelerKey";
import { $AppCharacter } from "@/services";
import Object_ from "@/utils/Object";
import { applySettingsToCalculator } from "@Store/calculator/actions";
import { AppSettingsState, updateSettings, useSettingsStore } from "@Store/settings";

import { CalculatorSettings } from "./CalculatorSettings";
import { DefaultValuesSettings } from "./DefaultValuesSettings";
import { TravelerSettings } from "./TravelerSettings";
import { UserDataSettings } from "./UserDataSettings";

const useNewAppSettings = () => {
  const settings = useRef<AppSettingsState>();

  if (!settings.current) {
    settings.current = Object_.clone(useSettingsStore.getState());
  }

  return settings.current;
};

type SettingsProps = {
  onClose: () => void;
};

const Settings = ({ onClose }: SettingsProps) => {
  const newSettings = useNewAppSettings();

  const handleSubmit = () => {
    const currSettings = useSettingsStore.getState();
    const currTraveler = currSettings.traveler;
    const newTraveler = newSettings.traveler;
    const travelerChanged =
      genAccountTravelerKey(currTraveler) !== genAccountTravelerKey(newTraveler);

    if (travelerChanged) {
      // changeTraveler must run before apply settings
      $AppCharacter.changeTraveler(newTraveler);
    }

    updateSettings(newSettings);

    applySettingsToCalculator(
      currSettings.separateCharInfo && !newSettings.separateCharInfo,
      travelerChanged
    );

    onClose();
  };

  const handleAppSettingChange = <TKey extends keyof AppSettingsState>(
    key: TKey,
    value: AppSettingsState[TKey]
  ) => {
    newSettings[key] = value;
  };

  const handleTravelerSelect = (selection: TravelerKey) => {
    newSettings.traveler.selection = selection;
  };

  const handlePowerupsChange = (key: keyof TravelerConfig["powerups"], value: boolean) => {
    newSettings.traveler = Object_.deepMerge(newSettings.traveler, {
      powerups: {
        [key]: value,
      },
    });
  };

  const handleResonatedElmtsChange = (resonatedElmts: ElementType[]) => {
    newSettings.traveler.resonatedElmts = resonatedElmts;
  };

  return (
    <form
      id="app-settings-form"
      className="h-full overflow-auto space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <TravelerSettings
        initialConfig={newSettings.traveler}
        onChangeSelection={handleTravelerSelect}
        onChangePowerups={handlePowerupsChange}
        onChangeResonatedElmts={handleResonatedElmtsChange}
      />

      <CalculatorSettings initialValues={newSettings} onChange={handleAppSettingChange} />

      <UserDataSettings initialValues={newSettings} onChange={handleAppSettingChange} />

      <DefaultValuesSettings initialValues={newSettings} onChange={handleAppSettingChange} />
    </form>
  );
};

export const SettingsModal = Modal.wrap(Settings, {
  title: "Settings",
  className: ["bg-dark-2", Modal.LARGE_HEIGHT_CLS],
  style: {
    width: 412,
  },
  bodyCls: "py-0",
  withHeaderDivider: false,
  withFooterDivider: false,
  withActions: true,
  formId: "app-settings-form",
});
