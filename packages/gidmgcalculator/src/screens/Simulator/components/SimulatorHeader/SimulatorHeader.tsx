import { Button } from "rond";
import { useSimModalCtrl } from "@Simulator/providers";

export function SimulatorHeader() {
  const modalCtrl = useSimModalCtrl();

  const onClickAddSimulation = () => {
    modalCtrl.requestAddSimulation();
  };

  return <Button onClick={onClickAddSimulation}>Add setup</Button>;
}
