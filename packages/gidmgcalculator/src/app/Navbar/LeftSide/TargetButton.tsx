import { FaSkull } from "react-icons/fa";

import { updateUI, useUIStore } from "@Store/ui";

export function TargetButton() {
  const targetConfig = useUIStore((state) => state.targetConfig);

  if (targetConfig.overviewed) {
    return null;
  }

  const onClick = () => {
    updateUI({ targetConfig: { active: true, overviewed: false } });
  };

  return (
    <button className="w-8 h-8 flex-center bg-dark-3 glow-on-hover" onClick={onClick}>
      <FaSkull />
    </button>
  );
}
