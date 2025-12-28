import { FaSortAmountUpAlt } from "react-icons/fa";
import { Button } from "rond";

import { PopoverAction } from "@/components";
import type { DbItemSortPayload } from "@Store/userdb-slice/types";

type SortOption = DbItemSortPayload["option"];
type SortDirection = DbItemSortPayload["direction"];

type Option = {
  label: string;
  value: SortDirection;
};

type OptionGroupProps = {
  title: string;
  value: SortOption;
  options: Option[];
  onSelectSort?: (value: SortOption, direction: SortDirection) => void;
};

function OptionGroup({ title, value, options, onSelectSort }: OptionGroupProps) {
  return (
    <div>
      <div className="border-b border-dark-1">
        <p className="text-sm font-semibold lowercase whitespace-nowrap opacity-60">{title}</p>
      </div>
      <div className="mt-1">
        {options.map((option) => (
          <div
            key={option.value}
            className="px-2 py-1 whitespace-nowrap font-medium hover:bg-dark-1 hover:text-light-2 rounded-md"
            onClick={() => onSelectSort?.(value, option.value)}
          >
            <span className="whitespace-nowrap">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type UserItemSortButtonProps = {
  onSelectSort?: (sort: DbItemSortPayload) => void;
};

export function UserItemSortButton({ onSelectSort }: UserItemSortButtonProps) {
  const optionGroups: OptionGroupProps[] = [
    {
      title: "By time added",
      value: "time_added",
      options: [
        { label: "Oldest first", value: "asc" },
        { label: "Newest first", value: "desc" },
      ],
    },
    {
      title: "By level",
      value: "level",
      options: [
        { label: "Lowest first", value: "asc" },
        { label: "Highest first", value: "desc" },
      ],
    },
  ];

  const handleSelect: OptionGroupProps["onSelectSort"] = (option, direction) => {
    onSelectSort?.({ option, direction });
  };

  return (
    <PopoverAction
      className="z-50 left-0 pt-2"
      origin="top left"
      content={(close) => (
        <div className="p-2 rounded-md bg-light-1 text-black space-y-2 shadow-common">
          {optionGroups.map((optionGroup) => (
            <OptionGroup
              key={optionGroup.value}
              {...optionGroup}
              onSelectSort={(...args) => {
                handleSelect(...args);
                close();
              }}
            />
          ))}
        </div>
      )}
    >
      <Button icon={<FaSortAmountUpAlt />}>Sort</Button>
    </PopoverAction>
  );
}
