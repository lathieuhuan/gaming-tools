type EmptyControlGroup = {
  isEmpty: true;
};

type FilledControlGroup = {
  isEmpty: false;
  key: string;
  render: (className?: string) => JSX.Element;
};

export type ControlGroup = EmptyControlGroup | FilledControlGroup;
