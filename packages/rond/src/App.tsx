import { useState } from "react";
import { Button, Drawer } from "@lib/components";

function App() {
  const [active, setActive] = useState(false);

  return (
    <div className="ron-list" style={{ gap: "1rem", padding: "1rem" }}>
      <p>App for developing Rond</p>
      <Button onClick={() => setActive(true)}>Click</Button>

      <Drawer active={active} destroyOnClose={false} afterClose={() => setActive(false)}>
        <div>Content</div>
      </Drawer>
    </div>
  );
}

export default App;
