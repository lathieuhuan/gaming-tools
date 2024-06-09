import { clsx } from "rond";

interface AttackEventGroupProps<T> {
  name: string;
  items: T[];
  getItemState: (
    item: T,
    index: number
  ) => {
    label: string;
    isActive: boolean;
  };
  renderContent: (item: T, index: number) => React.JSX.Element;
  onClickItem?: (item: T, index: number, isActive: boolean) => void;
}
export function AttackEventGroup<T>(props: AttackEventGroupProps<T>) {
  return (
    <div>
      <p className="text-sm text-light-default/60">{props.name}</p>

      <div className="mt-1 space-y-1">
        {props.items.map((item, itemIndex) => {
          const { label, isActive } = props.getItemState(item, itemIndex);

          return (
            <div key={itemIndex}>
              <p
                className={clsx(
                  "px-2 py-1 cursor-pointer glow-on-hover font-medium",
                  isActive ? "bg-primary-2 text-black" : "bg-surface-3"
                )}
                onClick={() => props.onClickItem?.(item, itemIndex, isActive)}
              >
                {label}
              </p>

              {isActive && <div className="p-2">{props.renderContent(item, itemIndex)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
