import { useState } from "react";
import { Button, InputNumber, Select } from "@lib/components";
import { popup } from "@lib/utils";

function App() {
  const [top, setTop] = useState(16);
  const [value, setValue] = useState<string | number>("A");

  const onClick = () => {
    setValue("B");
    popup.show("Select", [1, 2, 3], console.log);
  };

  return (
    <div style={{ height: 2000 }}>
      <p>App for developing Rond</p>

      <Button onClick={onClick}>Click {value}</Button>
      <InputNumber onChange={setTop} />

      <div style={{ marginTop: top, padding: "0 3rem" }}>
        <Select
          value={value}
          options={[
            { label: "Option A aksjdn aksd", value: "A" },
            { label: "Option B", value: "B" },
          ]}
          onChange={setValue}
        />
      </div>

      <div style={{ marginTop: 1000, padding: "0 3rem" }}>
        <Select
          value="A"
          open
          options={[
            { label: "Option A", value: "A" },
            { label: "Option B", value: "B" },
            { label: "Option C", value: "C" },
            { label: "Option D", value: "D" },
            { label: "Option E", value: "E" },
            { label: "Option F", value: "F" },
            { label: "Option G", value: "G" },
            { label: "Option H", value: "H" },
            { label: "Option I", value: "I" },
            { label: "Option K", value: "K" },
          ]}
        />
      </div>
    </div>
  );
}

export default App;
