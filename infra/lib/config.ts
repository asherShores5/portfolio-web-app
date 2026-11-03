// Values that differ per deploy come from CDK context (-c key=value) or env vars, with defaults
// for the public, non-secret ones. The account ID is never committed: it comes from `-c account=`
// or CDK_DEFAULT_ACCOUNT (the CDK CLI sets it from the current credentials).

export const APP_TAG = "portfolio";
export const SITE_ORIGINS = ["https://www.ashershores.com", "https://ashershores.com"];
export const RECIPIENT_EMAIL = "asher.shores5@gmail.com";
export const BUDGET_EMAIL = "asher.shores5@gmail.com";

export interface ContactConfig {
  hostedZoneId: string;
  zoneName: string;
  /** Mail domain verified in SES; also the sender's domain. */
  mailDomain: string;
  senderEmail: string;
  recipientEmail: string;
  perIpDailyLimit: number;
  totalDailyLimit: number;
}

type Lookup = (key: string) => unknown;

function str(ctx: Lookup, env: NodeJS.ProcessEnv, ctxKey: string, envKey: string, fallback: string): string {
  const v = ctx(ctxKey) ?? env[envKey];
  return typeof v === "string" && v !== "" ? v : fallback;
}

function int(ctx: Lookup, env: NodeJS.ProcessEnv, ctxKey: string, envKey: string, fallback: number): number {
  const raw = ctx(ctxKey) ?? env[envKey];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new Error(`${ctxKey} must be a positive integer, got "${String(raw)}"`);
  return n;
}

export function readContactConfig(ctx: Lookup, env: NodeJS.ProcessEnv): ContactConfig {
  const zoneName = str(ctx, env, "hostedZoneName", "HOSTED_ZONE_NAME", "ashershores.com");
  return {
    hostedZoneId: str(ctx, env, "hostedZoneId", "HOSTED_ZONE_ID", "Z03837921G383RCR4HG5"),
    zoneName,
    mailDomain: zoneName,
    senderEmail: `noreply@${zoneName}`,
    recipientEmail: str(ctx, env, "recipientEmail", "RECIPIENT_EMAIL", RECIPIENT_EMAIL),
    perIpDailyLimit: int(ctx, env, "perIpDailyLimit", "PER_IP_DAILY_LIMIT", 3),
    totalDailyLimit: int(ctx, env, "totalDailyLimit", "TOTAL_DAILY_LIMIT", 50),
  };
}
