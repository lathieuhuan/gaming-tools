import { Fragment, useImperativeHandle, useState } from "react";
import { FaCaretRight, FaCaretDown, FaExclamation, FaCheck } from "react-icons/fa";
import { IoFootsteps } from "react-icons/io5";
import { Button, ButtonGroup, clsx, Modal, Popover, useClickOutside } from "rond";

type StepStatus = "VALID" | "INVALID";

export type StepConfig<T extends string> = {
  key: T;
  title: string;
  initialValid?: boolean;
  render: (changeValid: (valid: boolean) => void) => React.ReactNode;
};

export type OptimizationGuideControl<T extends string> = {
  notify: (message: null | string | { message: string; toStep: T }) => void;
};

interface OptimizationGuideProps<T extends string> {
  active: boolean;
  stepConfigs: StepConfig<T>[];
  canShowMenu?: boolean;
  control?: React.RefObject<OptimizationGuideControl<T>>;
  onChangStep?: (newKey: T, oldKey: T) => void;
  onClose: () => void;
}
export function OptimizationGuide<T extends string>(props: OptimizationGuideProps<T>) {
  const { stepConfigs } = props;
  const stepCount = stepConfigs.length;

  const [showMenu, setShowMenu] = useState(false);
  const [step, setStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    stepConfigs.map((config) => (config.initialValid ? "VALID" : "INVALID"))
  );
  const [visibleStepIndexes, setVisibleStepIndexes] = useState(new Set<number>([0]));
  const [noti, setNoti] = useState({
    message: "",
    toStep: undefined as number | undefined,
  });

  const menuTriggerRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  const { toStep: notiToStep } = noti;

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
    notify: (arg) => {
      const { message = "", toStep = undefined } = arg ? (typeof arg === "string" ? { message: arg } : arg) : {};
      const _toStep = toStep ? stepConfigs.findIndex((config) => config.key === toStep) : undefined;

      setNoti((prevNoti) => (message !== prevNoti.message ? { message, toStep: _toStep } : prevNoti));
    },
  }));

  const navigate = (toStep: number) => {
    const moreVisibleSteps: number[] = [];

    for (let i = Math.min(step, toStep); i <= Math.max(step, toStep); i++) {
      moreVisibleSteps.push(i);
    }

    setStep(toStep);
    setVisibleStepIndexes((prev) => {
      const newIndexes = new Set(prev);
      moreVisibleSteps.forEach((step) => newIndexes.add(step));
      return newIndexes;
    });
    props.onChangStep?.(stepConfigs[toStep].key, stepConfigs[step].key);

    if (toStep === noti.toStep && noti.message) {
      closeNoti();
    }
  };

  const onTransitionEndSwipe = () => {
    setVisibleStepIndexes(new Set([step]));
  };

  const onClickMenuItem = (index: number) => {
    navigate(index);
    setShowMenu(false);
  };

  const closeNoti = () => {
    setNoti({ message: "", toStep: undefined });
  };

  return (
    <Modal
      active={props.active}
      title={<span className="text-lg">Optimizer / {stepConfigs[step]?.title}</span>}
      style={{
        height: "95vh",
        maxHeight: 880,
        width: "26rem",
      }}
      className="bg-surface-2"
      bodyCls="py-2 px-0"
      closeOnMaskClick={false}
      onClose={() => props.onClose()}
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
                  {visibleStepIndexes.has(index) ? config.render(changeValidOf(index)) : null}
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
                    <Fragment key={config.key}>
                      {index ? <div className="h-px bg-black/30" /> : null}
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
              {noti.message && (
                <div
                  className={clsx(
                    "w-8 h-8 rounded-circle flex-center text-danger-3",
                    !showMenu && "group-hover:bg-light-default group-hover:text-black"
                  )}
                >
                  <FaExclamation />
                </div>
              )}

              <div
                className={clsx(
                  "pb-3 absolute bottom-full z-10 transition-transform duration-200 scale-0",
                  !showMenu && "group-hover:scale-100"
                )}
                style={{ transformOrigin: "bottom left" }}
              >
                <div className="p-2 bg-black rounded">
                  <div className=" text-danger-3 whitespace-nowrap cursor-default">{noti.message}</div>

                  <div className="mt-2 flex justify-center gap-3">
                    {notiToStep !== undefined ? (
                      <Button icon={<IoFootsteps />} onClick={() => navigate(notiToStep)} />
                    ) : null}

                    <Button icon={<FaCheck />} onClick={closeNoti} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ButtonGroup
            buttons={[
              {
                children: "Back",
                className: "gap-0 pl-2",
                icon: <FaCaretRight className="text-xl rotate-180" />,
                disabled: !step,
                onClick: () => navigate(step - 1),
              },
              {
                children: "Next",
                variant: "default",
                className: "gap-0 pr-2",
                icon: <FaCaretRight className="text-xl" />,
                iconPosition: "end",
                disabled: step >= stepConfigs.length - 1 || stepStatuses[step] !== "VALID",
                onClick: () => navigate(step + 1),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}
