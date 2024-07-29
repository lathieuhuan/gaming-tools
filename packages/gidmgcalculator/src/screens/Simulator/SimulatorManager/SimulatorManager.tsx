import { Button, clsx } from "rond";

export interface SimulatorManagerProps {
  className?: String;
  onClickAddSimulation: () => void;
}
export function SimulatorManager({ className, onClickAddSimulation }: SimulatorManagerProps) {
  return (
    <div className={clsx("p-4 bg-surface-1 shadow-white-glow", className)}>
      <Button size="small" onClick={onClickAddSimulation}>
        Add Simulation
      </Button>
    </div>
  );
}
