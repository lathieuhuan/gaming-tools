import clsx, { type ClassValue } from "clsx";
import { CheckCircleSvg, ExclamationCircleSvg, ExclamationTriangleSvg, InfoCircleSvg, TimesSvg } from "../svg-icons";
import { Button } from "../Button";
import "./Alert.styles.scss";

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
        return <InfoCircleSvg />;
      case "success":
        return <CheckCircleSvg />;
      case "error":
        return <ExclamationCircleSvg />;
      case "warn":
        return <ExclamationTriangleSvg className="text-orange-500" />;
    }
  };

  return (
    <div className={clsx("ron-alert", props.className)} style={props.style}>
      <span className={`ron-alert-icon ron-alert-icon-${props.type}`}>{renderIcon()}</span>
      <p className="font-alert-content">{props.content}</p>
      <Button
        className="ron-alert-close"
        variant="custom"
        withShadow={false}
        icon={<TimesSvg />}
        onClick={props.onClose}
      />
    </div>
  );
};
