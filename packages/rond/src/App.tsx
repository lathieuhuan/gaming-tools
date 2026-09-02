import { Button, CheckboxGroup } from "@lib/components";
import { CheckboxGroupControl } from "@lib/components/Checkbox/logic";
import { useRef, useState } from "react";

function App() {
  const [values, setValues] = useState<string[]>(["1"]);
  const control = useRef<CheckboxGroupControl<string>>(null);

  return (
    <div className="p-4 min-h-screen bg-dark-2 text-white relative">
      <CheckboxGroup
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
        onChange={(values) => {
          console.info(values);
        }}
      />

      <Button onClick={() => control.current?.toggle("1")}>Add 1</Button>
      <CheckboxGroup
        control={control}
        className="flex gap-4"
        values={values}
        options={["1", "2", "3"].map((value) => ({ value }))}
        renderLabel={(field, option) => (
          <Button variant={field.checked ? "active" : "default"} onClick={field.onClick}>
            {option.value}
          </Button>
        )}
        onChange={(values) => {
          console.info(values);
          setValues(Array.from(values));
        }}
      />
    </div>
  );
}

export default App;
