import { GenshinModifierView } from "@/components";
import { updateElementalEvent } from "@Store/calculator/actions";

type StellarVortexCtrlProps = {
  vortexLv: number;
};

export function StellarVortexCtrl({ vortexLv }: StellarVortexCtrlProps) {
  //
  const handleToggle = () => {
    updateElementalEvent({
      vortexLv: vortexLv + 1,
    });
  };

  const handleChange = (value: number) => {
    updateElementalEvent({
      vortexLv: value,
    });
  };

  return (
    <GenshinModifierView
      mutable
      heading="Stellar Vortex"
      headingVariant="view"
      description={
        <>
          Stellar Swirl reaction creates a Stellar Vortex, which detonates after a certain time and
          can be upgraded by more Stellar Swirl reactions.
        </>
      }
      inputConfigs={[
        {
          type: "TEXT",
          label: "Level",
          max: 3,
        },
      ]}
      inputs={[vortexLv]}
      onToggle={handleToggle}
      onChangeText={handleChange}
    />
  );
}
