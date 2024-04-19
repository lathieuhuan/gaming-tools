import { BottomList, Button } from "@lib/components";
import { useState } from "react";
// import { SelectDemo } from "./demos";

function App() {
  const [active, setActive] = useState(false);
  return (
    <div className="p-4">
      <Button onClick={() => setActive(true)}>Click</Button>

      <BottomList
        active={active}
        items={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
          { label: "Option 3", value: 3 },
        ]}
        onSelect={(value) => {
          console.log(value);
          setActive(false);
        }}
        onClose={() => setActive(false)}
      />
    </div>
  );
}

export default App;
