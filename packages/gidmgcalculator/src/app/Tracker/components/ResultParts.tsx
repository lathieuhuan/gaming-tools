import { PositiveText } from "@/components/Text";
import { Fragment } from "react";

type ProcessFn = (value: number) => string | number;

export type PartSpec = {
  label: React.ReactNode;
  value?: number;
  sign: string | null;
  /** Default 0 */
  nullValue?: number | null;
  process?: ProcessFn;
};

type PartProps = PartSpec;

export function Part(props: PartProps) {
  const { value, sign = "*", nullValue = 0 } = props;

  if (value !== undefined && value !== nullValue) {
    return (
      <>
        {sign ? <PositiveText> {sign} </PositiveText> : null}
        {props.label} <PositiveText>{props.process ? props.process(value) : value}</PositiveText>
      </>
    );
  }

  return null;
}

type PartGroupSpec = {
  sign?: string;
  containers: [string, string];
  specs: PartSpecType[];
};

export type PartSpecType = PartSpec | PartGroupSpec;

export type PartsProps = {
  specs: PartSpecType[];
};

export function Parts({ specs }: PartsProps) {
  return (
    <>
      {specs.map((spec, index) => {
        if ("specs" in spec) {
          const { containers, specs, sign } = spec;

          return (
            <Fragment key={index}>
              {sign ? <PositiveText> {sign} </PositiveText> : null}
              {containers[0]}
              <Parts specs={specs} />
              {containers[1]}
            </Fragment>
          );
        }

        return <Part key={index} {...spec} />;
      })}
    </>
  );
}
