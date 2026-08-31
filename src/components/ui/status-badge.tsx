import type { TimesheetStatus } from "@prisma/client";
export function StatusBadge({status}:{status:TimesheetStatus}) { return <span className={`status status-${status.toLowerCase()}`}>{status.toLowerCase()}</span>; }
