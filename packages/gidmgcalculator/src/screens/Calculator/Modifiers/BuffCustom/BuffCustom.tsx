import { clsx } from "rond";

import { useTranslation } from "@Src/hooks";
import { suffixOf, toCustomBuffLabel } from "@Src/utils";

// Store
import {
  removeCustomModCtrl,
  selectActiveId,
  selectCalcSetupsById,
  selectSetupManageInfos,
  updateCustomBuffCtrls,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

import { CopyOption, CustomModifierLayout, ModItemRenderConfig } from "../_components/CustomModifierLayout";
import BuffCtrlCreator from "./BuffCtrlCreator";

export default function BuffCustom() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const activeId = useSelector(selectActiveId);
  const setupsById = useSelector(selectCalcSetupsById);
  const setupManageInfos = useSelector(selectSetupManageInfos);

  const buffCtrls = setupsById[activeId].customBuffCtrls;

  const items = buffCtrls.map<ModItemRenderConfig>((ctrl) => {
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

  const copyOptions: CopyOption[] = [];

  if (!items.length) {
    for (const { ID, name } of setupManageInfos) {
      if (setupsById[ID].customBuffCtrls.length) {
        copyOptions.push({
          label: name,
          value: ID,
        });
      }
    }
  }

  return (
    <CustomModifierLayout
      items={items}
      copyOptions={copyOptions}
      creatorModalProps={{
        title: "Add custom buffs",
        style: { minWidth: 304 },
        formId: "buff-creator",
      }}
      onCopy={(option: CopyOption) => {
        dispatch(
          updateCustomBuffCtrls({
            actionType: "REPLACE",
            ctrls: setupsById[option.value].customBuffCtrls,
          })
        );
      }}
      onChangeValue={(value, index) => {
        dispatch(
          updateCustomBuffCtrls({
            actionType: "EDIT",
            ctrls: { index, value },
          })
        );
      }}
      onRemoveItem={(ctrlIndex) => {
        dispatch(removeCustomModCtrl({ isBuffs: true, ctrlIndex }));
      }}
      onRemoveAll={() => {
        dispatch(updateCustomBuffCtrls({ actionType: "REPLACE", ctrls: [] }));
      }}
    >
      {(close) => <BuffCtrlCreator onClose={close} />}
    </CustomModifierLayout>
  );
}
