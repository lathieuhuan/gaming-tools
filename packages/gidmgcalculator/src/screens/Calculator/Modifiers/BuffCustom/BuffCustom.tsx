import { clsx } from "rond";

import type { CustomBuffCtrl } from "@/types";

import { useTranslation } from "@/hooks";
import { suffixOf, toCustomBuffLabel } from "@/utils";
import { useCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";

import { CustomModLayout, CopySelect, ModItemRenderConfig } from "../CustomModLayout";
import { BuffCtrlForm } from "./BuffCtrlForm";

export function BuffCustom() {
  const { t } = useTranslation();

  const customBuffCtrls = useCalcStore((state) => selectSetup(state).customBuffCtrls);

  const items = customBuffCtrls.map<ModItemRenderConfig>((ctrl) => {
    const sign = suffixOf(ctrl.subType || ctrl.type);

    return {
      label: clsx(
        toCustomBuffLabel(ctrl.category, ctrl.type, t),
        ctrl.subType && ` ${t(ctrl.subType)}`,
        sign && `(${sign})`
      ),
      value: ctrl.value,
      min: sign ? -99 : -9999,
      max: sign ? 999 : 99_999,
    };
  });

  const handleUpdateCtrls = (newCtrls: CustomBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.customBuffCtrls = newCtrls;
    });
  };

  return (
    <CustomModLayout
      items={items}
      copySelect={items.length === 0 && <CopySelect type="customBuffCtrls" />}
      createModalProps={{
        title: "Add custom buffs",
        style: { minWidth: 304 },
      }}
      renderCreateForm={(props) => (
        <BuffCtrlForm
          {...props}
          onSubmit={(config) => {
            handleUpdateCtrls(customBuffCtrls.concat(config));
            props.onSubmit();
          }}
        />
      )}
      onValueChange={(value, index) => {
        handleUpdateCtrls(
          customBuffCtrls.map((ctrl, i) => (i === index ? { ...ctrl, value } : ctrl))
        );
      }}
      onRemoveItem={(ctrlIndex) => {
        handleUpdateCtrls(customBuffCtrls.filter((_, index) => index !== ctrlIndex));
      }}
      onRemoveAll={() => {
        handleUpdateCtrls([]);
      }}
    />
  );
}
