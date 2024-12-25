import { useImperativeHandle, useRef, useState } from "react";
import { FaCaretRight, FaCaretDown } from "react-icons/fa";
import { Button, ButtonGroup, Modal, Popover, useClickOutside } from "rond";

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

  useImperativeHandle(props.control, () => ({
    toggle: setActive,
  }));

  const navigate = (dir: "BACK" | "NEXT") => {
    const newStep = step + (dir === "BACK" ? -1 : 1);

    if (newStep >= stepConfigs.length) {
      return props.onComplete();
    }

    const carousel = carouselRef.current;
    if (carousel) carousel.scrollLeft = newStep * carousel.clientWidth;

    setVisibleIndexes((prev) => new Set(prev).add(newStep));
    setStep(newStep);
    props.onChangStep?.(newStep, step);
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
        if (!open) props.afterClose();
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

        <div className="mt-3 mb-1 flex justify-between">
          {/* <Button
            icon={<FaCaretRight className="text-lg rotate-180" />}
            disabled={!step}
            onClick={() => navigate("BACK")}
          >
            Back
          </Button> */}

          <div ref={triggerRef} className="relative">
            <Button icon={<FaCaretDown className="text-lg rotate-180" />} onClick={() => setShowMenu(!showMenu)} />

            <Popover
              className="bottom-full left-1/2 pb-3"
              origin="bottom left"
              style={{
                translate: "-50%",
              }}
              active={showMenu}
            >
              <div className="bg-light-default text-black rounded-md overflow-hidden">
                {stepConfigs.map((config, i) => {
                  return (
                    <button
                      key={i}
                      className="px-2 py-1 w-full text-left font-semibold hover:bg-surface-1 hover:text-light-default whitespace-nowrap"
                    >
                      {config.title}
                    </button>
                  );
                })}
              </div>
            </Popover>
          </div>

          {/* <Button
            variant={step === stepConfigs.length - 1 ? "primary" : "default"}
            icon={<FaCaretRight className="text-lg" />}
            iconPosition="end"
            disabled={stepStatuses[step] !== "VALID"}
            onClick={() => navigate("NEXT")}
          >
            {step === stepConfigs.length - 1 ? "Proceed" : "Next"}
          </Button> */}

          <ButtonGroup
            buttons={[
              {
                children: "Back",
                icon: <FaCaretRight className="text-lg rotate-180" />,
                disabled: !step,
                onClick: () => navigate("BACK"),
              },
              {
                children: step === stepConfigs.length - 1 ? "Proceed" : "Next",
                variant: step === stepConfigs.length - 1 ? "primary" : "default",
                icon: <FaCaretRight className="text-lg" />,
                iconPosition: "end",
                disabled: stepStatuses[step] !== "VALID",
                onClick: () => navigate("NEXT"),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}
