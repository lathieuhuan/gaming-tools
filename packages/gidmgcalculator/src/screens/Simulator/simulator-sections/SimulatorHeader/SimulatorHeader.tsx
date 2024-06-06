import { Button } from "rond";
import { useSimModalCtrl } from "../../SimulatorProviders";

export function SimulatorHeader() {
  const modalCtrl = useSimModalCtrl();

  const onClickAddSimulation = () => {
    modalCtrl.requestAddSimulation();
  };

  return <Button onClick={onClickAddSimulation}>Add setup</Button>;
}
