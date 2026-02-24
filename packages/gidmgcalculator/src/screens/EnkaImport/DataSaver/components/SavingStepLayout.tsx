import type { ReactNode } from "react";
import { ButtonGroup, ButtonProps, cn } from "rond";

type SavingStepLayoutProps = {
  className?: string;
  message?: ReactNode;
  children: ReactNode;
  actions?: ButtonProps[];
};

export function SavingStepLayout({
  className,
  message,
  children,
  actions = [],
}: SavingStepLayoutProps) {
  return (
    <div
      data-slot="saving-step-layout"
      className={cn("p-4 flex flex-col overflow-auto", className)}
    >
      {message && <div className="mb-3 text-light-3 text-sm">{message}</div>}
      <div className="grow custom-scrollbar">{children}</div>
      <ButtonGroup className="mt-4" buttons={actions} />
    </div>
  );
}
