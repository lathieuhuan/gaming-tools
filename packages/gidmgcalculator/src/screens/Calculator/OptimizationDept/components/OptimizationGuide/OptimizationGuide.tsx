import { Fragment, useImperativeHandle, useState } from "react";
import { FaCaretRight, FaCaretDown, FaExclamation } from "react-icons/fa";
import { Button, ButtonGroup, clsx, Modal, Popover, useClickOutside } from "rond";

type StepStatus = "VALID" | "INVALID";

export type StepConfig = {
  title: string;
  initialValid?: boolean;
  render: (changeValid: (valid: boolean) => void) => React.ReactNode;
};

export type OptimizationGuideControl = {
  toggle: (active: boolean) => void;
  notify: (msg: string) => void;
};

interface OptimizationGuideProps {
  stepConfigs: StepConfig[];
  control?: React.RefObject<OptimizationGuideControl>;
  canShowMenu?: boolean;
  onChangStep?: (newStep: number, oldStep: number) => void;
  onComplete: () => void;
  afterClose: () => void;
}
export function OptimizationGuide(props: OptimizationGuideProps) {
  const { stepConfigs } = props;
  const stepCount = stepConfigs.length;

  const [active, setActive] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [step, setStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    stepConfigs.map((config) => (config.initialValid ? "VALID" : "INVALID"))
  );
  const [visibleIndexes, setVisibleIndexes] = useState(new Set<number>([0]));
  const [noti, setNoti] = useState({
    active: false,
    message: "",
  });

  const menuTriggerRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  const changeValidOf = (stepIndex: number) => (valid: boolean) => {
    setStepStatuses((prevStatuses) => {
      const newStatus = valid ? "VALID" : "INVALID";

      if (newStatus !== stepStatuses[stepIndex]) {
        const newStatuses = [...prevStatuses];
        newStatuses[stepIndex] = newStatus;
        return newStatuses;
      }
      return prevStatuses;
    });
  };

  useImperativeHandle(props.control, () => ({
    toggle: setActive,
    notify: (message) =>
      setNoti((prev) => ({
        active: prev.active,
        message,
      })),
  }));

  const navigate = (toStep: number) => {
    if (toStep >= stepCount) {
      return props.onComplete();
    }

    const moreVisibleSteps: number[] = [];

    for (let i = Math.min(step, toStep); i <= Math.max(step, toStep); i++) {
      moreVisibleSteps.push(i);
    }

    setStep(toStep);
    setVisibleIndexes((prev) => {
      const newIndexes = new Set(prev);
      moreVisibleSteps.forEach((step) => newIndexes.add(step));
      return newIndexes;
    });
    props.onChangStep?.(toStep, step);
  };

  const onTransitionEndSwipe = () => {
    setVisibleIndexes(new Set([step]));
  };

  const onClickMenuItem = (index: number) => {
    navigate(index);
    setShowMenu(false);
  };

  return (
    <Modal
      active={active}
      title={<span className="text-lg">Optimization / {stepConfigs[step]?.title}</span>}
      style={{
        height: "90vh",
        maxHeight: 880,
        width: "24rem",
      }}
      className="bg-surface-2"
      bodyCls="py-2 px-0"
      closeOnMaskClick={false}
      onClose={() => setActive(false)}
      onTransitionEnd={(open) => {
        if (!open) {
          props.afterClose();
        }
      }}
    >
      <div className="h-full flex flex-col hide-scrollbar">
        <div className="grow overflow-hidden relative">
          <div
            className="absolute left-0 top-0 h-full flex transition-transform duration-200"
            style={{
              width: `${stepCount * 100}%`,
              transform: `translateX(-${(100 / stepCount) * step}%)`,
            }}
            onTransitionEnd={onTransitionEndSwipe}
          >
            {stepConfigs.map((config, index) => {
              return (
                <div
                  key={index}
                  className="h-full px-4 shrink-0 hide-scrollbar"
                  style={{ width: `${100 / stepCount}%` }}
                >
                  {visibleIndexes.has(index) ? config.render(changeValidOf(index)) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 mb-1 px-4 flex justify-between">
          <div className="flex">
            <div ref={menuTriggerRef} className="relative">
              {props.canShowMenu && (
                <Button
                  className="mr-3"
                  icon={<FaCaretDown className="text-xl rotate-180" />}
                  disabled={stepStatuses[step] === "INVALID"}
                  onClick={() => setShowMenu(!showMenu)}
                />
              )}

              <Popover
                active={showMenu}
                className="bottom-full mb-2 bg-light-default text-black rounded-md flex flex-col overflow-hidden shadow-white-glow"
                origin="bottom left"
              >
                {stepConfigs.map((config, index) => {
                  const isCurrent = index === step;
                  const disabled = stepStatuses[index] === "INVALID" || isCurrent;

                  return (
                    <Fragment key={index}>
                      {index ? <div className="h-px bg-light-disabled" /> : null}
                      <button
                        disabled={disabled}
                        className={clsx(
                          "px-3 py-1 w-full text-left font-semibold whitespace-nowrap",
                          isCurrent ? "bg-light-disabled" : "hover:bg-surface-1 hover:text-light-default",
                          disabled && "opacity-80"
                        )}
                        onClick={() => onClickMenuItem(index)}
                      >
                        {config.title}
                      </button>
                    </Fragment>
                  );
                })}
              </Popover>
            </div>

            <div className="group relative">
              {noti.message && <Button icon={<FaExclamation />} onClick={() => setShowMenu(!showMenu)} />}

              <div
                className="mb-3 px-2 py-1 text-sm bg-black text-danger-3 whitespace-nowrap rounded cursor-default absolute bottom-full z-10 transition-transform duration-200 scale-0 group-hover:scale-100"
                style={{ transformOrigin: "bottom left" }}
              >
                {noti.message}
              </div>
            </div>
          </div>

          <ButtonGroup
            buttons={[
              {
                children: "Back",
                icon: <FaCaretRight className="text-lg rotate-180" />,
                disabled: !step,
                onClick: () => navigate(step - 1),
              },
              {
                children: step === stepCount - 1 ? "Proceed" : "Next",
                variant: step === stepCount - 1 ? "primary" : "default",
                icon: <FaCaretRight className="text-lg" />,
                iconPosition: "end",
                disabled: stepStatuses[step] !== "VALID",
                onClick: () => navigate(step + 1),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}
