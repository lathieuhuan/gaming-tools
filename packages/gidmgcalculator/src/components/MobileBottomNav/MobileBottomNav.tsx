interface MobileBottomNavProps {
  activeI: number;
  options: (string | number | React.JSX.Element)[];
  extraEnd?: React.ReactNode;
  onSelect: (index: number) => void;
}
export function MobileBottomNav(props: MobileBottomNavProps) {
  return (
    <div className="flex font-semibold border-t border-dark-line" style={{ backgroundColor: "#05071a" }}>
      {props.options.map((label, index) => {
        const isActive = index === props.activeI;

        return (
          <div
            key={index}
            className={"grow py-2 flex-center " + (isActive ? "text-secondary-1" : "text-light-1/60")}
            onClick={() => props.onSelect(index)}
          >
            {label}
          </div>
        );
      })}
      {props.extraEnd}
    </div>
  );
}
