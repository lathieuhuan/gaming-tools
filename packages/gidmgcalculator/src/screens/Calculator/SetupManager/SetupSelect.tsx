import { ComponentProps, useId, useState } from "react";
import { FaBalanceScaleLeft, FaCopy, FaSave, FaShareAlt } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { Array_, Object_ } from "ron-utils";
import { ClassValue, clsx, ConfirmModal, TrashCanSvg } from "rond";

import { SETUP_PORTER_MODAL_PROPS } from "@/components/SetupPorters";
import { MAX_CALC_SETUPS } from "@/constants/config";
import { useShallowCalcStore } from "@Store/calculator";
import { duplicateSetup, removeSetup, updateCalculator } from "@Store/calculator/actions";
import { useCalcModalCtrl } from "../ContextProvider";

// Component
import { ComplexSelect, ComplexSelectOption } from "@/components/ComplexSelect";
import { ModalAction } from "@/components/ModalAction";
import { CalcSetupExporter } from "../components/CalcSetupExporter";

type ModalState = {
  type: "REMOVE_SETUP" | "";
  setupIndex: number;
};

export function SetupSelect() {
  const id = useId();
  const calcModalCtrl = useCalcModalCtrl();

  const { activeId, setupManagers, standardId, comparedIds } = useShallowCalcStore((state) =>
    Object_.extract(state, ["activeId", "setupManagers", "standardId", "comparedIds"]),
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

  const options: ComplexSelectOption<number>[] = setupManagers.map((setup, i) => {
    return {
      label: setup.name,
      value: setup.ID,
      renderActions: ({ closeSelect }) => (
        <div className="ml-auto flex justify-end">
          <Action
            danger
            disabled={setupManagers.length < 2}
            onClick={() => {
              openModal("REMOVE_SETUP", i);
              closeSelect();
            }}
          >
            <TrashCanSvg />
          </Action>

          <ModalAction
            title={`Share "${setup.name}"`}
            {...SETUP_PORTER_MODAL_PROPS}
            content={(_, setOpen) => (
              <CalcSetupExporter setupId={setup.ID} onCancel={() => setOpen(false)} />
            )}
          >
            <Action onClick={closeSelect}>
              <FaShareAlt />
            </Action>
          </ModalAction>

          <Action
            onClick={() => {
              calcModalCtrl.requestSaveSetup(setup.ID);
              closeSelect();
            }}
          >
            <FaSave />
          </Action>

          <Action disabled={isAtMax} onClick={() => duplicateSetup(setup.ID)}>
            <FaCopy />
          </Action>

          <Action
            className="text-xlp"
            active={comparedIds.includes(setup.ID)}
            disabled={setupManagers.length < 2}
            onClick={handleToggleCompared(setup.ID)}
          >
            <FaBalanceScaleLeft />
          </Action>

          <Action
            className="text-xlp"
            active={setup.ID === standardId}
            disabled={comparedIds.length < 2 || !comparedIds.includes(setup.ID)}
            onClick={handleSelectStandard(setup.ID)}
          >
            <SiTarget />
          </Action>
        </div>
      ),
    };
  });

  return (
    <>
      <ComplexSelect
        selectId={id}
        value={Array_.findById(setupManagers, activeId)?.ID}
        options={options}
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

type ActionProps = Omit<ComponentProps<"button">, "className"> & {
  className?: ClassValue;
  danger?: boolean;
  active?: boolean;
};

function Action({ className, danger, active, ...rest }: ActionProps) {
  return (
    <button
      type="button"
      className={clsx(
        "size-9 border-l border-b border-white flex-center shrink-0 disabled:bg-light-4 disabled:text-black",
        {
          "bg-active": active,
          "hover:bg-primary-1": !active && !danger,
          "hover:bg-danger-1 hover:text-light-1": danger,
        },
        className,
      )}
      {...rest}
    />
  );
}
