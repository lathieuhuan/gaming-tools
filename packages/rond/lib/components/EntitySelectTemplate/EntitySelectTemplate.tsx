import clsx from "clsx";
import { useState, useRef, useEffect, useLayoutEffect } from "react";

import { useScreenWatcher } from "../../providers";
import { Input } from "../Input";
import { Button, CloseButton } from "../Button";
import { Checkbox } from "../Checkbox";
import { Popover } from "../Popover";
import { Modal } from "../Modal";
import { FilterSvg, SearchSvg } from "../svg-icons";
import { Drawer, type DrawerProps } from "../Drawer";

export type EntitySelectRenderArgs = {
  isMultiSelect: boolean;
  searchOn: boolean;
  keyword: string;
  inputRef: React.RefObject<HTMLInputElement>;
};

export interface EntitySelectTemplateProps {
  title: React.ReactNode;
  hasMultipleMode?: boolean;
  hasSearch?: boolean;
  hasFilter?: boolean;
  /** Default to 360px */
  filterWrapWidth?: DrawerProps["activeWidth"];
  /** Default to true */
  filterToggleable?: boolean;
  initialFilterOn?: boolean;
  extra?: React.ReactNode;
  children: (args: EntitySelectRenderArgs) => React.ReactNode;
  renderFilter?: (setFilterOn: (on: boolean) => void) => React.ReactNode;
  onClose: () => void;
}
export const EntitySelectTemplate = ({
  title,
  hasMultipleMode,
  hasSearch,
  hasFilter,
  filterWrapWidth = 360,
  filterToggleable = true,
  initialFilterOn = false,
  extra,
  children,
  renderFilter,
  onClose,
}: EntitySelectTemplateProps) => {
  const screenWatcher = useScreenWatcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutId = useRef<NodeJS.Timeout>();

  const [filterOn, setFilterOn] = useState(initialFilterOn);
  const [searchOn, setSearchOn] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const focus = (e: KeyboardEvent) => {
      if (hasSearch && e.key.length === 1 && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    document.body.addEventListener("keydown", focus);

    return () => {
      document.body.removeEventListener("keydown", focus);
    };
  }, []);

  useLayoutEffect(() => {
    if (searchOn) inputRef.current?.focus();
  }, [searchOn]);

  const toggleFilter = (on?: boolean) => {
    if (filterToggleable) setFilterOn(on ?? !filterOn);
  };

  let searchTool: JSX.Element | null = null;
  const searchInput = (
    <Input
      ref={inputRef}
      className="w-28 px-2 py-1 text-base leading-5 font-semibold shadow-common"
      placeholder="Search..."
      disabled={filterOn}
      value={keyword}
      onChange={(value) => {
        clearTimeout(timeoutId.current);

        timeoutId.current = setTimeout(() => {
          setKeyword(value);
        }, 100);
      }}
    />
  );

  if (hasSearch) {
    if (screenWatcher.isFromSize("sm")) {
      searchTool = searchInput;
    } else {
      searchTool = (
        <div className="relative">
          <Button
            variant={searchOn ? "active" : "default"}
            shape="square"
            size="small"
            disabled={filterOn}
            icon={<SearchSvg />}
            onClick={() => {
              const newSearchOn = !searchOn;
              setSearchOn(newSearchOn);
              if (!newSearchOn) setKeyword("");
            }}
          />

          <Popover
            as="div"
            active={searchOn}
            className={`mt-4 ${hasMultipleMode ? "left-0" : "right-0"}`}
            origin={hasMultipleMode ? "top-left" : "top-right"}
          >
            {searchInput}
          </Popover>
        </div>
      );
    }
  }

  return (
    <div className="h-full flex flex-col rounded-lg shadow-white-glow">
      <CloseButton onClick={onClose} />

      <Modal.Header withDivider>
        <div className="flex items-center justify-between relative">
          <div>{title}</div>

          <div className="mr-6 pr-4 flex items-center">
            {extra}

            <div className="flex items-center gap-3">
              {searchTool}

              {hasFilter ? (
                <Button
                  variant={filterOn ? "active" : "default"}
                  shape="square"
                  size="small"
                  icon={<FilterSvg />}
                  disabled={!filterToggleable}
                  onClick={() => toggleFilter()}
                />
              ) : null}
            </div>

            {hasMultipleMode ? (
              <label
                className={clsx(
                  "pl-2 h-6 flex items-center",
                  (hasSearch || hasFilter) && "ml-2 border-l border-dark-300"
                )}
              >
                <Checkbox className="mr-2" onChange={setIsMultiSelect} />
                <span className="text-base text-light-400">Multiple</span>
              </label>
            ) : null}
          </div>
        </div>
      </Modal.Header>

      <div className="p-3 pb-4 sm:p-4 grow overflow-hidden relative">
        {children({
          isMultiSelect,
          searchOn,
          keyword,
          inputRef,
        })}

        <Drawer
          active={filterOn}
          activeWidth={screenWatcher.isFromSize("sm") ? filterWrapWidth : "100%"}
          closeOnMaskClick={filterToggleable}
          destroyOnClose
          style={{
            boxShadow: "0 0 1px #b8b8b8",
          }}
          onClose={() => toggleFilter(false)}
        >
          {renderFilter?.(setFilterOn)}
        </Drawer>
      </div>
    </div>
  );
};
