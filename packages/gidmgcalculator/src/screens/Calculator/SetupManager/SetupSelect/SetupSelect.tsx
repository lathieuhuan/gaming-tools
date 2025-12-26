import { useState } from "react";
import { FaBalanceScaleLeft, FaCopy, FaSave, FaShareAlt } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { clsx, ConfirmModal, TrashCanSvg } from "rond";

import { MAX_CALC_SETUPS } from "@/constants/config";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { duplicateSetup, removeSetup, updateCalculator } from "@Store/calculator/actions";
import { useCalcModalCtrl } from "../../ContextProvider";

// Component
import { ComplexSelect } from "@/components";

type ModalState = {
  type: "REMOVE_SETUP" | "";
  setupIndex: number;
};

type ActionButtonAttrs = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SetupSelect() {
  const calcModalCtrl = useCalcModalCtrl();

  const { activeId, setupManagers, standardId, comparedIds } = useShallowCalcStore((state) =>
    Object_.pickProps(state, ["activeId", "setupManagers", "standardId", "comparedIds"])
  );

  const [modal, setModal] = useState<ModalState>({
    type: "",
    setupIndex: 0,
  });

  const isAtMax = setupManagers.length === MAX_CALC_SETUPS;

  const openModal = (type: ModalState["type"], setupIndex: number) =>
    setModal({ type, setupIndex });

  const closeModal = () => setModal({ type: "", setupIndex: 0 });

  const handleClickSetupName = (newID: string | number) => {
    if (+newID !== activeId) {
      updateCalculator({ activeId: +newID });
    }
  };

  const handleSelectStandard = (ID: number) => () => {
    if (ID !== standardId) {
      updateCalculator({ standardId: ID });
    }
  };

  const handleToggleCompared = (ID: number) => () => {
    let newStandardId = standardId;
    const newComparedIds = comparedIds.includes(ID)
      ? comparedIds.filter((id) => id !== ID)
      : comparedIds.concat(ID);

    if (newComparedIds.length === 0) {
      newStandardId = 0;
    } else if (newComparedIds.length === 1 || !newComparedIds.includes(newStandardId)) {
      newStandardId = newComparedIds[0];
    }

    updateCalculator({
      standardId: newStandardId,
      comparedIds: newComparedIds,
    });
  };

  const renderActionButton = ({ className, ...rest }: ActionButtonAttrs, index?: number) => {
    return (
      <button
        key={index}
        className={clsx(
          "h-9 w-9 border-l border-b border-white flex-center shrink-0 disabled:bg-light-4 disabled:text-black",
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
        value={Array_.findById(setupManagers, activeId)?.ID}
        options={setupManagers.map((setup, i) => {
          return {
            label: setup.name,
            value: setup.ID,
            renderActions: ({ closeSelect }) => {
              const actions: ActionButtonAttrs[] = [
                {
                  className: "hover:bg-danger-1 hover:text-light-1",
                  children: <TrashCanSvg />,
                  disabled: setupManagers.length < 2,
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
                  className: "hover:bg-primary-1" + (isAtMax ? " bg-light-4" : ""),
                  children: <FaCopy />,
                  disabled: isAtMax,
                  onClick: () => duplicateSetup(setup.ID),
                },
                {
                  className: setup.ID === standardId ? "bg-bonus" : "bg-light-1 hover:bg-primary-1",
                  children: <SiTarget className="text-1.5xl" />,
                  disabled: comparedIds.length < 2 || !comparedIds.includes(setup.ID),
                  onClick: handleSelectStandard(setup.ID),
                },
                {
                  className: comparedIds.includes(setup.ID)
                    ? "bg-bonus"
                    : "bg-light-1 hover:bg-primary-1",
                  children: <FaBalanceScaleLeft className="text-1.5xl" />,
                  disabled: setupManagers.length < 2,
                  onClick: handleToggleCompared(setup.ID),
                },
              ];

              return (
                <div className="ml-auto flex justify-end">{actions.map(renderActionButton)}</div>
              );
            },
          };
        })}
        onChange={handleClickSetupName}
      />

      <ConfirmModal
        active={modal.type === "REMOVE_SETUP"}
        danger
        message={
          <>
            Remove <b>{setupManagers[modal.setupIndex]?.name}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => removeSetup(setupManagers[modal.setupIndex]?.ID)}
        onClose={closeModal}
      />
    </>
  );
}
