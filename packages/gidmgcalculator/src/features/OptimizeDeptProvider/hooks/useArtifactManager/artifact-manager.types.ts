import type { PartiallyOptional } from "rond";
import type { OptimizerArtifactModConfigs, AppArtifact } from "@Calculation";
import type { UserArtifact } from "@Src/types";

export type InputArtifact = PartiallyOptional<UserArtifact, "owner">;

export type ManagedArtifactSet = {
  data: AppArtifact;
  pieces: InputArtifact[];
  selectedIds: Set<number>;
};

export type CalculationCount = {
  isExceededLimit: boolean;
  value: number;
};

export type ToggleModConfig = (setCode: number, configIndex: number) => OptimizerArtifactModConfigs;

export type ChangeModConfigInputs = (
  setCode: number,
  configIndex: number,
  inputs?: number[]
) => OptimizerArtifactModConfigs;
