import { useRef } from "react";
import { Object_ } from "ron-utils";
import { Modal, ModalControl } from "rond";

import type { ElementType, TravelerConfig, TravelerKey } from "@/types";

import { TOUR_STEP_ID } from "@/constants/ui";
import { genAccountTravelerKey } from "@/logic/genAccountTravelerKey";
import { changeTraveler } from "@/services/app-data";
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
  onClose?: () => void;
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
      changeTraveler(newTraveler);
    }

    updateSettings(newSettings);

    applySettingsToCalculator(
      currSettings.separateCharInfo && !newSettings.separateCharInfo,
      travelerChanged,
    );

    onClose?.();
  };

  const handleAppSettingChange = <TKey extends keyof AppSettingsState>(
    key: TKey,
    value: AppSettingsState[TKey],
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

// export const SettingsModal = Modal.wrap(Settings, {
//   id: TOUR_STEP_ID.settingsModal,
//   title: "Settings",
//   className: ["w-103 bg-dark-2", Modal.LARGE_HEIGHT_CLS],
//   bodyCls: "py-0",
//   withHeaderDivider: false,
//   withFooterDivider: false,
//   withActions: true,
//   formId: "app-settings-form",
// });

export const SettingsModal = (props: ModalControl) => {
  return (
    <Modal
      id={TOUR_STEP_ID.settingsModal}
      title="Settings"
      className={["w-103 bg-dark-2", Modal.LARGE_HEIGHT_CLS]}
      bodyCls="py-0"
      withHeaderDivider={false}
      withFooterDivider={false}
      withActions={true}
      formId="app-settings-form"
      confirmButtonProps={{
        id: TOUR_STEP_ID.saveSettings,
      }}
      {...props}
    >
      <Settings onClose={props.onClose} />
    </Modal>
  );
};
