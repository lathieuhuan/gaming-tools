import { TbLayoutSidebar } from "react-icons/tb";
import { Button, ButtonProps } from "rond";

import { useSimulatorStore } from "../store";

export function SidebarButton(props: Omit<ButtonProps, "onClick">) {
  return (
    <Button
      boneOnly
      icon={<TbLayoutSidebar className="text-2xl" />}
      onClick={() => useSimulatorStore.setState({ sidebarOpen: true })}
      {...props}
    />
  );
}
