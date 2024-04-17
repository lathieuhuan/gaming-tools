import { Button, SearchSvg, VersatileSelect, Select } from "@lib/components";
// import { ChevronDownSvg } from "@lib/components";
// import { default as RcSelect } from "rc-select";
// import "rc-select/assets/index.css";
import { useState } from "react";

function App() {
  const [transparent, setTransparent] = useState(true);
  return (
    <div className="ron-list" style={{ gap: "1rem", padding: "1rem" }}>
      <p>App for developing Rond</p>
      <Button onClick={() => setTransparent(!transparent)}>Click</Button>

      <VersatileSelect
        title="Title"
        defaultValue={3}
        size="small"
        // size="medium"
        options={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
          { label: "Option 3", value: 3 },
        ]}
        onChange={console.log}
        // action={{
        //   icon: <SearchSvg />,
        //   variant: "primary",
        //   onClick: console.log,
        // }}
      />

      <Select
        defaultValue={3}
        size="small"
        // style={{ height: 48 }}
        options={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
          { label: "Option 3", value: 3 },
        ]}
        onChange={console.log}
        action={{
          icon: <SearchSvg />,
          variant: "primary",
          onClick: console.log,
        }}
      />

      <Select
        defaultValue={3}
        size="small"
        style={{ height: 48 }}
        options={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
          { label: "Option 3", value: 3 },
        ]}
        onChange={console.log}
        action={{
          icon: <SearchSvg />,
          variant: "primary",
          onClick: console.log,
        }}
      />

      <VersatileSelect
        title="Title"
        defaultValue={3}
        size="medium"
        options={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
          { label: "Option 3", value: 3 },
        ]}
        onChange={console.log}
        action={{
          icon: <SearchSvg />,
          onClick: console.log,
        }}
      />
    </div>
  );
}

export default App;
