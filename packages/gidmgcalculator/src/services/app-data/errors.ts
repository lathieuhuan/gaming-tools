import { ServiceError } from "../ServiceError";

export type AppDataServiceErrorData = {
  cooldown: number;
};

export class AppDataServiceError extends ServiceError<AppDataServiceErrorData> {
  name = "AppDataServiceError";

  data = {
    cooldown: 60,
  };
}
