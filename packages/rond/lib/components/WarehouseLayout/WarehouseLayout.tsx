import "./WarehouseLayout.styles.scss";

interface WarehouseLayoutProps {
  bodyStyle?: React.CSSProperties;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
export const WarehouseLayout = ({ bodyStyle, actions, children }: WarehouseLayoutProps) => {
  return (
    <div className="ron-warehouse-layout">
      <div className="ron-warehouse" style={bodyStyle}>
        {actions ? <div className="ron-warehouse-actions">{actions}</div> : null}
        <div className="ron-warehouse-content ron-hide-scrollbar">{children}</div>
      </div>
    </div>
  );
};
