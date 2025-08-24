import { useState } from "react";
import { Button, clsx, Input, SearchSvg, Select } from "rond";

import { SearchParams } from "./types";

type Input = {
  type: "uid" | "profile";
  value: string;
};

function getInitialInput(params?: SearchParams): Input {
  if (params?.uid) {
    return { type: "uid", value: params.uid };
  }
  if (params?.profile) {
    return { type: "profile", value: params.profile };
  }
  return { type: "uid", value: "" };
}

export type SearchBarProps = {
  className?: string;
  searchParams?: SearchParams;
  onSearch: (input: Input) => void;
};

export function SearchBar({ className, searchParams, onSearch }: SearchBarProps) {
  const [input, setInput] = useState<Input>(getInitialInput(searchParams));

  const updateInput = (key: keyof Input, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(input);
  };

  return (
    <div className={clsx("flex gap-2", className)}>
      <Select
        className="w-20 shrink-0 border-b border-surface-border rounded-none"
        transparent
        options={[
          {
            label: "UID",
            value: "uid",
          },
          {
            label: "Profile",
            value: "profile",
          },
        ]}
        value={input.type}
        onChange={(value) => updateInput("type", value)}
      />
      <Input
        className="w-full"
        value={input.value}
        onChange={(value) => updateInput("value", value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Button className="shrink-0" variant="primary" shape="square" icon={<SearchSvg />} onClick={handleSearch} />
    </div>
  );
}
