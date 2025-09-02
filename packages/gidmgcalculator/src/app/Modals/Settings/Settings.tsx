import { useRef } from "react";
import { Modal } from "rond";

import type { TravelerInfo, TravelerKey } from "@/types";

import { SCREEN_PATH } from "@/constants";
import { $AppCharacter, $AppSettings, AppSettings } from "@/services";
import { useDynamicStoreControl } from "@/systems/dynamic-store";
import { useRouter } from "@/systems/router";
import { genAccountTravelerKey, selectTraveler, updateTraveler } from "@Store/account-slice";
import { applySettings } from "@Store/calculator-slice";
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
  const router = useRouter();
  const traveler = useSelector(selectTraveler);

  const newAppSettings = useAppSettings();
  const newTraveler = useRef(traveler);

  const updateAppStoreConfig = useDynamicStoreControl();

  const handleSubmit = () => {
    const currSettings = $AppSettings.get();
    const currTraveler = newTraveler.current;
    const travelerChanged = genAccountTravelerKey(currTraveler) !== genAccountTravelerKey(traveler);

    if (travelerChanged) {
      // updateTraveler must run before applySettings
      dispatch(updateTraveler(currTraveler));
      router.navigate(SCREEN_PATH.CALCULATOR);
    }

    dispatch(
      applySettings({
        mergeCharInfo: !currSettings.separateCharInfo && newAppSettings.separateCharInfo,
        travelerChanged,
      })
    );

    if (newAppSettings.isTabLayout !== currSettings.isTabLayout) {
      dispatch(
        updateUI({
          isTabLayout: newAppSettings.isTabLayout,
        })
      );
    }

    if (newAppSettings.persistUserData !== currSettings.persistUserData) {
      updateAppStoreConfig({
        persistUserData: newAppSettings.persistUserData,
      });
    }

    $AppSettings.set(newAppSettings);
    onClose();
  };

  const handleAppSettingChange = <TKey extends keyof AppSettings>(key: TKey, value: AppSettings[TKey]) => {
    newAppSettings[key] = value;
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
      <AppSettingsControls initialValues={newAppSettings} onChange={handleAppSettingChange} />
    </form>
  );
};

export const Settings = Modal.wrap(SettingsCore, {
  title: "Settings",
  className: ["bg-surface-2", Modal.LARGE_HEIGHT_CLS],
  style: {
    width: 412,
  },
  bodyCls: "py-0",
  withHeaderDivider: false,
  withFooterDivider: false,
  withActions: true,
  formId: "app-settings-form",
});
