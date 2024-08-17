import { createContext, useContext, useEffect, useState } from "react";

type OnChangeActive = (active: boolean) => void;

export class Coordinator {
  private activeId = "";
  private subscribers: Map<string, OnChangeActive> = new Map();

  subscribe = (id: string, onChangeActive: OnChangeActive) => {
    this.subscribers.set(id, onChangeActive);
    return () => {
      this.subscribers.delete(id);
    };
  };

  toggle = (id: string) => {
    if (id === this.activeId) {
      this.subscribers.get(id)?.(false);
      this.activeId = "";
    } else {
      this.subscribers.get(id)?.(true);
      this.subscribers.get(this.activeId)?.(false);
      this.activeId = id;
    }
  };
}

export const CoordinatorContext = createContext<Coordinator | null>(null);

const useCoordinator = () => {
  const coordinator = useContext(CoordinatorContext);

  if (!coordinator) {
    throw new Error("useDisplayerToggleHanlder must be used inside CoordinatorContext");
  }
  return coordinator;
};

export const useDisplayerState = (id: string) => {
  const [isActive, setIsActive] = useState(false);
  const coordinator = useCoordinator();

  useEffect(() => {
    const unsubscribe = coordinator.subscribe(id, setIsActive);
    return unsubscribe;
  }, []);

  return {
    isActive,
    toggle: () => coordinator.toggle(id),
  };
};
