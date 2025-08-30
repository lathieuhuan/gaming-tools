import { useRef } from "react";
import { Modal } from "rond";

import { useOptimizeSystem } from "@OptimizeDept/context";
import { InternalOffice, type InternalOfficeProps } from "./InternalOffice";

type ResultDisplayProps = Pick<InternalOfficeProps, "moreActions" | "onClose"> & {
  active: boolean;
  closeDeptAfterCloseOffice: boolean;
  onCancel?: () => void;
  onCloseDept: (keepResult: boolean) => void;
};

export function OptimizerOffice({
  active,
  closeDeptAfterCloseOffice,
  onCancel,
  onCloseDept,
  ...internalProps
}: ResultDisplayProps) {
  const shouldKeepResult = useRef(false);
  const system = useOptimizeSystem();

  const cancelProcess = () => {
    system.cancelProcess();
    onCancel?.();
  };

  const afterCloseOffice = () => {
    if (closeDeptAfterCloseOffice) {
      onCloseDept(shouldKeepResult.current);
    }
    shouldKeepResult.current = false;
  };

  return (
    <Modal
      active={active}
      title={<span className="text-lg">Optimizer / Processing & Result</span>}
      className={["bg-surface-2", Modal.LARGE_HEIGHT_CLS, Modal.MAX_SIZE_CLS]}
      style={{
        width: "45rem",
      }}
      closeOnMaskClick={false}
      withCloseButton={false}
      closeOnEscape={false}
      onTransitionEnd={(open) => {
        if (!open) afterCloseOffice();
      }}
      onClose={() => {}}
    >
      <InternalOffice
        {...internalProps}
        state={system.state}
        onExpectedSetupsChange={system.expectSetups}
        onKeepResultChange={(keepResult) => (shouldKeepResult.current = keepResult)}
        onCancelProcess={cancelProcess}
      />
    </Modal>
  );
}
