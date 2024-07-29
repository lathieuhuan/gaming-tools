import { useState } from "react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Button, Drawer } from "rond";

import { SimulatorManager, SimulatorManagerProps } from "../SimulatorManager";

interface SimulatorHeaderProps extends Pick<SimulatorManagerProps, "onClickAddSimulation"> {
  //
}
export function SimulatorHeader({ onClickAddSimulation }: SimulatorHeaderProps) {
  const [active, setActive] = useState(false);

  const onCloseDrawer = () => {
    setActive(false);
  };

  return (
    <>
      <div className="p-4 bg-surface-2">
        <Button
          shape="square"
          size="small"
          icon={<FaCaretRight className="text-xl" />}
          onClick={() => setActive(true)}
        />
      </div>

      <Drawer
        active={active}
        position="left"
        style={{
          boxShadow: "0 0 1px #b8b8b8",
        }}
        onClose={onCloseDrawer}
      >
        <Button
          className="absolute top-4 right-4 "
          shape="square"
          size="small"
          icon={<FaCaretDown className="text-xl rotate-90" />}
          onClick={onCloseDrawer}
        />

        <SimulatorManager
          className="h-full"
          onClickAddSimulation={() => {
            onClickAddSimulation();
            onCloseDrawer();
          }}
        />
      </Drawer>
    </>
  );
}
