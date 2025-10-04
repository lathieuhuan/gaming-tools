import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";

import "./WarehouseLayout.styles.scss";

type WarehouseLayoutProps = {
  className?: ClassValue;
  bodyStyle?: React.CSSProperties;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const WarehouseLayout = ({
  className,
  bodyStyle,
  actions,
  children,
}: WarehouseLayoutProps) => {
  return (
    <div className={cn("py-4 flex-center bg-dark-2 ron-warehouse-layout", className)}>
      <div className="relative h-full ron-warehouse" style={bodyStyle}>
        {actions ? <div className="absolute top-0 left-0 pl-2 w-full h-10">{actions}</div> : null}
        <div className="h-full flex gap-2 ron-hide-scrollbar">{children}</div>
      </div>
    </div>
  );
};
