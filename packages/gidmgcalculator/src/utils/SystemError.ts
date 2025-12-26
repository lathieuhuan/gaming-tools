import type { SystemErrorDetail } from "@/types/system-errors";

export class SystemError extends Error {
  readonly detail: SystemErrorDetail;

  constructor(detail: SystemErrorDetail, message = detail.type) {
    super(message);
    this.detail = detail;
  }
}
