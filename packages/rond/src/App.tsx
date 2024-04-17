import { SearchSvg, Select, VersatileSelect } from "@lib/components";

function App() {
  return (
    <div className="ron-list" style={{ gap: "1rem", padding: "1rem" }}>
      <p>App for developing Rond</p>

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
        action={{
          icon: <SearchSvg />,
          variant: "primary",
          onClick: console.log,
        }}
      />

      <Select
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

      <VersatileSelect
        title="Title"
        style={{ marginTop: 32 }}
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
