import { type ClassValue } from "clsx";

import { cn } from "@lib/utils";
import { Button } from "../Button";
import {
  CheckCircleSvg,
  ExclamationCircleSvg,
  ExclamationTriangleSvg,
  InfoCircleSvg,
  TimesSvg,
} from "../svg-icons";

export interface AlertProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  type: "info" | "success" | "error" | "warn";
  content: React.ReactNode;
  onClose?: () => void;
}
export const Alert = (props: AlertProps) => {
  const renderIcon = () => {
    switch (props.type) {
      case "info":
        return <InfoCircleSvg className="text-[#0075ff]" />;
      case "success":
        return <CheckCircleSvg className="text-[#2fa80a]" />;
      case "error":
        return <ExclamationCircleSvg className="text-danger-background" />;
      case "warn":
        return <ExclamationTriangleSvg className="text-orange-500" />;
    }
  };

  return (
    <div
      className={cn("py-1 px-2 bg-light-surface-3 rounded-lg flex items-start gap-2", props.className)}
      style={props.style}
    >
      <span className="mt-1.5 flex text-xl flex-shrink-0">{renderIcon()}</span>
      <p className="py-1 flex-grow text-base font-semibold text-on-light">
        {props.content}
      </p>
      <Button
        className="flex-shrink-0 opacity-50 hover:opacity-85 text-on-light"
        variant="custom"
        withShadow={false}
        icon={<TimesSvg />}
        onClick={props.onClose}
      />
    </div>
  );
};
