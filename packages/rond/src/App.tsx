import { Button, CollapseSpace } from "@lib/components";
import { useState } from "react";
import { MountAnnouncer } from "./components";

function App() {
  const [active, setActive] = useState(true);
  const [visible, setVisible] = useState(true);
  return (
    <div>
      <p>App for developing Rond</p>
      <Button onClick={() => setActive(!active)}>Click</Button>
      <Button onClick={() => setVisible(!visible)}>Click {visible ? "visible" : ""}</Button>
      <div style={{ display: visible ? "block" : "none" }}>
        <CollapseSpace active={active}>
          <MountAnnouncer style={{ height: 300, background: "red" }} />
        </CollapseSpace>
      </div>
    </div>
  );
}

export default App;
