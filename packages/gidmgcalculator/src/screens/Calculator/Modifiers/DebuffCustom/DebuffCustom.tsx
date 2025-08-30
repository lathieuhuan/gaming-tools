import { useTranslation } from "@/hooks";

// Store
import {
  removeCustomModCtrl,
  selectActiveId,
  selectCalcSetupsById,
  selectSetupManageInfos,
  updateCustomDebuffCtrls,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

import { CopyOption, CustomModifierLayout, ModItemRenderConfig } from "../_components/CustomModifierLayout";
import DebuffCtrlCreator from "./DebuffCtrlCreator";

export default function DebuffCustom() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const activeId = useSelector(selectActiveId);
  const setupsById = useSelector(selectCalcSetupsById);
  const setupManageInfos = useSelector(selectSetupManageInfos);

  const debuffCtrls = setupsById[activeId].customDebuffCtrls;

  const items = debuffCtrls.map<ModItemRenderConfig>((ctrl) => {
    return {
      label: `${t(ctrl.type, { ns: "resistance" })} reduction (%)`,
      value: ctrl.value,
      min: 0,
      max: 200,
    };
  });

  const copyOptions: CopyOption[] = [];

  if (!items.length) {
    for (const { ID, name } of setupManageInfos) {
      if (setupsById[ID].customDebuffCtrls.length) {
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
        title: "Add custom debuffs",
        formId: "debuff-creator",
      }}
      onCopy={(option: CopyOption) => {
        dispatch(
          updateCustomDebuffCtrls({
            actionType: "REPLACE",
            ctrls: setupsById[option.value].customDebuffCtrls,
          })
        );
      }}
      onChangeValue={(value, index) => {
        dispatch(
          updateCustomDebuffCtrls({
            actionType: "EDIT",
            ctrls: { index, value },
          })
        );
      }}
      onRemoveItem={(ctrlIndex) => {
        dispatch(removeCustomModCtrl({ isBuffs: false, ctrlIndex }));
      }}
      onRemoveAll={() => {
        dispatch(updateCustomDebuffCtrls({ actionType: "REPLACE", ctrls: [] }));
      }}
    >
      {(close) => <DebuffCtrlCreator onClose={close} />}
    </CustomModifierLayout>
  );
}
