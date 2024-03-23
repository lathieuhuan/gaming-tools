import clsx, { type ClassValue } from "clsx";
import "./WarehouseLayout.styles.scss";

interface WarehouseLayoutProps {
  className?: ClassValue;
  bodyStyle?: React.CSSProperties;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
export const WarehouseLayout = ({ className, bodyStyle, actions, children }: WarehouseLayoutProps) => {
  return (
    <div className={clsx("ron-warehouse-layout", className)}>
      <div className="ron-warehouse" style={bodyStyle}>
        {actions ? <div className="ron-warehouse-actions">{actions}</div> : null}
        <div className="ron-warehouse-content ron-hide-scrollbar">{children}</div>
      </div>
    </div>
  );
};
