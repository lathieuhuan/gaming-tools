import type { PayloadAction } from "@reduxjs/toolkit";
import type { PartiallyRequired } from "rond";
import type {
  AttackBonuses,
  AttributeStat,
  CalculationFinalResult,
  ElementType,
  TotalAttribute,
  WeaponType,
} from "@Calculation";

import type {
  ArtifactSubStat,
  CalcArtifact,
  CalcCharacter,
  CalcSetup,
  CalcSetupManageInfo,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  SetupImportInfo,
  Target,
  TeammateArtifact,
  TeammateWeapon,
} from "@Src/types";

type SetupResult = {
  totalAttr: TotalAttribute;
  attkBonuses: AttackBonuses;
  finalResult: CalculationFinalResult;
};

export type CalculatorState = {
  activeId: number;
  standardId: number;
  comparedIds: number[];

  setupManageInfos: CalcSetupManageInfo[];
  setupsById: Record<string, CalcSetup>;
  resultById: Record<string, SetupResult>;
  target: Target;
};

export type UpdateCalculatorAction = PayloadAction<
  Partial<Pick<CalculatorState, "activeId" | "standardId" | "comparedIds">>
>;

export type InitNewSessionPayload = {
  ID?: number;
  name?: string;
  type?: "original" | "combined";
  calcSetup: CalcSetup;
  target?: Target;
};

export type ImportSetupAction = PayloadAction<{
  importInfo: PartiallyRequired<Pick<SetupImportInfo, "ID" | "name" | "type" | "calcSetup" | "target">, "calcSetup">;
  shouldOverwriteChar?: boolean;
  shouldOverwriteTarget?: boolean;
}>;

export type UpdateCharacterAction = PayloadAction<
  Partial<CalcCharacter> & {
    setupIds?: number | number[];
  }
>;

export type AddTeammateAction = PayloadAction<{
  name: string;
  elementType: ElementType;
  weaponType: WeaponType;
  teammateIndex: number;
}>;

export type UpdateTeammateWeaponAction = PayloadAction<
  {
    teammateIndex: number;
  } & Partial<TeammateWeapon>
>;

export type UpdateTeammateArtifactAction = PayloadAction<
  {
    teammateIndex: number;
  } & Partial<TeammateArtifact>
>;

export type UpdateCalcSetupAction = PayloadAction<
  Partial<CalcSetup> & {
    setupId?: number;
  }
>;

type InputInfo = {
  inputIndex: number;
  value: number;
};

export type ToggleModCtrlPath = {
  modCtrlName: "selfBuffCtrls" | "selfDebuffCtrls" | "wpBuffCtrls" | "artDebuffCtrls";
  ctrlIndex: number;
};
export type ToggleModCtrlAction = PayloadAction<ToggleModCtrlPath>;

type ToggleArtifactBuffCtrlPath = {
  code: number;
  ctrlIndex: number;
};

export type ToggleArtifactBuffCtrlAction = PayloadAction<ToggleArtifactBuffCtrlPath>;

export type ChangeModCtrlInputAction = PayloadAction<ToggleModCtrlPath & InputInfo>;

export type ChangeArtifactBuffCtrlInputAction = PayloadAction<ToggleArtifactBuffCtrlPath & InputInfo>;

export type ToggleTeammateModCtrlPath = {
  teammateIndex: number;
  modCtrlName: "buffCtrls" | "debuffCtrls";
  ctrlIndex: number;
};
export type ToggleTeammateModCtrlAction = PayloadAction<ToggleTeammateModCtrlPath>;

export type ChangeTeammateModCtrlInputAction = PayloadAction<ToggleTeammateModCtrlPath & InputInfo>;

export type ToggleSubWpModCtrlPath = {
  weaponType: WeaponType;
  ctrlIndex: number;
};

// CUSTOM MODIFIER CONTROL

type CustomModCtrlChange = Partial<CustomDebuffCtrl> & {
  index: number;
};

type UpdateCustomModCtrlsAction<TCtrl> = PayloadAction<
  | {
      actionType: "ADD" | "REPLACE";
      ctrls: TCtrl | TCtrl[];
    }
  | {
      actionType: "EDIT";
      ctrls: CustomModCtrlChange | CustomModCtrlChange[];
    }
>;

export type UpdateCustomBuffCtrlsAction = UpdateCustomModCtrlsAction<CustomBuffCtrl>;

export type UpdateCustomDebuffCtrlsAction = UpdateCustomModCtrlsAction<CustomDebuffCtrl>;

type CustomModCtrlPath = {
  isBuffs: boolean;
  ctrlIndex: number;
};

export type RemoveCustomModCtrlAction = PayloadAction<CustomModCtrlPath>;

export type ChangeArtifactAction = PayloadAction<{
  pieceIndex: number;
  newPiece: CalcArtifact | null;
  shouldKeepStats?: boolean;
}>;

export type UpdateArtifactAction = PayloadAction<{
  pieceIndex: number;
  level?: number;
  mainStatType?: AttributeStat;
  subStat?: {
    index: number;
    newInfo: Partial<ArtifactSubStat>;
  };
}>;

export type NewSetupManageInfo = CalcSetupManageInfo & {
  status: "REMOVED" | "OLD" | "NEW" | "DUPLICATE";
  originId?: number;
  isCompared: boolean;
};

export type UpdateSetupsAction = PayloadAction<{
  newSetupManageInfos: NewSetupManageInfo[];
  newStandardId: number;
}>;

export type ApplySettingsAction = PayloadAction<{
  mergeCharInfo?: boolean;
  changeTraveler?: boolean;
}>;
