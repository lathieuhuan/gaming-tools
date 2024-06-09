import { Button } from "rond";
import { useSimModalCtrl } from "@Simulator/providers";

export function SimulatorHeader() {
  const modalCtrl = useSimModalCtrl();

  const onClickAddSimulation = () => {
    modalCtrl.requestAddSimulation();
  };

  return (
    <div className="p-4 bg-surface-2">
      <Button shape="square" size="small" onClick={onClickAddSimulation}>
        Add setup
      </Button>
    </div>
  );
}
