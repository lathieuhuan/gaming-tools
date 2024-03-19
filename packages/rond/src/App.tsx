import { Checkbox } from "@lib/components";
import { useState } from "react";

function App() {
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <div>
      <p>App for developing Rond</p>
      <Checkbox size="medium" checked={checked} disabled={disabled}>
        Check me
      </Checkbox>

      <Checkbox size="medium" onChange={setChecked}>
        Check it
      </Checkbox>
      <Checkbox size="medium" onChange={setDisabled}>
        Disable it
      </Checkbox>
    </div>
  );
}

export default App;
