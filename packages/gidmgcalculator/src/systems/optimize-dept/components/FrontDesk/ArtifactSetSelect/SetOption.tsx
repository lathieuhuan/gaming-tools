import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Button, Checkbox, clsx } from "rond";

import type { ArtifactManager, ManagedArtifactSet } from "@OptimizeDept/logic/ArtifactManager";
import { GenshinImage } from "@/components";

type SetOptionProps = Pick<ActionsAnimatorProps, "closing"> & {
  active: boolean;
  visible: boolean;
  set: ManagedArtifactSet;
  manager: ArtifactManager;
  onLabelClick: () => void;
  onSelectPiecesClick: () => void;
  onSetsChange: (set: ManagedArtifactSet[]) => void;
  afterActionsClosed: () => void;
};

export function SetOption(props: SetOptionProps) {
  const { active, set, manager, onSetsChange } = props;
  const { data } = set;

  const selectedCount = set.selectedIds.size;
  const total = set.pieces.length;

  const onSelectAllChange = (checked: boolean) => {
    onSetsChange(checked ? manager.selectAll(data.code) : manager.unselectAll(data.code));
  };

  const handleRemoveEquipped = () => {
    onSetsChange(manager.removeEquipped(data.code));
  };

  return (
    <div>
      <div className="bg-dark-1 rounded-sm flex">
        <div
          className={clsx(
            "px-2 py-0.5 grow overflow-hidden flex items-center cursor-pointer",
            !active && "glow-on-hover"
          )}
          title={data.name}
          onClick={props.onLabelClick}
        >
          <div className="w-9 h-9 shrink-0">
            {props.visible && <GenshinImage src={data.flower.icon} imgType="artifact" fallbackCls="p-2" />}
          </div>
          <span className={`ml-2 pr-4 truncate ${active && !props.closing && "text-primary-1"}`}>{data.name}</span>

          <p className="ml-auto">
            {selectedCount ? <span className="text-light-1">{selectedCount}</span> : null}
            <span className="text-light-hint">
              {selectedCount ? "/" : ""}
              {total}
            </span>
          </p>
        </div>

        <div className="flex items-center shrink-0">
          <div className="w-px h-2/3 bg-dark-line" />
          <Checkbox
            size="medium"
            className="w-10 h-10 flex-center"
            checked={selectedCount === total}
            indeterminate={!!selectedCount && selectedCount !== total}
            onChange={onSelectAllChange}
          />
        </div>
      </div>

      {active && (
        <ActionsAnimator closing={props.closing} afterClosed={props.afterActionsClosed}>
          <div className="p-3 bg-dark-3 rounded-b-sm flex gap-3">
            <Button size="small" disabled={!manager.checkAnyEquippedSelected(set)} onClick={handleRemoveEquipped}>
              Remove Equipped
            </Button>

            <Button
              size="small"
              className="gap-0 pr-1"
              icon={<FaCaretRight className="text-lg" />}
              iconPosition="end"
              onClick={props.onSelectPiecesClick}
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
  closing: boolean;
  children: React.ReactNode;
  afterClosed: () => void;
}
function ActionsAnimator(props: ActionsAnimatorProps) {
  const [expanding, setExpanding] = useState(false);
  const state = useRef<State>();

  if (!state.current) {
    setTimeout(() => setExpanding(true), 50);
    state.current = "OPENING";
  }

  if (props.closing && state.current === "OPENING") {
    setTimeout(() => setExpanding(false), 0);
    state.current = "CLOSING";
  }

  return (
    <div
      className="overflow-hidden transition-size duration-200"
      style={{ height: expanding ? 48 : 0 }}
      onTransitionEnd={() => {
        if (props.closing) props.afterClosed();
      }}
    >
      {props.children}
    </div>
  );
}
