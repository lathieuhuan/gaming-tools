import type {
  AmplifyingReaction,
  AppCharacter,
  AttackElement,
  AttributeStat,
  CharacterBuff,
  CharacterDebuff,
  EffectPerformableCondition,
  EffectPerformerConditions,
  EffectReceiverConditions,
  ICharacter,
  ITeam,
  ITeamMember,
  QuickenReaction,
  TalentType,
  TotalAttributes,
} from "@/types";
import type { ArtifactGear } from "../ArtifactGear";
import type { Weapon } from "../Weapon";

import TypeCounter from "@/utils/TypeCounter";
import { Character } from "../Character";
import { Team } from "../Team";
import { isPassedComparison } from "../utils/isPassedComparison";
import { isValidInput } from "../utils/isValidInput";
import { parseAbilityDesc } from "../utils/parseAbilityDesc";
import { AttackBonusControl } from "./AttackBonusControl";
import { PenaltyCalc } from "./PenaltyCalc";
import { BonusCalc } from "./BonusCalc";

export type ICalcCharacter<
  W extends Weapon = Weapon,
  A extends ArtifactGear = ArtifactGear
> = ICharacter<W, A> & {
  data: AppCharacter;
  totalAttrs: TotalAttributes;
  attkBonusCtrl: AttackBonusControl;
};

export type CalcCharacterConstructInfo<
  W extends Weapon = Weapon,
  A extends ArtifactGear = ArtifactGear
> = ICharacter<W, A> & {
  totalAttrs?: TotalAttributes;
  attkBonusCtrl?: AttackBonusControl;
};

export class CalcCharacter<
    W extends Weapon = Weapon,
    A extends ArtifactGear = ArtifactGear,
    TTeam extends ITeam = ITeam
  >
  extends Character<W, A>
  implements ICalcCharacter<W, A>, ITeamMember<TTeam>
{
  protected team: ITeam;
  protected inntateStats = new TypeCounter<AttributeStat>();

  totalAttrs: TotalAttributes;
  attkBonusCtrl: AttackBonusControl;

  constructor(info: CalcCharacterConstructInfo<W, A>, public data: AppCharacter, team?: ITeam) {
    super(info, data);

    const { totalAttrs = new TypeCounter(), attkBonusCtrl = new AttackBonusControl() } = info;

    this.totalAttrs = totalAttrs;
    this.attkBonusCtrl = attkBonusCtrl;
    this.team = team || new Team([this]);

    data.statInnates?.forEach((stat) => {
      this.inntateStats.add(stat.type, stat.value);
    });
  }

  join(team: TTeam) {
    this.team = team;
  }

  override getTotalXtraTalentLv(talentType: TalentType) {
    return this.team.extraTalentLv.get(talentType) + super.getTotalXtraTalentLv(talentType);
  }

  /** This is overridden in CharacterCalc, fixedOnly is used there */
  getTotalAttr(key: AttributeStat | "base_atk", fixedOnly = false) {
    return this.totalAttrs.get(key);
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

  protected canPerformEffect(condition: EffectPerformerConditions) {
    const { grantedAt } = condition;

    if (typeof grantedAt === "string") {
      const [prefix, level] = grantedAt;
      return (prefix === "A" ? this.ascension : this.cons) >= +level;
    }

    if (condition.checkMixed) {
      const mixedCount = this.team["getMixedCount"](this.data.vision);

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

    if (!this.team.isAvailableEffect(condition)) {
      return false;
    }
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
    if (condition.forEnhanced && !this.enhanced) {
      return false;
    }

    return true;
  }

  //

  parseBuffDesc(buff: Pick<CharacterBuff, "description" | "effects">, inputs?: number[]) {
    const calc = new BonusCalc(this, this.team, { inputs });

    return parseAbilityDesc(buff.description, buff.effects, calc);
  }

  parseDebuffDesc(debuff: Pick<CharacterDebuff, "description" | "effects">, inputs?: number[]) {
    const calc = new PenaltyCalc(this, this.team, inputs);

    return parseAbilityDesc(debuff.description, debuff.effects, calc);
  }
}
