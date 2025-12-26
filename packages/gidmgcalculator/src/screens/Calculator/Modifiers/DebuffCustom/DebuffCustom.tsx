import type { CustomDebuffCtrl } from "@/types";

import { useTranslation } from "@/hooks";
import { useCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";

import { CopySelect, CustomModLayout, ModItemRenderConfig } from "../CustomModLayout";
import { DebuffCtrlForm } from "./DebuffCtrlForm";

export function DebuffCustom() {
  const { t } = useTranslation();

  const customDebuffCtrls = useCalcStore((state) => selectSetup(state).customDebuffCtrls);

  const items = customDebuffCtrls.map<ModItemRenderConfig>((ctrl) => {
    return {
      label: `${t(ctrl.type, { ns: "resistance" })} reduction (%)`,
      value: ctrl.value,
      min: 0,
      max: 200,
    };
  });

  const handleUpdateCtrls = (newCtrls: CustomDebuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.customDebuffCtrls = newCtrls;
    });
  };

  return (
    <CustomModLayout
      items={items}
      copySelect={items.length === 0 && <CopySelect type="customDebuffCtrls" />}
      createModalProps={{
        title: "Add custom debuffs",
      }}
      renderCreateForm={(props) => {
        return (
          <DebuffCtrlForm
            {...props}
            onSubmit={(config) => {
              handleUpdateCtrls(customDebuffCtrls.concat(config));
              props.onSubmit();
            }}
          />
        );
      }}
      onValueChange={(value, index) => {
        handleUpdateCtrls(
          customDebuffCtrls.map((ctrl, i) => (i === index ? { ...ctrl, value } : ctrl))
        );
      }}
      onRemoveItem={(ctrlIndex) => {
        handleUpdateCtrls(customDebuffCtrls.filter((_, index) => index !== ctrlIndex));
      }}
      onRemoveAll={() => {
        handleUpdateCtrls([]);
      }}
    />
  );
}
