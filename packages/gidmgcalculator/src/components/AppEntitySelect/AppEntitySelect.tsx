import { ReactNode } from "react";
import { EntitySelectTemplate, type DrawerProps } from "rond";

import { AppEntityOptionModel } from "./AppEntityOption";
import { AppEntityOptions, type AppEntityOptionsProps } from "./AppEntityOptions";

export type AppEntitySelectProps<T extends AppEntityOptionModel = AppEntityOptionModel> =
  AppEntityOptionsProps<T> & {
    title: ReactNode;
    hasMultipleMode?: boolean;
    hasSearch?: boolean;
    hasFilter?: boolean;
    /** Default 360px */
    filterWrapWidth?: DrawerProps["width"];
    /** Default true */
    filterToggleable?: boolean;
    initialFilterOn?: boolean;
    renderFilter?: (setFilterOn: (on: boolean) => void) => ReactNode;
    onClose: () => void;
  };

export function AppEntitySelect<T extends AppEntityOptionModel = AppEntityOptionModel>({
  data,
  initialChosenCode,
  hiddenCodes,
  emptyText,
  hasConfigStep,
  shouldHideSelected,
  renderOptionConfig,
  onChange,
  onClose,
  ...restProps
}: AppEntitySelectProps<T>) {
  return (
    <EntitySelectTemplate {...restProps} onClose={onClose}>
      {(renderProps) => {
        return (
          <AppEntityOptions
            onClose={onClose}
            {...renderProps}
            {...{
              data,
              initialChosenCode,
              hiddenCodes,
              emptyText,
              hasConfigStep,
              shouldHideSelected,
              renderOptionConfig,
              onChange,
            }}
          />
        );
      }}
    </EntitySelectTemplate>
  );
}
