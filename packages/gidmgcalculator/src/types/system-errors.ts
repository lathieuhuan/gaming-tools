type UnknownErrorDetail = {
  type: "UNKNOWN_ERROR";
};

type V4MigrationErrorDetail = {
  type: "V4_MIGRATION_ERROR";
};

export type SystemErrorDetail = UnknownErrorDetail | V4MigrationErrorDetail;
