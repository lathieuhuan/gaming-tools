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

export type FilterTemplateProps = {
  className?: ClassValue;
  title?: React.ReactNode;
  /** Default type 'hint' */
  message?: string | Message;
  clearAllDisabled?: boolean;
  children: React.ReactNode;
  onClearAll?: () => void;
};

export function FilterTemplate(props: FilterTemplateProps) {
  const message =
    typeof props.message === "string"
      ? ({ type: "hint", value: props.message } satisfies Message)
      : props.message;

  return (
    <div className={clsx("space-y-4", props.className)}>
      <div className="flex justify-between items-center">
        <div className="whitespace-nowrap">{props.title}</div>
        <Button
          size="small"
          icon={<FaEraser />}
          disabled={props.clearAllDisabled}
          onClick={props.onClearAll}
        >
          Clear all
        </Button>
      </div>

      {message?.value ? (
        <div className={clsx("text-sm", messageClsByType[message.type])}>{message.value}</div>
      ) : null}
      {props.children}
    </div>
  );
}
