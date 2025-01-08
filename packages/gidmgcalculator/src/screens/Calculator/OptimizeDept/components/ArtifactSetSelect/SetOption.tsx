import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Button, Checkbox, clsx } from "rond";

import type { ManagedArtifactSet, ArtifactManager } from "../../controllers";
import { GenshinImage } from "@Src/components";

interface SetOptionProps extends Pick<ActionsAnimatorProps, "isClosing" | "afterClosedActions"> {
  isActive: boolean;
  isVisible: boolean;
  set: ManagedArtifactSet;
  manager: ArtifactManager;
  onClickLabel: () => void;
  onClickSelectPieces: () => void;
  onChangeSets: (set: ManagedArtifactSet[]) => void;
}
export function SetOption(props: SetOptionProps) {
  const { isActive, manager, onChangeSets } = props;
  const { data } = props.set;

  const selectedCount = props.set.selectedIds.size;
  const total = props.set.pieces.length;

  const onChangeSelectAll = (checked: boolean) => {
    onChangeSets(checked ? manager.selectAll(data.code) : manager.unselectAll(data.code));
  };

  return (
    <div>
      <div className="bg-surface-1 rounded-sm flex">
        <div
          className={clsx(
            "px-2 py-0.5 grow overflow-hidden flex items-center cursor-pointer",
            !isActive && "glow-on-hover"
          )}
          title={data.name}
          onClick={props.onClickLabel}
        >
          <div className="w-9 h-9 shrink-0">
            {props.isVisible && <GenshinImage src={data.flower.icon} imgType="artifact" fallbackCls="p-2" />}
          </div>
          <span className={`ml-2 pr-4 truncate ${isActive && !props.isClosing && "text-primary-1"}`}>{data.name}</span>

          <p className="ml-auto">
            {selectedCount ? <span className="text-light-default">{selectedCount}</span> : null}
            <span className="text-hint-color">
              {selectedCount ? "/" : ""}
              {total}
            </span>
          </p>
        </div>

        <div className="flex items-center shrink-0">
          <div className="w-px h-2/3 bg-surface-border" />
          <Checkbox
            size="medium"
            className="w-10 h-10 flex-center"
            checked={selectedCount === total}
            indeterminate={!!selectedCount && selectedCount !== total}
            onChange={onChangeSelectAll}
          />
        </div>
      </div>

      {isActive && (
        <ActionsAnimator isClosing={props.isClosing} afterClosedActions={props.afterClosedActions}>
          <div className="p-3 bg-surface-3 rounded-b-sm flex gap-3">
            <Button
              size="small"
              disabled={!manager.checkAnyEquippedSelected(props.set)}
              onClick={() => onChangeSets(manager.removeEquipped(data.code))}
            >
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
      style={{ height: expanding ? 48 : 0 }}
      onTransitionEnd={() => {
        if (props.isClosing) props.afterClosedActions();
      }}
    >
      {props.children}
    </div>
  );
}
