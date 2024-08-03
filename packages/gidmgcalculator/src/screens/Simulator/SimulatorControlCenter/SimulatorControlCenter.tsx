import { Button } from "rond";

export interface SimulatorManagerProps {
  className?: string;
  onClickCreateSimulation: (source: "NONE" | "CALCULATOR" | "USER_SETUPS") => void;
}
export function SimulatorControlCenter(props: SimulatorManagerProps) {
  return (
    <div className={props.className}>
      <p className="text-heading-color font-medium">Create Simulation</p>

      <div className="mt-2 pl-4 flex">
        <Button size="small" onClick={() => props.onClickCreateSimulation("NONE")}>
          Empty
        </Button>
      </div>
    </div>
  );
}
