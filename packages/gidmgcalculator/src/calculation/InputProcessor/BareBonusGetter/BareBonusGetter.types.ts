export type SupportInfo = {
  fromSelf: boolean;
  inputs: number[];
};

export type BonusGetterSupport = SupportInfo & {
  refi?: number;
  basedOnStable?: boolean;
};
