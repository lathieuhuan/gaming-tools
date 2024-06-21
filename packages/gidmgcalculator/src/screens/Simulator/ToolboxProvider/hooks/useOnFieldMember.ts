import { useEffect, useState } from "react";
import { ActiveSimulation } from "../toolbox-contexts";

export function useOnFieldMember(simulation: ActiveSimulation) {
  const [onFieldMember, setOnFieldMember] = useState(0);

  useEffect(() => {
    const { initialOnFieldMember, unsubscribe } = simulation.subscribeOnFieldMember(setOnFieldMember);

    setOnFieldMember(initialOnFieldMember);
    return unsubscribe;
  }, [simulation]);

  return onFieldMember;
}
