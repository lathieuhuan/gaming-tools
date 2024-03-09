import "./Radio.styles.scss";

interface RadioProps {
  size?: "small" | "medium" | "large";
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}
export function Radio({ size = "small", checked, onChange }: RadioProps) {
  return (
    <span className="ron-radio">
      <input
        type="radio"
        className="ron-radio-input"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={`ron-radio-visual ron-radio-visual-${size}`} />
    </span>
  );
}
