import { GenshinModifierView } from "@/components/GenshinModifierView";
import { updateElementalEvent } from "@Store/calculator/actions";

type PolestarFieldCtrlProps = {
  polestarProc: boolean;
  polestarCount: number;
};

export function PolestarFieldCtrl({ polestarProc, polestarCount }: PolestarFieldCtrlProps) {
  //
  const handleToggle = () => {
    updateElementalEvent({
      polestarProc: !polestarProc,
    });
  };

  const handleChange = (value: number) => {
    updateElementalEvent({
      polestarCount: value,
    });
  };

  return (
    <GenshinModifierView
      heading="Polestar Field"
      description={
        <>
          Every 3s the field releases stored Cryo/Electro energy to buff characters inside, granting
          them <span className="text-bonus">Cryo, Electro DMG Bonus</span> and increasing their{" "}
          <span className="text-bonus">Stellar-Conduct coefficient</span> for 3s.
        </>
      }
      mutable
      checked={polestarProc}
      inputConfigs={[
        {
          type: "TEXT",
          label: "Stacks",
          max: 10,
        },
      ]}
      inputs={[polestarCount]}
      onToggle={handleToggle}
      onChangeText={handleChange}
    />
  );
}
