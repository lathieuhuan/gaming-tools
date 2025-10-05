import { FaBalanceScaleLeft, FaCopy, FaSave, FaShareAlt, FaArrowUp, FaPlus, FaCheck } from "react-icons/fa";
import { FaSun } from "react-icons/fa6";
import { MdDownload } from "react-icons/md";
import { SiTarget } from "react-icons/si";
import { Button, ButtonGroup, FancyBackSvg, Input, TrashCanSvg, type ButtonProps } from "rond";

import { NewSetupManageInfo, selectActiveId, updateCalculator } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useOptimizeSystem } from "@OptimizeDept/index";
import { useCalcModalCtrl } from "../../ContextProvider";
import { useSetupDirectorKit } from "../../SetupDirector";

interface SetupManagerSmallProps {
  onClose: () => void;
}
export function SetupManagerSmall({ onClose }: SetupManagerSmallProps) {
  const activeId = useSelector(selectActiveId);
  const calcModalCtrl = useCalcModalCtrl();
  const { displayedSetups, comparedSetups, canAddMoreSetup, tempStandardId, control, dispatch } = useSetupDirectorKit();
  const { state, contact } = useOptimizeSystem();

  const onSelectSetup = (id: number) => {
    if (id !== activeId) {
      dispatch(updateCalculator({ activeId: id }));
    }
    onClose();
  };

  const getActionsConfig = (setup: NewSetupManageInfo, i: number): ButtonProps[] => [
    {
      children: <TrashCanSvg />,
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
      className: setup.ID === tempStandardId ? "text-bonus" : "text-light-1",
      disabled: !setup.isCompared || comparedSetups.length <= 1,
      onClick: control.selectStandardSetup(i),
    },
    {
      children: <FaBalanceScaleLeft className="text-1.5xl" />,
      className: comparedSetups.some((comparedSetup) => comparedSetup.ID === setup.ID)
        ? "text-bonus"
        : "text-light-1",
      onClick: control.toggleSetupCompared(i),
    },
  ];

  return (
    <div>
      <div className="px-4 pt-4 flex flex-col" style={{ height: "28rem" }}>
        <div className="space-y-4">
          {displayedSetups.map((setup, setupIndex) => {
            return (
              <div key={setup.ID} className="border-b border-dark-line">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter Setup's name"
                    className="w-full"
                    value={setup.name}
                    maxLength={20}
                    onChange={control.changeSetupName(setupIndex)}
                  />

                  <div className="w-8 h-8 shrink-0">
                    {setup.status === "OLD" ? (
                      <Button
                        shape="square"
                        variant={setup.ID === activeId ? "active" : "default"}
                        icon={<FaArrowUp />}
                        onClick={() => onSelectSetup(setup.ID)}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex">
                  {getActionsConfig(setup, setupIndex).map(({ className = "", ...rest }, i) => (
                    <Button
                      key={i}
                      variant="custom"
                      shape="square"
                      withShadow={false}
                      className={`w-10 h-10 flex-center ${className}`}
                      {...rest}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {canAddMoreSetup && (
          <div className="mt-auto py-4 flex gap-4">
            <Button
              className="w-full text-black"
              icon={<MdDownload className="text-xl" />}
              onClick={calcModalCtrl.requestImportSetup}
            >
              Import
            </Button>
            <Button
              variant="custom"
              className="w-full bg-secondary-1 text-black"
              icon={<FaPlus />}
              onClick={control.addNewSetup}
            >
              Add
            </Button>
          </div>
        )}
      </div>

      <ButtonGroup
        className="p-4 bg-dark-3"
        justify="end"
        buttons={[
          {
            icon: <FancyBackSvg />,
            onClick: onClose,
          },
          {
            children: "Optimize",
            icon: <FaSun className={`text-lg ${state.status === "OPTIMIZING" ? "animate-spin" : ""}`} />,
            onClick: () => {
              contact();
              onClose();
            },
          },
          {
            children: "Apply",
            icon: <FaCheck />,
            variant: "primary",
            onClick: () => control.tryApplyNewSettings(onClose),
          },
        ]}
      />
    </div>
  );
}
