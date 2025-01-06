import { Button, Modal } from "@lib/components";
import { useState } from "react";

function App() {
  const [active, setActive] = useState(false);

  return (
    <div className="p-4 min-h-screen">
      <Button onClick={() => setActive(true)}>Click</Button>
      <Modal
        preset="small"
        active={active}
        onClose={() => {
          console.log("onClose");
          setActive(false);
        }}
      >
        <div>Hello</div>
      </Modal>
    </div>
  );
}

export default App;
