import { FaEraser } from "react-icons/fa";
import { clsx, Button, type ClassValue } from "rond";

type MessageType = "hint" | "error";

type Message = {
  type: MessageType;
  value: string;
};

const messageClsByType: Record<MessageType, string> = {
  hint: "text-light-hint",
  error: "text-danger-2",
};

export interface FilterTemplateProps {
  className?: ClassValue;
  title?: React.ReactNode;
  // Default to type 'hint'
  message?: string | Message;
  disabledClearAll?: boolean;
  children: React.ReactNode;
  onClickClearAll?: () => void;
}
export function FilterTemplate(props: FilterTemplateProps) {
  const message =
    typeof props.message === "string" ? ({ type: "hint", value: props.message } satisfies Message) : props.message;

  return (
    <div className={clsx("space-y-4", props.className)}>
      <div className="flex justify-between items-center">
        <div className="whitespace-nowrap">{props.title}</div>
        <Button size="small" icon={<FaEraser />} disabled={props.disabledClearAll} onClick={props.onClickClearAll}>
          Clear all
        </Button>
      </div>

      {message?.value ? <div className={clsx("text-sm", messageClsByType[message.type])}>{message.value}</div> : null}
      {props.children}
    </div>
  );
}
