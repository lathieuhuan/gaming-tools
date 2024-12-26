import { useState } from "react";
import { FaCopy, FaSave, FaBalanceScaleLeft, FaShareAlt } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { clsx, ConfirmModal, TrashCanSvg } from "rond";

import { MAX_CALC_SETUPS } from "@Src/constants";
import Array_ from "@Src/utils/array-utils";
import { useCalcModalCtrl } from "../../ContextProvider";

// Store
import {
  selectActiveId,
  selectComparedIds,
  selectStandardId,
  selectSetupManageInfos,
  duplicateCalcSetup,
  removeCalcSetup,
  updateCalculator,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import { ComplexSelect } from "@Src/components";

type ModalState = {
  type: "REMOVE_SETUP" | "";
  setupIndex: number;
};

type ActionButtonAttrs = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SetupSelect() {
  const dispatch = useDispatch();
  const calcModalCtrl = useCalcModalCtrl();
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

  const onSelectStandard = (ID: number) => () => {
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

  const renderActionButton = ({ className, ...rest }: ActionButtonAttrs, index?: number) => {
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
        value={Array_.findById(setupManageInfos, activeId)?.ID}
        options={setupManageInfos.map((setup, i) => {
          return {
            label: setup.name,
            value: setup.ID,
            renderActions: ({ closeSelect }) => {
              const actions: ActionButtonAttrs[] = [
                {
                  className: "hover:bg-danger-1 hover:text-light-default",
                  children: <TrashCanSvg />,
                  disabled: setupManageInfos.length < 2,
                  onClick: () => {
                    openModal("REMOVE_SETUP", i);
                    closeSelect();
                  },
                },
                {
                  className: "hover:bg-primary-1",
                  children: <FaShareAlt />,
                  onClick: () => {
                    calcModalCtrl.requestShareSetup(setup.ID);
                    closeSelect();
                  },
                },
                {
                  className: "hover:bg-primary-1",
                  children: <FaSave />,
                  onClick: () => {
                    calcModalCtrl.requestSaveSetup(setup.ID);
                    closeSelect();
                  },
                },
                {
                  className: "hover:bg-primary-1" + (isAtMax ? " bg-light-disabled" : ""),
                  children: <FaCopy />,
                  disabled: isAtMax,
                  onClick: onClickCopySetup(setup.ID),
                },
                {
                  className: setup.ID === standardId ? "bg-bonus-color" : "bg-light-default",
                  children: <SiTarget className="text-1.5xl" />,
                  disabled: comparedIds.length < 2 || !comparedIds.includes(setup.ID),
                  onClick: onSelectStandard(setup.ID),
                },
                {
                  className: comparedIds.includes(setup.ID) ? "bg-bonus-color" : "bg-light-default",
                  children: <FaBalanceScaleLeft className="text-1.5xl" />,
                  disabled: setupManageInfos.length < 2,
                  onClick: onClickToggleCompared(setup.ID),
                },
              ];

              return <div className="ml-auto flex justify-end">{actions.map(renderActionButton)}</div>;
            },
          };
        })}
        onChange={onClickSetupName}
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
