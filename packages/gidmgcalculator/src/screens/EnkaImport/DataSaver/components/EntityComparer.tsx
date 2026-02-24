import { cn, type ClassValue } from "rond";

export type ComparedEntity = {
  label: string;
  children: React.ReactNode;
};

type EntityComparerProps = {
  className?: ClassValue;
  items: ComparedEntity[];
};

export function EntityComparer({ className, items }: EntityComparerProps) {
  return (
    <div data-slot="entity-comparer" className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <p className="mb-1 text-light-2 font-medium">{item.label}</p>
          {item.children}
        </div>
      ))}
    </div>
  );
}
