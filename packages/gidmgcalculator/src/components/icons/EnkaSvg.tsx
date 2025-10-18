import { SvgProps } from "rond";

export function EnkaSvg(props: SvgProps) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 448 448"
      {...props}
    >
      <path
        fill="currentColor"
        d="M223.651 40.938l-68.015 117.802 45.023 23.482 22.992-39.832 82.668 143.187 45.023-23.462zM132.706 198.471l-120.355 208.46h76.864l29.368-50.726h-18.373l77.518-134.272zM225 227.43l-53.709 53.73 53.709 53.73 53.73-53.73zM374.277 301.822l-45.044 23.462 17.862 30.922h-177.456l-29.368 50.725h294.682z"
      ></path>
    </svg>
  );
}
