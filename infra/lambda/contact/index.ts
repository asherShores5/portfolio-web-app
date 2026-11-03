// Contact form backend behind a public Lambda Function URL (anonymous visitors, by design).
// CORS (POST from the site's origins only) is enforced by the Function URL itself, so this handler
// adds no CORS headers. Abuse limits: validation, a honeypot, and DynamoDB daily rate limits.

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SESv2Client } from "@aws-sdk/client-sesv2";
import type { APIGatewayProxyResultV2, LambdaFunctionURLEvent } from "aws-lambda";
import { checkRateLimit } from "./rateLimit";
import { sendContactEmail } from "./send";
import { parseBody, validate } from "./validate";

export interface Deps {
  db: DynamoDBClient;
  ses: SESv2Client;
  env: NodeJS.ProcessEnv;
  now: () => Date;
}

type Result = Exclude<APIGatewayProxyResultV2, string> & { statusCode: number; body: string };

function json(statusCode: number, message: string): Result {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify({ message }) };
}

function positiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export async function handle(event: LambdaFunctionURLEvent, deps: Deps): Promise<Result> {
  try {
    if (event.requestContext?.http?.method !== "POST") return json(405, "Method not allowed");

    const result = validate(parseBody(event.body, event.isBase64Encoded));
    if (result.kind === "invalid") return json(400, result.message);
    if (result.kind === "honeypot") return json(200, "Message sent"); // silent drop

    const { env } = deps;
    const tableName = env.TABLE_NAME;
    const from = env.SENDER_EMAIL;
    const to = env.RECIPIENT_EMAIL;
    if (!tableName || !from || !to) throw new Error("TABLE_NAME, SENDER_EMAIL and RECIPIENT_EMAIL must be set");

    const ip = event.requestContext.http.sourceIp || "unknown";
    const limit = await checkRateLimit(
      deps.db,
      { tableName, perIpLimit: positiveInt(env.PER_IP_DAILY_LIMIT, 3), totalLimit: positiveInt(env.TOTAL_DAILY_LIMIT, 50) },
      ip,
      deps.now(),
    );
    if (!limit.ok) return json(429, "Too many messages today. Please try again tomorrow.");

    await sendContactEmail(deps.ses, { from, to }, result.value);
    return json(200, "Message sent");
  } catch (err) {
    console.error("contact handler failed", err);
    return json(500, "Something went wrong. Please try again later.");
  }
}

const db = new DynamoDBClient({});
const ses = new SESv2Client({});

export const handler = (event: LambdaFunctionURLEvent) => handle(event, { db, ses, env: process.env, now: () => new Date() });
