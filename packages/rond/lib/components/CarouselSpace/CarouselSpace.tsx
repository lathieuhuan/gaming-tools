import clsx, { type ClassValue } from "clsx";
import "./CarouselSpace.styles.scss";

export interface CarouselSpaceProps {
  className?: ClassValue;
  current?: number;
  children: React.ReactNode;
}
export const CarouselSpace = ({ className, current = 0, children }: CarouselSpaceProps) => {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={clsx("ron-carousel-space", className)}>
      <div
        className="ron-carousel-list"
        style={{
          width: `calc(${items.length} * 100%)`,
          transform: `translateX(calc(-${current / items.length} * 100%))`,
        }}
      >
        {items.map((item, index) => {
          return (
            <div key={index} className="ron-carousel-item" style={{ width: `${100 / items.length}%` }}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
