import { RefCallback } from "react";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ButtonGroup, ButtonProps, cn } from "rond";

type SavingStepLayoutProps = {
  className?: string;
  message?: string;
  children: React.ReactNode;
  actions?: ButtonProps[];
  continueProps?: ButtonProps;
  /** Default "Continue" */
  continueText?: string;
  continueRef?: RefCallback<HTMLButtonElement>;
  onContinue?: () => void;
};

export function SavingStepLayout({
  className,
  message,
  children,
  actions = [],
  continueProps,
  continueText = "Continue",
  continueRef,
  onContinue,
}: SavingStepLayoutProps) {
  return (
    <div
      data-slot="saving-step-layout"
      className={cn("p-4 flex flex-col overflow-auto", className)}
    >
      {message && <p className="mb-3 text-light-3 text-sm">{message}</p>}
      <div className="grow overflow-auto">{children}</div>
      <ButtonGroup
        className="mt-4"
        buttons={[
          ...actions,
          {
            children: continueText,
            icon: <FaAngleDoubleRight />,
            ...continueProps,
            refProp: continueRef,
            onClick: onContinue,
          },
        ]}
      />
    </div>
  );
}
