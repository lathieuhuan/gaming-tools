import { useState, type ButtonHTMLAttributes } from "react";
import { FaCopy, FaSave, FaBalanceScaleLeft, FaTrashAlt, FaShareAlt } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { clsx, Modal, ConfirmModal } from "rond";

import type { CalcSetupManageInfo } from "@Src/types";
import { MAX_CALC_SETUPS } from "@Src/constants";
import { findById, Setup_ } from "@Src/utils";

// Store
import {
  selectActiveId,
  selectComparedIds,
  selectStandardId,
  selectSetupManageInfos,
  selectTarget,
  duplicateCalcSetup,
  removeCalcSetup,
  updateCalculator,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import { ComplexSelect, SetupExporter } from "@Src/components";
import { SaveSetup } from "./SaveSetup";

type ModalState = {
  type: "SAVE_SETUP" | "REMOVE_SETUP" | "SHARE_SETUP" | "";
  setupIndex: number;
};

interface CalcSetupExporterProps extends CalcSetupManageInfo {
  active: boolean;
  onClose: () => void;
}
const CalcSetupExporter = ({ name, ID, ...rest }: CalcSetupExporterProps) => {
  const calculator = useSelector((state) => state.calculator);
  const target = useSelector(selectTarget);

  return (
    calculator.setupsById[ID] && (
      <SetupExporter
        setupName={name}
        calcSetup={{
          ...Setup_.cleanupCalcSetup(calculator, ID),
          weapon: calculator.setupsById[ID].weapon,
          artifacts: calculator.setupsById[ID].artifacts,
        }}
        target={target}
        {...rest}
      />
    )
  );
};

export function SetupSelect() {
  const dispatch = useDispatch();

  const activeId = useSelector(selectActiveId);
  const setupManageInfos = useSelector(selectSetupManageInfos);
  const standardId = useSelector(selectStandardId);
  const comparedIds = useSelector(selectComparedIds);

  const [modal, setModal] = useState<ModalState>({
    type: "",
    setupIndex: 0,
  });

  const isAtMax = setupManageInfos.length === MAX_CALC_SETUPS;

  const openModal = (type: ModalState["type"], setupIndex: number) => setModal({ type, setupIndex });

  const closeModal = () => setModal({ type: "", setupIndex: 0 });

  const onClickSetupName = (newID: string | number) => {
    if (+newID !== activeId) {
      dispatch(updateCalculator({ activeId: +newID }));
    }
  };

  const onClickChooseStandard = (ID: number) => () => {
    if (ID !== standardId) {
      dispatch(updateCalculator({ standardId: ID }));
    }
  };

  const onClickToggleCompared = (ID: number) => () => {
    let newStandardId = standardId;
    const newComparedIds = comparedIds.includes(ID) ? comparedIds.filter((id) => id !== ID) : comparedIds.concat(ID);

    if (newComparedIds.length === 0) {
      newStandardId = 0;
    } else if (newComparedIds.length === 1 || !newComparedIds.includes(newStandardId)) {
      newStandardId = newComparedIds[0];
    }

    dispatch(
      updateCalculator({
        standardId: newStandardId,
        comparedIds: newComparedIds,
      })
    );
  };

  const onClickCopySetup = (ID: number) => () => {
    dispatch(duplicateCalcSetup(ID));
  };

  const renderActionButton = ({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>, index?: number) => {
    return (
      <button
        key={index}
        className={clsx(
          "h-9 w-9 border-l border-b border-white flex-center shrink-0 disabled:bg-light-disabled disabled:text-black",
          className
        )}
        {...rest}
      />
    );
  };

  return (
    <>
      <ComplexSelect
        selectId="setup-select"
        value={findById(setupManageInfos, activeId)?.ID}
        options={setupManageInfos.map(({ name, ID }, i) => {
          return {
            label: name,
            value: ID,
            renderActions: ({ closeSelect }) => {
              const actions: Array<ButtonHTMLAttributes<HTMLButtonElement>> = [
                {
                  className: ID === standardId ? "bg-bonus-color" : "bg-light-default",
                  children: <SiTarget className="text-1.5xl" />,
                  disabled: comparedIds.length < 2 || !comparedIds.includes(ID),
                  onClick: onClickChooseStandard(ID),
                },
                {
                  className: comparedIds.includes(ID) ? "bg-bonus-color" : "bg-light-default",
                  children: <FaBalanceScaleLeft className="text-1.5xl" />,
                  disabled: setupManageInfos.length < 2,
                  onClick: onClickToggleCompared(ID),
                },
                {
                  className: "hover:bg-primary-1" + (isAtMax ? " bg-light-disabled" : ""),
                  children: <FaCopy />,
                  disabled: isAtMax,
                  onClick: onClickCopySetup(ID),
                },
                {
                  className: "hover:bg-primary-1",
                  children: <FaSave />,
                  onClick: () => {
                    openModal("SAVE_SETUP", i);
                    closeSelect();
                  },
                },
                {
                  className: "hover:bg-primary-1",
                  children: <FaShareAlt />,
                  onClick: () => {
                    openModal("SHARE_SETUP", i);
                    closeSelect();
                  },
                },
                {
                  className: "hover:bg-danger-1 hover:text-light-default",
                  children: <FaTrashAlt />,
                  disabled: setupManageInfos.length < 2,
                  onClick: () => {
                    openModal("REMOVE_SETUP", i);
                    closeSelect();
                  },
                },
              ];

              return <div className="ml-auto flex justify-end">{actions.map(renderActionButton)}</div>;
            },
          };
        })}
        onChange={onClickSetupName}
      />

      <Modal
        active={modal.type === "SAVE_SETUP"}
        preset="small"
        className="bg-surface-1"
        title="Save setup"
        onClose={closeModal}
      >
        <SaveSetup manageInfo={setupManageInfos[modal.setupIndex]} onClose={closeModal} />
      </Modal>

      <CalcSetupExporter
        active={modal.type === "SHARE_SETUP"}
        {...setupManageInfos[modal.setupIndex]}
        onClose={closeModal}
      />

      <ConfirmModal
        active={modal.type === "REMOVE_SETUP"}
        danger
        message={
          <>
            Remove <b>{setupManageInfos[modal.setupIndex]?.name}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => dispatch(removeCalcSetup(setupManageInfos[modal.setupIndex]?.ID))}
        onClose={closeModal}
      />
    </>
  );
}
