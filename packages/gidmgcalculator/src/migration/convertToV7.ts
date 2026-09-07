import type { DatabaseDataV6 } from "./types/v6";
import type { DatabaseDataV7, DbSetupV7 } from "./types/v7";

type TeammateV7 = DbSetupV7["teammates"][number];

export function convertToV7(data: DatabaseDataV6): DatabaseDataV7 {
  return {
    ...data,
    version: 7,
    setups: data.setups.map((setup) => {
      if (setup.type === "complex") {
        return setup;
      }

      const teammates = setup.teammates.map<TeammateV7>((teammate) => {
        let artifact: TeammateV7["artifact"] = undefined;

        if (teammate.artifact) {
          // const debuffCtrl = convertArtDebuffCtrls(teammate.artifact.code);

          artifact = {
            ...teammate.artifact,
            debuffCtrls: [],
          };
        }

        return {
          ...teammate,
          artifact,
        };
      });

      // const artDebuffCtrls: ArtifactModCtrlState[] = [];

      // const counter = new CountMap<number>();

      // for (const id of setup.main.artifactIDs) {
      //   const atf = data.artifacts.find((atf) => atf.ID === id);
      //   if (!atf) continue;

      //   const newCount = counter.add(atf.code);

      //   if (newCount === 4) {
      //     const debuffCtrl = convertArtDebuffCtrls(atf.code);

      //     if (debuffCtrl) {
      //       artDebuffCtrls.push({
      //         ...debuffCtrl,
      //         code: atf.code,
      //       });
      //     }
      //     break;
      //   }
      // }

      const result: DbSetupV7 = {
        ...setup,
        teammates,
        artDebuffCtrls: [],
      };

      return result;
    }),
  };
}

// function convertArtDebuffCtrls(atfCode: number): ModifierCtrlState | undefined {
//   switch (atfCode) {
//     case 15:
//       return {
//         id: 0,
//         activated: false,
//         inputs: [0],
//       };
//     case 33:
//       return {
//         id: 0,
//         activated: false,
//       };
//     default:
//       return undefined;
//   }
// }
