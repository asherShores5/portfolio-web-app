// Daily counters in DynamoDB: one per visitor IP and one for the whole site. Each check is a single
// atomic UpdateItem that only succeeds while the counter is under its limit, so concurrent requests
// can't race past it. Items expire through the table's TTL a couple of days later.

import { ConditionalCheckFailedException, type DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

export interface RateLimitConfig {
  tableName: string;
  perIpLimit: number;
  totalLimit: number;
}

export type RateLimitResult = { ok: true } | { ok: false; reason: "ip" | "total" };

const TTL_SECONDS = 2 * 24 * 60 * 60;

export function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

/**
 * The update for one counter. Every attribute name goes through ExpressionAttributeNames: `count`
 * is a DynamoDB reserved word, and a bare one only fails against the real service, not in mocks.
 */
export function counterUpdate(tableName: string, pk: string, limit: number, now: Date) {
  return new UpdateItemCommand({
    TableName: tableName,
    Key: { pk: { S: pk } },
    UpdateExpression: "ADD #count :one SET #expiresAt = :expiresAt",
    ConditionExpression: "attribute_not_exists(#count) OR #count < :limit",
    ExpressionAttributeNames: { "#count": "count", "#expiresAt": "expiresAt" },
    ExpressionAttributeValues: {
      ":one": { N: "1" },
      ":limit": { N: String(limit) },
      ":expiresAt": { N: String(Math.floor(now.getTime() / 1000) + TTL_SECONDS) },
    },
  });
}

async function take(db: DynamoDBClient, cmd: UpdateItemCommand): Promise<boolean> {
  try {
    await db.send(cmd);
    return true;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException || (err as { name?: string })?.name === "ConditionalCheckFailedException") {
      return false;
    }
    throw err;
  }
}

/**
 * Per-IP first, then the site total, so a visitor already over their own limit doesn't use up the
 * shared daily allowance. (The reverse leak, an IP slot used when the total is full, is harmless.)
 */
export async function checkRateLimit(db: DynamoDBClient, cfg: RateLimitConfig, ip: string, now: Date): Promise<RateLimitResult> {
  const day = dayKey(now);
  if (!(await take(db, counterUpdate(cfg.tableName, `ip#${ip}#${day}`, cfg.perIpLimit, now)))) return { ok: false, reason: "ip" };
  if (!(await take(db, counterUpdate(cfg.tableName, `day#${day}`, cfg.totalLimit, now)))) return { ok: false, reason: "total" };
  return { ok: true };
}
