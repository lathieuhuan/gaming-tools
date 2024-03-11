interface PlainGroundProps {
  width?: string | number;
  height?: string | number;
  background?: string;
  color?: string;
  children?: React.ReactNode;
}
export function PlainGround({
  width = "100%",
  height,
  background = "white",
  color = "black",
  children = <p>Plain Ground</p>,
}: PlainGroundProps) {
  return <div style={{ width, height, background, color }}>{children}</div>;
}
