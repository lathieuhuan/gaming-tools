import { markGreen } from "@/components";
import { Fragment } from "react";

type ProcessFn = (value: number) => string | number;

export type PartConfig = {
  label: React.ReactNode;
  value?: number;
  /** Default '*' */
  sign?: string | null;
  /** Default 0 */
  nullValue?: number | null;
  process?: ProcessFn;
};

type PartProps = PartConfig;

export function Part(props: PartProps) {
  const { value, sign = "*", nullValue = 0 } = props;

  if (value !== undefined && value !== nullValue) {
    return (
      <Fragment>
        {sign ? <> {markGreen(sign)} </> : null}
        {props.label} {markGreen(props.process ? props.process(value) : value)}
      </Fragment>
    );
  }

  return null;
}

type GroupPartConfig = {
  containers: [string, string];
  parts: PartConfig[];
};

export type PartsConfig = PartConfig | GroupPartConfig;

export type PartsProps = {
  configs: PartsConfig[];
};

export function Parts({ configs }: PartsProps) {
  return (
    <Fragment>
      {configs.map((config, index) => {
        if ("parts" in config) {
          const { containers = ["(", ")"], parts } = config;

          return (
            <Fragment key={index}>
              {containers[0]}
              <Parts configs={parts} />
              {containers[1]}
            </Fragment>
          );
        }

        return <Part key={index} {...config} />;
      })}
    </Fragment>
  );
}
