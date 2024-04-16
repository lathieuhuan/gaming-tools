import { useState } from "react";
import { Select, SelectProps, VersatileSelect } from "@lib/components";

function App() {
  const [value, setValue] = useState<string | number>(2);

  const props: SelectProps = {
    // transparent: true,
    arrowAt: 'start',
    align: 'right',
    size: 'medium',
    value,
    options: [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
      { label: "Option 3", value: 3 },
    ],
    onChange: setValue,
  };

  return (
    <div className="ron-list" style={{ gap: "1rem", padding: "1rem" }}>
      <p>App for developing Rond {value}</p>

      <VersatileSelect title="Select" {...props} />

      <Select {...props} />

      {/* <div style={{ marginTop: 1000, padding: "0 3rem" }}>
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
      </div> */}
    </div>
  );
}

export default App;
