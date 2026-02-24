import type { ReactNode } from "react";

export type SavingCaseProps = {
  message?: ReactNode;
  hint?: ReactNode;
  withDivider?: boolean;
  children: ReactNode;
};

export function SavingCase(props: SavingCaseProps) {
  return (
    <div>
      {props.withDivider && <div className="mx-auto my-4 h-px w-1/2 bg-dark-line" />}

      <div className="mb-2">
        {props.message && <div className="text-light-3 text-sm">{props.message}</div>}
        {props.hint && <div className="mt-1 text-light-hint text-sm">{props.hint}</div>}
      </div>
      {props.children}
    </div>
  );
}
