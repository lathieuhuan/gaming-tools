import { clsx, Button, type ClassValue } from "rond";
import { FaEraser } from "react-icons/fa";

export interface FilterTemplateProps {
  className?: ClassValue;
  title?: React.ReactNode;
  description?: React.ReactNode;
  disabledClearAll?: boolean;
  children: React.ReactNode;
  onClickClearAll?: () => void;
}
export function FilterTemplate(props: FilterTemplateProps) {
  return (
    <div className={clsx("space-y-4", props.className)}>
      <div className="flex justify-between items-center">
        <div className="whitespace-nowrap">{props.title}</div>
        <Button size="small" icon={<FaEraser />} disabled={props.disabledClearAll} onClick={props.onClickClearAll}>
          Clear all
        </Button>
      </div>

      {props.description}
      {props.children}
    </div>
  );
}
