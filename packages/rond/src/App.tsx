// import { useState } from "react";

import { Button, Select } from "@lib/components";
import { message } from "@lib/utils";

function App() {
  const onClick = () => {
    message.info("Hello");
  };

  return (
    <div>
      <p>App for developing Rond</p>

      <Button onClick={onClick}>Click</Button>

      <div style={{ padding: "3rem" }}>
        <Select
          value="A"
          options={[
            { label: "Option A", value: "A" },
            { label: "Option B", value: "B" },
            { label: "Option C", value: "C" },
          ]}
        />
      </div>
    </div>
  );
}

export default App;
