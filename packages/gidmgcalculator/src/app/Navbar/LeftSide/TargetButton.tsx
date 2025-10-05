import { FaSkull } from "react-icons/fa";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectTargetConfig, updateUI } from "@Store/ui-slice";

export function TargetButton() {
  const dispatch = useDispatch();
  const targetConfig = useSelector(selectTargetConfig);

  if (targetConfig.overviewed) {
    return null;
  }

  const onClick = () => {
    dispatch(updateUI({ targetConfig: { active: true, overviewed: false } }));
  };

  return (
    <button className="w-8 h-8 flex-center bg-dark-3 glow-on-hover" onClick={onClick}>
      <FaSkull />
    </button>
  );
}
