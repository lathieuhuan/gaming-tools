import { useState } from "react";
import { Button, clsx, Input, SearchSvg, Select, LoadingSpin } from "rond";

export type SearchInput = {
  type: "uid" | "profile";
  value: string;
};

export type SearchBarProps = {
  className?: string;
  initialInput?: SearchInput;
  searching?: boolean;
  onSearch: (input: SearchInput) => void;
};

export function SearchBar({
  className,
  initialInput = {
    type: "uid",
    value: "",
  },
  searching,
  onSearch,
}: SearchBarProps) {
  const [input, setInput] = useState<SearchInput>(initialInput);

  const trimmedValue = input.value.trim();

  const updateInput = (key: keyof SearchInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const processedInput: SearchInput = {
      ...input,
      value: trimmedValue,
    };

    onSearch(processedInput);
    setInput(processedInput);
  };

  return (
    <div className={clsx("flex gap-2", className)}>
      <Select
        className="w-20 shrink-0 border-b border-dark-line rounded-none"
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
      <Button
        className="shrink-0"
        variant="primary"
        shape="square"
        icon={searching ? <LoadingSpin /> : <SearchSvg />}
        disabled={!trimmedValue || searching}
        onClick={handleSearch}
      />
    </div>
  );
}
