import type { EquipmentRelationData } from "@/types";
import { Object_ } from "ron-utils";

export class EquipmentRelation implements EquipmentRelationData {
  owner?: number;
  setupIDs?: number[];

  constructor(init: Partial<EquipmentRelationData> = {}) {
    this.owner = init.owner;
    this.setupIDs = init.setupIDs?.slice();
  }

  update(changes: Partial<EquipmentRelationData>) {
    Object_.patch<EquipmentRelation>(this, {
      owner: changes.owner,
      setupIDs: changes.setupIDs?.slice(),
    });

    return this;
  }

  set<TKey extends keyof EquipmentRelationData>(key: TKey, value: EquipmentRelationData[TKey]) {
    const clonedValue = Object_.isObject(value) ? Object_.clone(value) : value;

    Object_.assign<EquipmentRelation>(this, {
      [key]: clonedValue,
    });

    return this;
  }

  clear() {
    this.owner = undefined;
    this.setupIDs = undefined;

    return this;
  }
}
