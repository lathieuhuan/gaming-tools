import type { TourSiteLocation } from "./types";

const MASK_ID = "tour-site-mask";

type TourFrameProps = {
  location: TourSiteLocation;
  children: React.ReactNode;
};

export function TourFrame({ location, children }: TourFrameProps) {
  const { top, left, width, height } = location;
  const rightWidth = window.innerWidth - left - width;
  const bottomHeight = window.innerHeight - top - height;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Mouse event preventer */}
      <div className="absolute pointer-events-auto top-0 w-full" style={{ height: top }} />
      <div className="absolute pointer-events-auto right-0 h-full" style={{ width: rightWidth }} />
      <div
        className="absolute pointer-events-auto bottom-0 w-full"
        style={{ height: bottomHeight }}
      />
      <div className="absolute pointer-events-auto left-0 h-full" style={{ width: left }} />

      {/* Mask */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <mask id={MASK_ID}>
              <rect width="100%" height="100%" fill="white" />
              <rect
                fill="black"
                width={width}
                height={height}
                rx="6"
                ry="6"
                // transform-origin="10px 10px"
                style={{
                  transform: `translateX(${left}px) translateY(${top}px)`,
                }}
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.4)" mask={`url(#${MASK_ID})`} />
        </svg>
      </div>

      {children}
    </div>
  );
}
