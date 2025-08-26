import { Button, Modal } from "@lib/components";
import { ScreenSizeWatcher, useScreenWatcher } from "@lib/providers";
import { useState } from "react";

function App() {
  const [active, setActive] = useState(false);

  return (
    <ScreenSizeWatcher>
      <div className="p-4 min-h-screen">
        {/* <Button onClick={() => setActive(true)}>Click</Button>
        <Modal
          preset="small"
          active={active}
          onClose={() => {
            console.log("onClose");
            setActive(false);
          }}
        >
          <div>Hello</div>
        </Modal> */}
        <Child />
      </div>
    </ScreenSizeWatcher>
  );
}

export default App;

function Child() {
  const screenWatcher = useScreenWatcher();
  console.log(screenWatcher.isFromSize("sm") ? "from sm" : "less than sm");

  return (
    <div>
      <Button onClick={() => console.log(screenWatcher.screenSize)}>Click</Button>
      <p>{screenWatcher.isFromSize("sm") ? "from sm" : "less than sm"}</p>
    </div>
  );
}
