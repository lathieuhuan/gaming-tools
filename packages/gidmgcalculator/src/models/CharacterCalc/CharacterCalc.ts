import type {
  AllAttributes,
  AmplifyingReaction,
  AppCharacter,
  AttackBonus,
  AttackElement,
  AttributeBonus,
  BonusPerformTools,
  CharacterBuff,
  CharacterDebuff,
  EffectPerformableCondition,
  EffectPerformerConditions,
  EffectReceiverConditions,
  EntityBonus,
  EntityBonusEffect,
  EntityPenaltyEffect,
  ICharacter,
  ITeam,
  ITeamMember,
  QuickenReaction,
  TalentType,
} from "@/types";
import type { TypeCounterKey } from "@/utils/TypeCounter";
import type { ArtifactGear } from "../ArtifactGear";
import type { Weapon } from "../Weapon";

import { AllAttributesControl } from "../AllAttributesControl";
import { AttackBonusControl } from "../AttackBonusControl";
import { Character } from "../Character";
import { Team } from "../Team";
import { isPassedComparison } from "../utils/isPassedComparison";
import { isValidInput } from "../utils/isValidInput";
import { BonusCalc } from "./BonusCalc";
import { PenaltyCalc } from "./PenaltyCalc";

type BonusMonoRecord = {
  trackId: string;
  targetId: string;
};

export type ReceivedAttributeBonus = Omit<AttributeBonus, "toStat"> & {
  toStat: AttributeBonus["toStat"] | "OWN_ELMT";
  effectSrc: EntityBonus<EntityBonusEffect>;
};

export type ReceivedAttackBonus = AttackBonus & {
  effectSrc: EntityBonus<EntityBonusEffect>;
};

export type CharacterCalcConstructInfo<
  W extends Weapon = Weapon,
  A extends ArtifactGear = ArtifactGear
> = ICharacter<W, A> & {
  allAttrsCtrl?: AllAttributesControl;
  attkBonusCtrl?: AttackBonusControl;
};

type ICharacterCalc<W extends Weapon = Weapon, A extends ArtifactGear = ArtifactGear> = ICharacter<
  W,
  A
> & {
  data: AppCharacter;
  attkBonusCtrl: AttackBonusControl;
};

export class CharacterCalc<
    W extends Weapon = Weapon,
    A extends ArtifactGear = ArtifactGear,
    TTeam extends ITeam = ITeam
  >
  extends Character<W, A>
  implements ICharacterCalc<W, A>, ITeamMember<TTeam>
{
  team: ITeam;

  allAttrsCtrl: AllAttributesControl;
  attkBonusCtrl: AttackBonusControl;

  constructor(info: CharacterCalcConstructInfo<W, A>, public data: AppCharacter, team?: ITeam) {
    super(info, data);

    const { allAttrsCtrl = new AllAttributesControl(), attkBonusCtrl = new AttackBonusControl() } =
      info;

    this.allAttrsCtrl = allAttrsCtrl;
    this.attkBonusCtrl = attkBonusCtrl;
    this.team = team || new Team([this]);
  }

  joinTeam(team: TTeam) {
    this.team = team;
  }

  // ===== OVERRIDE =====

  override getTotalXtraTalentLv(talentType: TalentType) {
    return this.team.extraTalentLv.get(talentType) + super.getTotalXtraTalentLv(talentType);
  }

  // ===== GETTERS =====

  getAttr(key: TypeCounterKey<AllAttributes>) {
    return this.allAttrsCtrl.finals.get(key);
  }

  getQuickenBuffDamage(reaction: QuickenReaction) {
    const pctBonus = this.attkBonusCtrl.get("pct_", reaction);

    switch (reaction) {
      case "aggravate":
        return Math.round(this.baseRxnDamage * 1.15 * (1 + pctBonus / 100));
      case "spread":
        return Math.round(this.baseRxnDamage * 1.25 * (1 + pctBonus / 100));
      default:
        return 1;
    }
  }

  getAmplifyingMult(reaction: AmplifyingReaction, attElmt: AttackElement) {
    const pctBonus = this.attkBonusCtrl.get("pct_", reaction);

    switch (reaction) {
      case "melt":
        return (1 + pctBonus / 100) * (attElmt === "pyro" ? 2 : attElmt === "cryo" ? 1.5 : 1);
      case "vaporize":
        return (1 + pctBonus / 100) * (attElmt === "pyro" ? 1.5 : attElmt === "hydro" ? 2 : 1);
      default:
        return 1;
    }
  }

  // ===== CALCULATION =====

  initCalc() {
    this.allAttrsCtrl.init(this);
    this.attkBonusCtrl = new AttackBonusControl();
    return this;
  }

  protected canPerformEffect(condition: EffectPerformerConditions) {
    const { grantedAt } = condition;

    if (grantedAt) {
      const { value } = typeof grantedAt === "string" ? { value: grantedAt } : grantedAt;
      const [prefix, level] = value;
      const isGranted = (prefix === "A" ? this.ascension : this.cons) >= +level;

      if (!isGranted) {
        return false;
      }
    }

    if (condition.beEnhanced && !this.enhanced) {
      return false;
    }

    if (condition.checkMixed) {
      const mixedCount = this.team.getMixedCount(this.data.vision);

      if (!isPassedComparison(mixedCount, 3, "MIN")) {
        return false;
      }
    }

    return true;
  }

  isPerformableEffect(condition?: EffectPerformableCondition, inputs: number[] = []) {
    if (!condition) {
      return true;
    }

    // if (!this.team.isAvailableEffect(condition)) {
    //   return false;
    // }
    if (!this.canPerformEffect(condition)) {
      return false;
    }
    if (!isValidInput(condition.checkInput, inputs)) {
      return false;
    }

    return true;
  }

  canReceiveEffect(condition: EffectReceiverConditions) {
    const { data } = this;

    if (condition.forNation && condition.forNation !== data.nation) {
      return false;
    }
    if (condition.forWeapons && !condition.forWeapons.includes(data.weaponType)) {
      return false;
    }
    if (condition.forElmts && !condition.forElmts.includes(data.vision)) {
      return false;
    }
    if (condition.forName && !data.name.includes(condition.forName)) {
      return false;
    }
    if (condition.forEnergyCap) {
      const { value, comparison } = condition.forEnergyCap;
      if (!isPassedComparison(data.EBcost, value, comparison)) {
        return false;
      }
    }

    const { forEnhance } = condition;

    if (forEnhance) {
      if (forEnhance === "MOONSIGN") {
        if (this.data.faction !== "moonsign") {
          return false;
        }
      } else if (!this.enhanced || this.data.enhanceType !== forEnhance) {
        return false;
      }
    }

    return true;
  }

  performBonus(config: EntityBonusEffect, support: Partial<BonusPerformTools>) {
    return new BonusCalc(this, this.team, support).makeBonus(config);
  }

  performPenalty(config: EntityPenaltyEffect, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).makePenalty(config);
  }

  // ===== RECEIVE BONUSES =====

  private monoRecords: NonNullable<BonusMonoRecord>[] = [];

  private isRecordedBonus(trackId: string, targetId: string) {
    const recorded = this.monoRecords.some((savedRecord) => {
      return trackId === savedRecord.trackId && targetId === savedRecord.targetId;
    });

    if (recorded) {
      return true;
    }

    this.monoRecords.push({ trackId, targetId });

    return false;
  }

  receiveAttrBonus(bonus: ReceivedAttributeBonus) {
    if (this.canReceiveEffect(bonus.effectSrc)) {
      const { monoId } = bonus.effectSrc;
      const toStat = bonus.toStat === "OWN_ELMT" ? this.data.vision : bonus.toStat;
      const notRecorded = !monoId || !this.isRecordedBonus(monoId, toStat);

      if (notRecorded) {
        this.allAttrsCtrl.applyBonus({
          ...bonus,
          toStat,
        });

        return true;
      }
    }

    return false;
  }

  receiveAttkBonus(bonus: ReceivedAttackBonus) {
    if (this.canReceiveEffect(bonus.effectSrc)) {
      const { monoId } = bonus.effectSrc;
      const notRecorded =
        !monoId || !this.isRecordedBonus(monoId, `${bonus.toType}/${bonus.toKey}`);

      if (notRecorded) {
        this.attkBonusCtrl.add(bonus);

        return true;
      }
    }

    return false;
  }

  //

  parseBuffDesc(buff: Pick<CharacterBuff, "description" | "effects">, inputs?: number[]) {
    return new BonusCalc(this, this.team, { inputs }).parseAbilityDesc(buff);
  }

  parseDebuffDesc(debuff: Pick<CharacterDebuff, "description" | "effects">, inputs?: number[]) {
    return new PenaltyCalc(this, this.team, inputs).parseAbilityDesc(debuff);
  }
}
