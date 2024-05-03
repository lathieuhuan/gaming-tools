import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { clsx, CloseButton, Modal, Button, InputNumber } from "rond";

import type { CustomBuffCtrl, CustomDebuffCtrl } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { Utils_, toCustomBuffLabel } from "@Src/utils";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectActiveId,
  selectSetupManageInfos,
  selectCalcSetupsById,
  updateCustomBuffCtrls,
  updateCustomDebuffCtrls,
  removeCustomModCtrl,
} from "@Store/calculator-slice";

// Component
import { CopySection } from "../../components/CopySection";
import BuffCtrlCreator from "./BuffCtrlCreator";
import DebuffCtrlCreator from "./DebuffCtrlCreator";

const isBuffCtrl = (ctrl: CustomBuffCtrl | CustomDebuffCtrl): ctrl is CustomBuffCtrl => {
  return "category" in ctrl;
};

interface CustomModifiersProps {
  isBuffs: boolean;
}
export default function CustomModifiers({ isBuffs }: CustomModifiersProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const key = isBuffs ? "customBuffCtrls" : "customDebuffCtrls";

  const activeId = useSelector(selectActiveId);
  const setupsById = useSelector(selectCalcSetupsById);
  const setupManageInfos = useSelector(selectSetupManageInfos);

  const [modalOn, setModalOn] = useState(false);

  const modCtrls = setupsById[activeId][key];
  const updateCustomModCtrls = isBuffs ? updateCustomBuffCtrls : updateCustomDebuffCtrls;
  const copyOptions = [];

  if (!modCtrls.length) {
    for (const { ID, name } of setupManageInfos) {
      if (setupsById[ID][key].length) {
        copyOptions.push({
          label: name,
          value: ID,
        });
      }
    }
  }

  const copyModCtrls = ({ value }: { value: number }) => {
    if (isBuffs) {
      dispatch(
        updateCustomBuffCtrls({
          actionType: "REPLACE",
          ctrls: setupsById[value].customBuffCtrls,
        })
      );
    } else {
      dispatch(
        updateCustomDebuffCtrls({
          actionType: "REPLACE",
          ctrls: setupsById[value].customDebuffCtrls,
        })
      );
    }
  };

  const closeModal = () => setModalOn(false);

  return (
    <div className="flex flex-col">
      <div className="mt-3 flex justify-between">
        <Button
          icon={<FaTrashAlt />}
          disabled={modCtrls.length === 0}
          onClick={() => {
            dispatch(updateCustomModCtrls({ actionType: "REPLACE", ctrls: [] }));
          }}
        />
        <Button icon={<FaPlus />} variant="primary" disabled={modCtrls.length > 9} onClick={() => setModalOn(true)} />
      </div>

      {copyOptions.length ? <CopySection className="mt-6" options={copyOptions} onClickCopy={copyModCtrls} /> : null}

      <div className="mt-6 flex flex-col-reverse space-y-4 space-y-reverse" style={{ marginLeft: "-0.5rem" }}>
        {modCtrls.map((ctrl, ctrlIndex) => {
          let label = "";
          let min = 0;
          let max = 0;

          if (isBuffCtrl(ctrl)) {
            const sign = Utils_.suffixOf(ctrl.subType || ctrl.type);

            min = sign ? -99 : -9999;
            max = sign ? 999 : 99_999;
            label = clsx(
              toCustomBuffLabel(ctrl.category, ctrl.type, t),
              ctrl.subType && ` ${t(ctrl.subType)}`,
              sign && `(${sign})`
            );
          } else {
            max = 200;
            label = `${t(ctrl.type, { ns: "resistance" })} reduction (%)`;
          }

          return (
            <div key={ctrlIndex} className="flex items-center">
              <CloseButton
                boneOnly
                onClick={() => {
                  dispatch(removeCustomModCtrl({ isBuffs, ctrlIndex }));
                }}
              />
              <p className="pl-1 pr-2 text-sm capitalize">{label}</p>

              <InputNumber
                className="ml-auto w-16 font-semibold"
                size="medium"
                min={min}
                max={max}
                maxDecimalDigits={1}
                step="0.1"
                value={ctrl.value}
                onChange={(value) => {
                  dispatch(
                    updateCustomModCtrls({
                      actionType: "EDIT",
                      ctrls: {
                        index: ctrlIndex,
                        value,
                      },
                    })
                  );
                }}
              />
            </div>
          );
        })}
      </div>

      {isBuffs ? (
        <Modal
          active={modalOn}
          title="Add custom buffs"
          className="bg-surface-1"
          style={{ minWidth: 304 }}
          withActions
          withHeaderDivider={false}
          formId="buff-creator"
          onClose={closeModal}
        >
          <BuffCtrlCreator onClose={closeModal} />
        </Modal>
      ) : (
        <Modal
          active={modalOn && !isBuffs}
          title="Add custom debuffs"
          className="bg-surface-1"
          withActions
          formId="debuff-creator"
          onClose={closeModal}
        >
          <DebuffCtrlCreator onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
