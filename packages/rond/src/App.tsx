import { Button } from "@lib/components";
import { useState } from "react";

function App() {
  const [active, setActive] = useState(false);

  const onClick = () => {
    setActive(!active);
  };

  return (
    <div className="p-4">
      <Button onClick={onClick}>Click</Button>
    </div>
  );
}

export default App;
