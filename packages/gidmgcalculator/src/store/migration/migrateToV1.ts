import { IArtifactModCtrlBasic, IArtifactBasic, IDbArtifact } from "@/types";
import { UserdbState, initialState } from "@Store/userdb-slice";
import { UserDatabaseV0 } from "./migration.types";
import { GeneralCalc } from "@Calculation";

export const migrateSetupsToV1 = (
  setups: UserDatabaseV0["userSetups"] = [],
  artifacts: IDbArtifact[]
): UserdbState["userSetups"] => {
  // TODO announce about this
  return [];
  // return setups.map((setup) => {
  //   switch (setup.type) {
  //     case "original":
  //     case "combined": {
  //       const setupArtifacts: IArtifactBasic[] = [];

  //       for (const id of setup.artifactIDs) {
  //         const found = artifacts.find((artifact) => artifact.ID === id);
  //         if (found) setupArtifacts.push(found);
  //       }
  //       const code = GeneralCalc.getArtifactSetBonuses(setupArtifacts)[0]?.code;
  //       let newArtBuffCtrls: IArtifactModCtrlBasic[] = [];

  //       if (code) {
  //         newArtBuffCtrls = setup.artBuffCtrls.map<IArtifactModCtrlBasic>((ctrl) => {
  //           return {
  //             code,
  //             ...ctrl,
  //           };
  //         });
  //       }

  //       return {
  //         ...setup,
  //         artBuffCtrls: newArtBuffCtrls,
  //       };
  //     }
  //     default:
  //       return setup;
  //   }
  // });
};

export const migrateToV1 = (state?: UserDatabaseV0): UserdbState => {
  if (state) {
    return {
      ...state,
      userSetups: migrateSetupsToV1(state.userSetups, state.userArts),
    };
  }
  return initialState;
};
