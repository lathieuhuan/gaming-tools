import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  ModifyEvent,
  Simulation,
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationManageInfo,
} from "@Src/types";

export type SimulatorState = {
  activeId: number;
  activeMember: string;
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

export type AddSimulationPayload = PayloadAction<Partial<Simulation>>;

type AddModifyEventPayload = {
  type: "MODIFY";
  event: ModifyEvent;
};

export type AddEventPayload = PayloadAction<AddModifyEventPayload>;

type AddAttributeBonusPayload = {
  type: "ATTRIBUTE";
  bonus: SimulationAttributeBonus;
};

type AddAttackBonusPayload = {
  type: "ATTACK";
  bonus: SimulationAttackBonus;
};

type AddBonusCommonPayload = {
  /** Default to activeMember */
  toCharacter?: string;
};

export type AddBonusPayload = PayloadAction<AddBonusCommonPayload & (AddAttributeBonusPayload | AddAttackBonusPayload)>;
