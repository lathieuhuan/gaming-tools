// Step 1: Convert a union to an intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// Step 2: Get the "last" member of a union
type LastOf<U> =
  UnionToIntersection<U extends any ? () => U : never> extends () => infer R ? R : never;

// Step 3: Recursively peel off members to build a tuple
type UnionToTuple<U, Last = LastOf<U>> = [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last];

// Step 4: Map each tuple element into your desired shape
type UnionToArray<U extends string | number> =
  UnionToTuple<U> extends infer T extends (string | number)[]
    ? { [K in keyof T]: { value: T[K]; render: (value: T[K]) => string } }
    : never;

// --- Usage ---
type MyUnion = "a" | "b";
type TargetType = UnionToArray<MyUnion>;

// Resulting type:
const a: TargetType = [
  { value: "a", render: () => "string" },
  { value: "b", render: () => "string" },
];

console.log(a);

export function SwitchNode<T extends string | number>(props: { cases: UnionToArray<T>; value: T }) {
  console.log(props);
  return null;
}

enum MyEnum {
  B = "b",
  A = "a",
  C = "c",
}

export function Demo() {
  const value: MyEnum = MyEnum.B;

  return (
    <SwitchNode
      cases={[
        {
          value: MyEnum.B,
          render: () => "string",
        },
        {
          value: MyEnum.A,
          render: () => "string",
        },
        {
          value: MyEnum.C,
          render: () => "string",
        },
      ]}
      value={value as MyEnum}
    />
  );
}
