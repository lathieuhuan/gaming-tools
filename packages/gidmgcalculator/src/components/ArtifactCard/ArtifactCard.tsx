import type { CSSProperties, MouseEvent } from "react";
import { clsx, ButtonGroup, ButtonGroupItem } from "rond";

import type { Artifact } from "@/types";
import { OwnerLabel } from "../OwnerLabel";
import { ArtifactView, type ArtifactViewProps } from "./ArtifactView";

export type ArtifactCardAction<T extends Artifact = Artifact> = Omit<ButtonGroupItem, "onClick"> & {
  onClick: (e: MouseEvent<HTMLButtonElement>, artifact: T) => void;
};

export type ArtifactCardProps<T extends Artifact = Artifact> = Omit<
  ArtifactViewProps<T>,
  "className" | "artifact"
> & {
  wrapperCls?: string;
  className?: string;
  style?: CSSProperties;
  /** Default to true */
  withGutter?: boolean;
  withActions?: boolean;
  withOwnerLabel?: boolean;
  artifact?: T;
  actions?: ArtifactCardAction<T>[];
};

export function ArtifactCard<T extends Artifact>({
  wrapperCls = "",
  className = "",
  style,
  artifact,
  actions,
  withGutter = true,
  withActions = !!actions?.length,
  withOwnerLabel,
  ...viewProps
}: ArtifactCardProps<T>) {
  return (
    <div className={"flex flex-col " + wrapperCls}>
      <div
        className={clsx(
          "grow hide-scrollbar bg-dark-1 flex flex-col",
          withGutter && "p-4 rounded-lg",
          className
        )}
        style={style}
      >
        <div className="grow hide-scrollbar">
          <ArtifactView artifact={artifact} {...viewProps} />
        </div>

        {artifact && withActions && actions?.length ? (
          <ButtonGroup
            className="mt-4"
            buttons={actions.map((action) => {
              return {
                ...action,
                onClick: (e) => action.onClick(e, artifact),
              };
            })}
          />
        ) : null}
      </div>

      {withOwnerLabel ? <OwnerLabel className="mt-3" item={artifact} /> : null}
    </div>
  );
}
