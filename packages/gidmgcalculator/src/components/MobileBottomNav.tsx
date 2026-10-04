export type MobileBottomNavOption<T extends string> = {
  id?: string;
  label: React.ReactNode;
  value: T;
};

export type MobileBottomNavProps<T extends string> = {
  value: T;
  options: MobileBottomNavOption<T>[];
  extraEnd?: React.ReactNode;
  onSelect: (option: MobileBottomNavOption<T>, index: number) => void;
};

export function MobileBottomNav<T extends string>(props: MobileBottomNavProps<T>) {
  return (
    <div
      className="flex font-semibold border-t border-dark-line"
      style={{ backgroundColor: "#05071a" }}
    >
      {props.options.map((option, index) => {
        const isActive = option.value === props.value;

        return (
          <div
            key={option.value}
            id={option.id}
            className={
              "grow py-2 flex-center " + (isActive ? "text-secondary-1" : "text-light-1/60")
            }
            onClick={() => props.onSelect(option, index)}
          >
            {option.label}
          </div>
        );
      })}
      {props.extraEnd}
    </div>
  );
}
