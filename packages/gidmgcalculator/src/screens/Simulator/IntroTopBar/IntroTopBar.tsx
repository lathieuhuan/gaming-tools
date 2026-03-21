import { useSimulatorStore } from "../store";
import { Button, FancyBackSvg } from "rond";

export function IntroTopBar() {
  const manager = useSimulatorStore((state) =>
    state.managers.find((manager) => manager.id === state.activeId)
  );

  if (!manager) {
    return null;
  }

  const handleBack = () => {
    useSimulatorStore.setState({ step: "PREP" });
  };

  return (
    <div className="h-16 px-4 flex items-center bg-dark-2 shrink-0">
      <div className="flex items-center gap-2">
        <Button boneOnly icon={<FancyBackSvg className="text-light-hint" />} onClick={handleBack} />
        <span>{manager.name}</span>
      </div>
    </div>
  );
}
