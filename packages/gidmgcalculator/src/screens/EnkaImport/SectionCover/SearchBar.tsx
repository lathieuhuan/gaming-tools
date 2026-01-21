import { useEffect, useState } from "react";
import { Button, clsx, Input, LoadingSpin, SearchSvg, Select } from "rond";

import type { SearchParams } from "../types";

import { useSearchParams } from "@/systems/router";
import Object_ from "@/utils/Object";
import { updateEnkaParams, useUIStore } from "@Store/ui";
import { useDataImportState } from "../DataImporter";

type SearchInput = {
  type: "uid" | "hoyo";
  value: string;
};

function parseSearchParams(params?: SearchParams): SearchInput {
  if (params?.uid) {
    return { type: "uid", value: params.uid };
  }

  if (params?.hoyo) {
    return { type: "hoyo", value: params.hoyo };
  }

  return { type: "uid", value: "" };
}

export type SearchBarProps = {
  className?: string;
  onSearchProfile?: (profile: string) => void;
};

export function SearchBar({ className, onSearchProfile }: SearchBarProps) {
  const [searchParams, setSearchParams] = useSearchParams<SearchParams>();
  const [onCooldown, setOnCooldown] = useState(false);
  const enkaParams = useUIStore((state) => state.enkaParams);
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
      updateEnkaParams(searchParams);
    }
  }, []);

  useEffect(() => {
    const newInput = parseSearchParams(searchParams);

    if (newInput.type !== input.type || newInput.value !== input.value) {
      setInput(newInput);
    }
  }, [searchParams]);

  const trimmedValue = input.value.trim();

  const updateInput = <K extends keyof SearchInput>(key: K, value: SearchInput[K]) => {
    if (!isLoading) {
      setInput((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSearchUID = (uid: string) => {
    setSearchParams({ uid });
    updateEnkaParams({ uid });
  };

  const handleSearchProfile = (profile: string) => {
    onSearchProfile?.(profile);
  };

  const handleSearch = () => {
    console.log(input);
    console.log(trimmedValue);

    switch (input.type) {
      case "uid":
        handleSearchUID(trimmedValue);
        break;
      case "hoyo":
        handleSearchProfile(trimmedValue);
        break;
    }

    setOnCooldown(true);

    setTimeout(() => {
      setOnCooldown(false);
    }, 3000);
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
          //   value: "hoyo",
          // },
        ]}
        value={input.type}
        onChange={(value) => updateInput("type", value)}
      />
      <Input
        className="w-full"
        value={input.value}
        disabled={onCooldown}
        onChange={(value) => updateInput("value", value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLoading) {
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
