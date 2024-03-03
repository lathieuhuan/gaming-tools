import "./styles.css";

export interface DemoProps {
  text?: string;
}

export function Demo(props: DemoProps) {
  return (
    <div className="demo">
      <p>Demo</p>
      <p>{props.text}</p>
    </div>
  );
}
