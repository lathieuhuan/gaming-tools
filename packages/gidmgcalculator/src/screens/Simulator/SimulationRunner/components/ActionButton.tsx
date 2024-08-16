import { FaSyncAlt } from "react-icons/fa";
import { Button } from "rond";

interface ActionButtonProps {
  className?: string;
  ctaText: string;
  onClick?: (alsoSwitch: boolean) => void;
}
export function ActionButton(props: ActionButtonProps) {
  return (
    <div className={"flex justify-end " + (props.className ?? "")}>
      <Button shape="square" size="small" className="action-btn" onClick={() => props.onClick?.(false)}>
        {props.ctaText}
      </Button>

      <Button
        shape="square"
        size="small"
        className="switch-action-btn ml-0.5 rounded-l-none"
        icon={<FaSyncAlt />}
        onClick={() => props.onClick?.(true)}
      />
    </div>
  );
}
