import { useRef } from "react";
import { Modal } from "rond";

import type { TravelerInfo, TravelerKey } from "@/types";

import { $AppSettings, AppSettings } from "@/services";
import { useDynamicStoreControl } from "@/systems/dynamic-store";
import { genAccountTravelerKey, selectTraveler, updateTraveler } from "@Store/account-slice";
import { applySettings } from "@Store/calculator/actions";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

import { AccountSettingsControls } from "./AccountSettingsControls";
import { AppSettingsControls } from "./AppSettingsControls";

const useAppSettings = () => {
  const settings = useRef<AppSettings>();

  if (!settings.current) {
    settings.current = $AppSettings.get();
  }
  return settings.current;
};

type SettingsProps = {
  onClose: () => void;
};

const SettingsCore = ({ onClose }: SettingsProps) => {
  const dispatch = useDispatch();
  const traveler = useSelector(selectTraveler);

  const newSettings = useAppSettings();
  const newTraveler = useRef(traveler);

  const updateAppStoreConfig = useDynamicStoreControl();

  const handleSubmit = () => {
    const currSettings = $AppSettings.get();
    const currTraveler = newTraveler.current;
    const travelerChanged = genAccountTravelerKey(currTraveler) !== genAccountTravelerKey(traveler);

    if (travelerChanged) {
      // updateTraveler must run before applySettings
      dispatch(updateTraveler(currTraveler));
    }

    applySettings(currSettings.separateCharInfo && !newSettings.separateCharInfo, travelerChanged);

    if (newSettings.isTabLayout !== currSettings.isTabLayout) {
      dispatch(
        updateUI({
          isTabLayout: newSettings.isTabLayout,
        })
      );
    }

    if (newSettings.persistUserData !== currSettings.persistUserData) {
      updateAppStoreConfig({
        persistUserData: newSettings.persistUserData,
      });
    }

    $AppSettings.set(newSettings);
    onClose();
  };

  const handleAppSettingChange = <TKey extends keyof AppSettings>(
    key: TKey,
    value: AppSettings[TKey]
  ) => {
    newSettings[key] = value;
  };

  const handleTravelerSelect = (selection: TravelerKey) => {
    newTraveler.current = { ...newTraveler.current, selection };
  };

  const handlePowerupsChange = (key: keyof TravelerInfo["powerups"], value: boolean) => {
    newTraveler.current = {
      ...newTraveler.current,
      powerups: {
        ...newTraveler.current.powerups,
        [key]: value,
      },
    };
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
      <AccountSettingsControls
        initialTraveler={newTraveler.current}
        onChangeSelection={handleTravelerSelect}
        onChangePowerups={handlePowerupsChange}
      />
      <AppSettingsControls initialValues={newSettings} onChange={handleAppSettingChange} />
    </form>
  );
};

export const Settings = Modal.wrap(SettingsCore, {
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
