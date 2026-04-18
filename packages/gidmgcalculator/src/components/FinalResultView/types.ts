import { TalentType } from "@/types";
import { ReactNode } from "react";
import { TableTdProps, TableThProps } from "rond";
import { TableKey } from "./utils";

export type HeaderConfig = Pick<TableThProps, "className" | "style"> & {
  content: ReactNode | ((talentType: TalentType | undefined) => ReactNode);
};

type RowCellConfig = TableTdProps & {
  value?: ReactNode;
  extra?: ReactNode;
};

type RowConfig = {
  title?: string;
  cells: RowCellConfig[];
  className?: string;
  onDoubleClick?: () => void;
};

export type GetRowConfig = (mainKey: TableKey["main"], subKey: string) => RowConfig;
