import { useImperativeHandle, useRef, useState } from "react";
import { FaCaretRight, FaCaretDown } from "react-icons/fa";
import { Button, ButtonGroup, clsx, Modal, Popover, useClickOutside } from "rond";

type StepStatus = "VALID" | "INVALID";

export type StepConfig = {
  title: string;
  initialValid?: boolean;
  render: (changeValid: (valid: boolean) => void) => React.ReactNode;
};

export type OptimizationGuideControl = {
  toggle: (active: boolean) => void;
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
  const timeout = useRef<NodeJS.Timeout>();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [step, setStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    stepConfigs.map((config) => (config.initialValid ? "VALID" : "INVALID"))
  );
  const [visibleIndexes, setVisibleIndexes] = useState(new Set<number>([0]));

  const triggerRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

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

  const scrollTo = (step: number) => {
    const carousel = carouselRef.current;
    if (carousel) carousel.scrollLeft = step * carousel.clientWidth;
  };

  useImperativeHandle(props.control, () => ({
    toggle: setActive,
  }));

  const navigate = (toStep: number) => {
    if (toStep >= stepConfigs.length) {
      return props.onComplete();
    }

    const moreVisibleSteps: number[] = [];

    for (let i = Math.min(step, toStep); i <= Math.max(step, toStep); i++) {
      moreVisibleSteps.push(i);
    }

    scrollTo(toStep);
    setStep(toStep);
    setVisibleIndexes((prev) => {
      const newIndexes = new Set(prev);
      moreVisibleSteps.forEach((step) => newIndexes.add(step));
      return newIndexes;
    });
    props.onChangStep?.(toStep, step);
  };

  const onScrollCarousel = (e: React.UIEvent<HTMLDivElement>) => {
    clearTimeout(timeout.current);

    const carousel = e.currentTarget;

    timeout.current = setTimeout(() => {
      const { scrollLeft, clientWidth } = carousel;
      const visibleIndex = Math.floor(scrollLeft / clientWidth);

      setVisibleIndexes(new Set([visibleIndex]));
    }, 100);
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
        if (open) {
          scrollTo(step);
        } else {
          props.afterClose();
        }
      }}
    >
      <div className="h-full flex flex-col hide-scrollbar">
        <div ref={carouselRef} className="grow overflow-hidden scroll-smooth flex" onScroll={onScrollCarousel}>
          {stepConfigs.map((config, index) => {
            return (
              <div key={index} className="w-full h-full px-4 shrink-0 hide-scrollbar">
                {visibleIndexes.has(index) ? config.render(changeValidOf(index)) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-3 mb-1 px-4 flex justify-between">
          <div ref={triggerRef} className="relative">
            {props.canShowMenu && (
              <Button
                icon={<FaCaretDown className="text-xl rotate-180" />}
                disabled={stepStatuses[step] === "INVALID"}
                onClick={() => setShowMenu(!showMenu)}
              />
            )}

            <Popover className="bottom-full pb-2" origin="bottom left" active={showMenu}>
              <div className="bg-light-default text-black rounded-md overflow-hidden shadow-white-glow">
                {stepConfigs.map((config, index) => {
                  const isCurrent = index === step;
                  const disabled = stepStatuses[index] === "INVALID" || isCurrent;

                  return (
                    <button
                      key={index}
                      disabled={disabled}
                      className={clsx(
                        "px-3 w-full text-left font-semibold whitespace-nowrap",
                        isCurrent ? "bg-light-disabled" : "hover:bg-surface-1 hover:text-light-default"
                      )}
                      onClick={() => onClickMenuItem(index)}
                    >
                      <span
                        className={clsx(
                          "py-1 block",
                          index && "border-t border-surface-border",
                          disabled && "opacity-80"
                        )}
                      >
                        {config.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Popover>
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
                children: step === stepConfigs.length - 1 ? "Proceed" : "Next",
                variant: step === stepConfigs.length - 1 ? "primary" : "default",
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
