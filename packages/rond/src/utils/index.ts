type Option = {
  label: string;
  value: number;
};

export function genSequence(count: number): Option[];
export function genSequence<T>(count: number, transform: (num: number) => T): T[];
export function genSequence<T>(count: number, transform?: (num: number) => T): Option[] | T[] {
  if (transform) {
    return Array.from({ length: count }, (_, i) => transform(i + 1));
  }
  return Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return {
      label: `Option ${num}`,
      value: num,
    };
  });
}
