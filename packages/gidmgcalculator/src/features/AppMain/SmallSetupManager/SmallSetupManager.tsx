import { FaBalanceScaleLeft, FaCopy, FaSave, FaShareAlt, FaTrashAlt, FaArrowUp } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { Button, ButtonGroup, Input } from "rond";

import { NewSetupManageInfo, selectActiveId, updateCalculator } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useCalculatorModalControl, useSetupDirectorKit } from "@Src/screens/Calculator";

type ActionButtonAttrs = React.ButtonHTMLAttributes<HTMLButtonElement>;

interface SmallSetupManagerProps {
  onClose: () => void;
}
export function SmallSetupManager({ onClose }: SmallSetupManagerProps) {
  const activeId = useSelector(selectActiveId);
  const calcModalCtrl = useCalculatorModalControl();
  const { displayedSetups, comparedSetups, canAddMoreSetup, tempStandardId, control, dispatch } = useSetupDirectorKit();

  const onSelectSetup = (id: number) => {
    if (id !== activeId) {
      dispatch(updateCalculator({ activeId: id }));
    }
    onClose();
  };

  const renderActions = (setup: NewSetupManageInfo, i: number): ActionButtonAttrs[] => [
    {
      children: <FaTrashAlt className="text-lg" />,
      disabled: displayedSetups.length <= 1,
      onClick: control.removeSetup(i),
    },
    {
      children: <FaShareAlt className="text-lg" />,
      disabled: setup.status !== "OLD",
      onClick: () => {
        calcModalCtrl.requestShareSetup(setup.ID);
      },
    },
    {
      children: <FaSave className="text-lg" />,
      disabled: setup.status !== "OLD",
      onClick: () => {
        calcModalCtrl.requestSaveSetup(setup.ID);
        onClose();
      },
    },
    {
      children: <FaCopy className="text-lg" />,
      disabled: !canAddMoreSetup,
      onClick: control.copySetup(i),
    },
    {
      children: <SiTarget className="text-1.5xl" />,
      className: setup.ID === tempStandardId ? "text-bonus-color" : "text-light-default",
      disabled: !setup.isCompared || comparedSetups.length <= 1,
      onClick: control.selectStandardSetup(i),
    },
    {
      children: <FaBalanceScaleLeft className="text-1.5xl" />,
      className: comparedSetups.some((comparedSetup) => comparedSetup.ID === setup.ID)
        ? "text-bonus-color"
        : "text-light-default",
      onClick: control.toggleSetupCompared(i),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        {displayedSetups.map((setup, setupIndex) => {
          return (
            <div key={setup.ID} className="border-b border-surface-border">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter Setup's name"
                  className="w-full px-3 py-1 rounded font-medium"
                  value={setup.name}
                  maxLength={20}
                  onChange={control.changeSetupName(setupIndex)}
                />

                <div className="w-8 h-8 shrink-0">
                  {setup.status === "OLD" ? (
                    <Button shape="square" icon={<FaArrowUp />} onClick={() => onSelectSetup(setup.ID)} />
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex">
                {renderActions(setup, setupIndex).map(({ className = "", ...rest }, i) => (
                  <Button
                    key={i}
                    variant="custom"
                    shape="square"
                    className={`w-10 h-10 flex-center ${className}`}
                    {...rest}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ButtonGroup
        className="mt-4"
        justify="end"
        buttons={[
          {
            children: "Import",
            onClick: () => {
              calcModalCtrl.requestImportSetup();
              onClose();
            },
          },
          {
            children: "Add",
            disabled: !canAddMoreSetup,
            onClick: control.addNewSetup,
          },
          {
            children: "Apply",
            variant: "primary",
            onClick: () => control.tryApplyNewSettings(onClose),
          },
        ]}
      />
    </div>
  );
}
