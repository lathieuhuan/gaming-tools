import { FaCaretRight } from "react-icons/fa";
import { Button } from "rond";
import { GenshinImage } from "@Src/components";

interface SetOptionProps {
  icon?: string;
  name: string;
  isExpanded: boolean;
  selectedCount: number;
  total: number;
  /** Actions */
  children: React.ReactNode;
  onClickExpand: () => void;
}
export function SetOption(props: SetOptionProps) {
  const activeCls = props.isExpanded ? "text-primary-1" : "";
  return (
    <div>
      <div
        className="px-2 py-0.5 bg-surface-1 rounded-sm flex items-center cursor-pointer glow-on-hover"
        title={props.name}
        onClick={props.onClickExpand}
      >
        <GenshinImage className="w-9 h-9 shrink-0" src={props.icon} imgType="artifact" fallbackCls="p-2" />
        <span className={`ml-2 pr-4 truncate ${activeCls}`}>{props.name}</span>

        <p className="ml-auto">
          {props.selectedCount ? <span className={activeCls}>{props.selectedCount}</span> : null}
          <span className="text-hint-color">
            {props.selectedCount ? "/" : ""}
            {props.total}
          </span>
        </p>
      </div>

      {props.children}
    </div>
  );
}

type Action = {
  disabled?: boolean;
  onClick: () => void;
};

interface SetOptionActionsProps {
  selectAll: Action;
  unselectAll: Action;
  removeEquipped: Action;
  selectIndividual: Action;
}
export function SetOptionActions(props: SetOptionActionsProps) {
  return (
    <div className="p-3 bg-surface-3 rounded-b-sm flex gap-3">
      <div className="space-y-3">
        <Button size="small" {...props.selectAll}>
          Select All
        </Button>

        <Button size="small" {...props.unselectAll}>
          Unselect All
        </Button>
      </div>

      <div className="space-y-3">
        <Button size="small" {...props.removeEquipped}>
          Remove Equipped
        </Button>

        <Button
          size="small"
          className="gap-0 pr-1"
          icon={<FaCaretRight className="text-lg" />}
          iconPosition="end"
          {...props.selectIndividual}
        >
          Select Individually
        </Button>
      </div>
    </div>
  );
}
