import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Button, clsx } from "rond";
import { GenshinImage } from "@Src/components";

interface SetOptionProps extends Pick<ActionsAnimatorProps, "isClosing" | "afterClosedActions"> {
  icon?: string;
  name: string;
  isActive: boolean;
  selectedCount: number;
  total: number;
  anyEquippedSelected: boolean;
  onClickLabel: () => void;
  onClickSelectAll: () => void;
  onClickUnselectAll: () => void;
  onClickRemoveEquipped: () => void;
  onClickSelectPieces: () => void;
}
export function SetOption(props: SetOptionProps) {
  const { isActive, selectedCount, total } = props;
  const activeCls = isActive && !props.isClosing ? "text-primary-1" : "";

  return (
    <div>
      <div
        className={clsx(
          "px-2 py-0.5 bg-surface-1 rounded-sm flex items-center cursor-pointer",
          !isActive && "glow-on-hover"
        )}
        title={props.name}
        onClick={props.onClickLabel}
      >
        <GenshinImage className="w-9 h-9 shrink-0" src={props.icon} imgType="artifact" fallbackCls="p-2" />
        <span className={`ml-2 pr-4 truncate ${activeCls}`}>{props.name}</span>

        <p className="ml-auto">
          {selectedCount ? <span className={activeCls}>{selectedCount}</span> : null}
          <span className="text-hint-color">
            {selectedCount ? "/" : ""}
            {total}
          </span>
        </p>
      </div>

      {isActive && (
        <ActionsAnimator isClosing={props.isClosing} afterClosedActions={props.afterClosedActions}>
          <div className="p-3 bg-surface-3 rounded-b-sm flex gap-3">
            <div className="space-y-3">
              <Button size="small" disabled={selectedCount === total} onClick={props.onClickSelectAll}>
                Select All
              </Button>

              <Button size="small" disabled={!selectedCount} onClick={props.onClickUnselectAll}>
                Unselect All
              </Button>
            </div>

            <div className="space-y-3">
              <Button size="small" disabled={!props.anyEquippedSelected} onClick={props.onClickRemoveEquipped}>
                Remove Equipped
              </Button>

              <Button
                size="small"
                className="gap-0 pr-1"
                icon={<FaCaretRight className="text-lg" />}
                iconPosition="end"
                onClick={props.onClickSelectPieces}
              >
                Select Individually
              </Button>
            </div>
          </div>
        </ActionsAnimator>
      )}
    </div>
  );
}

type State = "OPENING" | "CLOSING";

interface ActionsAnimatorProps {
  isClosing: boolean;
  children: React.ReactNode;
  afterClosedActions: () => void;
}
function ActionsAnimator(props: ActionsAnimatorProps) {
  const [expanding, setExpanding] = useState(false);
  const state = useRef<State>();

  if (!state.current) {
    setTimeout(() => setExpanding(true), 50);
    state.current = "OPENING";
  }

  if (props.isClosing && state.current === "OPENING") {
    setTimeout(() => setExpanding(false), 0);
    state.current = "CLOSING";
  }

  return (
    <div
      className="overflow-hidden transition-size duration-200"
      style={{ height: expanding ? 84 : 0 }}
      onTransitionEnd={() => {
        if (props.isClosing) props.afterClosedActions();
      }}
    >
      {props.children}
    </div>
  );
}
