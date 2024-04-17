import { useState, useRef, useEffect, useLayoutEffect } from "react";

import { useScreenWatcher } from "../../providers";
import { Drawer, DrawerProps } from "../Drawer";
import { Input } from "../Input";
import { Button, CloseButton } from "../Button";
import { Modal } from "../Modal";
import { Popover } from "../Popover";
import { Checkbox } from "../Checkbox";
import { FilterSvg, SearchSvg } from "../svg-icons";

import "./EntitySelectTemplate.styles.scss";

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
export function EntitySelectTemplate({
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
}: EntitySelectTemplateProps) {
  const screenWatcher = useScreenWatcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<NodeJS.Timeout>();

  const [filterOn, setFilterOn] = useState(initialFilterOn);
  const [searchOn, setSearchOn] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const focus = (e: KeyboardEvent) => {
      if (hasSearch && e.key.length === 1 && document.activeElement?.tagName !== "INPUT") {
        inputRef.current?.focus();
      }
    };
    document.body.addEventListener("keydown", focus);

    return () => {
      document.body.removeEventListener("keydown", focus);
    };
  }, []);

  useLayoutEffect(() => {
    clearTimeout(timeoutId.current);

    timeoutId.current = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 100);
  }, [keyword]);

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
      className="ron-entity-select__search ron-common-shadow"
      placeholder="Search..."
      disabled={filterOn}
      value={keyword}
      onChange={setKeyword}
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

              if (!newSearchOn) {
                setKeyword("");
              }
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
    <div className="ron-entity-select-template">
      <CloseButton className="ron-modal__close-button" boneOnly onClick={onClose} />

      <Modal.Header withDivider>
        <div className="ron-entity-select__header">
          <div>{title}</div>

          <div className="ron-entity-select__toolbar">
            {extra}

            <div className="ron-entity-select__search-filter">
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
              <span className="ron-entity-select__multi-toggle">
                <Checkbox onChange={setIsMultiSelect}>Multiple</Checkbox>
              </span>
            ) : null}
          </div>
        </div>
      </Modal.Header>

      <div ref={bodyRef} className="ron-entity-select__body">
        {children({
          isMultiSelect,
          searchOn,
          keyword: debouncedKeyword,
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
          getContainer={() => bodyRef.current}
        >
          {renderFilter?.(setFilterOn)}
        </Drawer>
      </div>
    </div>
  );
}
