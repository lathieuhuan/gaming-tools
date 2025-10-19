import { useEffect, useState } from "react";
import { Button, clsx, Input, LoadingSpin, SearchSvg, Select } from "rond";

import { useSearchParams } from "@/systems/router";
import Object_ from "@/utils/Object";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectEnkaParams, updateEnkaParams } from "@Store/ui-slice";
import { useDataImportState } from "../DataImportProvider";
import { SearchParams } from "../types";

function parseSearchParams(params?: SearchParams): SearchInput {
  if (params?.uid) {
    return { type: "uid", value: params.uid };
  }

  if (params?.profile) {
    return { type: "profile", value: params.profile };
  }

  return { type: "uid", value: "" };
}

type SearchInput = {
  type: "uid" | "profile";
  value: string;
};

export type SearchBarProps = {
  className?: string;
  onSearch?: (input: SearchInput) => void;
};

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const enkaParams = useSelector(selectEnkaParams);
  const { isLoading } = useDataImportState();

  const [input, setInput] = useState<SearchInput>({
    type: "uid",
    value: "",
  });

  useEffect(() => {
    if (Object_.isEmpty(searchParams)) {
      if (Object_.isNotEmpty(enkaParams)) {
        setSearchParams(enkaParams, true);
      }
    } else {
      dispatch(updateEnkaParams(searchParams));
    }
  }, []);

  useEffect(() => {
    const newInput = parseSearchParams(searchParams);

    if (newInput.type !== input.type || newInput.value !== input.value) {
      setInput(newInput);
    }
  }, [searchParams]);

  const trimmedValue = input.value.trim();

  const updateInput = (key: keyof SearchInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const processedInput: SearchInput = {
      ...input,
      value: trimmedValue,
    };
    const newParams = { [input.type]: input.value };

    setSearchParams(newParams);
    dispatch(updateEnkaParams(newParams));
    onSearch?.(processedInput);
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
          // {
          //   label: "Profile",
          //   value: "profile",
          // },
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
        icon={isLoading ? <LoadingSpin className="text-black" /> : <SearchSvg />}
        disabled={!trimmedValue || isLoading}
        onClick={handleSearch}
      />
    </div>
  );
}
