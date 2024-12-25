import { useImperativeHandle, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup, Modal } from "rond";

type StepStatus = "VALID" | "INVALID";

type ChangeValid = (valid: boolean) => void;

export type StepConfig = {
  title: string;
  initialValid?: boolean;
  render: (changeValid: ChangeValid) => React.ReactNode;
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
  const [active, setActive] = useState(true);
  const [step, setStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    props.stepConfigs.map((config) => (config.initialValid ? "VALID" : "INVALID"))
  );

  const stepConfig: StepConfig | undefined = props.stepConfigs[step];

  useImperativeHandle(props.control, () => ({
    toggle: setActive,
  }));

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep >= props.stepConfigs.length) {
      return props.onComplete();
    }

    props.onChangStep?.(newStep, step);
    setStep(newStep);
  };

  const changeValid: ChangeValid = (valid) => {
    setStepStatuses((prevStatuses) => {
      const newStatus = valid ? "VALID" : "INVALID";

      if (newStatus !== stepStatuses[step]) {
        const newStatuses = [...prevStatuses];
        newStatuses[step] = newStatus;
        return newStatuses;
      }
      return prevStatuses;
    });
  };

  const onClose = () => {
    setActive(false);
  };

  return (
    <Modal
      active={active}
      title={<span className="text-lg">Optimization / {stepConfig?.title}</span>}
      style={{
        height: "95vh",
        width: "24rem",
      }}
      className="bg-surface-2"
      bodyCls="py-2"
      closeOnMaskClick={false}
      onClose={onClose}
      onTransitionEnd={(open) => {
        if (!open) props.afterClose();
      }}
    >
      <div className="h-full flex flex-col hide-scrollbar">
        <div className="grow hide-scrollbar">{stepConfig?.render(changeValid)}</div>

        <ButtonGroup
          className="mt-3 mb-1"
          buttons={[
            {
              children: "Back",
              icon: <FaCaretRight className="text-lg rotate-180" />,
              disabled: !step,
              onClick: () => navigateStep(-1),
            },
            {
              children: "Next",
              icon: <FaCaretRight className="text-lg" />,
              iconPosition: "end",
              disabled: stepStatuses[step] !== "VALID",
              onClick: () => navigateStep(1),
            },
          ]}
        />
      </div>
    </Modal>
  );
}
