import type { CSSProperties, MouseEvent } from "react";
import { clsx, ButtonGroup, ButtonGroupItem } from "rond";

import type { CalcArtifact, UserArtifact } from "@Src/types";
import { OwnerLabel } from "../OwnerLabel";
import { ArtifactView, type ArtifactViewProps } from "./ArtifactView";

export type ArtifactCardAction<T extends CalcArtifact | UserArtifact = CalcArtifact> = Omit<
  ButtonGroupItem,
  "onClick"
> & {
  onClick: (e: MouseEvent<HTMLButtonElement>, artifact: T) => void;
};

interface ArtifactCardProps<T extends CalcArtifact | UserArtifact>
  extends Omit<ArtifactViewProps<T>, "className" | "artifact"> {
  wrapperCls?: string;
  className?: string;
  style?: CSSProperties;
  /** Default to true */
  withGutter?: boolean;
  withActions?: boolean;
  withOwnerLabel?: boolean;
  artifact?: T;
  actions?: ArtifactCardAction<T>[];
}
export function ArtifactCard<T extends CalcArtifact | UserArtifact>({
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
        className={clsx("grow hide-scrollbar bg-dark-900 flex flex-col", withGutter && "p-4 rounded-lg", className)}
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

      {withOwnerLabel ? <OwnerLabel className="mt-4" item={artifact} /> : null}
    </div>
  );
}
