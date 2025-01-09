import { migrateSetupsToV1 } from "@Store/migration/migrateToV1";
import { UploadedData } from "../Upload.types";

export const convertToV3_1 = (data: UploadedData): UploadedData => {
  return {
    ...data,
    setups: migrateSetupsToV1(data.setups, data.artifacts),
  };
};
