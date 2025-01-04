import { Button, TabControl, Tabs } from "@lib/components";
import { useRef, useState } from "react";

function App() {
  const [level, setLevel] = useState(1);
  const [disabled, setDisabled] = useState(false);
  const ref = useRef<TabControl>(null);

  return (
    <div className="p-4">
      <Button onClick={() => setLevel(level === 1 ? 2 : 1)}>Click L</Button>
      <Button onClick={() => setDisabled(!disabled)}>Click D</Button>
      <Button
        onClick={() => {
          ref.current?.setActiveIndex((prev) => {
            console.log(prev);
            
            return prev ? 0 : 1;
          });
        }}
      >
        Change
      </Button>
      <Tabs control={ref} level={level} configs={[{ text: "Tab 1", disabled }, { text: "Tab 2" }]} />
    </div>
  );
}

export default App;
