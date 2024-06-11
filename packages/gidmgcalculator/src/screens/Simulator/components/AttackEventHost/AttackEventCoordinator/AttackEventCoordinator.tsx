import { useRef } from "react";
import { Coordinator, CoordinatorContext } from "./coordinator-context";

export function AttackEventCoordinator(props: { children: React.ReactNode }) {
  const coordinator = useRef<Coordinator>(new Coordinator());
  return <CoordinatorContext.Provider value={coordinator.current}>{props.children}</CoordinatorContext.Provider>;
}
