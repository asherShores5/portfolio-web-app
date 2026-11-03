import { ConditionalCheckFailedException, DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import type { LambdaFunctionURLEvent } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Deps, handle } from "../lambda/contact/index";

const dbMock = mockClient(DynamoDBClient);
const sesMock = mockClient(SESv2Client);

const ENV = {
  TABLE_NAME: "limits",
  SENDER_EMAIL: "noreply@ashershores.com",
  RECIPIENT_EMAIL: "asher.shores5@gmail.com",
  PER_IP_DAILY_LIMIT: "3",
  TOTAL_DAILY_LIMIT: "50",
};
const NOW = new Date("2026-11-03T12:00:00Z");

function deps(): Deps {
  return { db: new DynamoDBClient({}), ses: new SESv2Client({}), env: { ...ENV }, now: () => NOW };
}

function event(body: unknown, opts: { method?: string; base64?: boolean; raw?: boolean; ip?: string } = {}): LambdaFunctionURLEvent {
  const text = opts.raw ? (body as string) : JSON.stringify(body);
  return {
    body: opts.base64 ? Buffer.from(text, "utf8").toString("base64") : text,
    isBase64Encoded: Boolean(opts.base64),
    requestContext: { http: { method: opts.method ?? "POST", sourceIp: opts.ip ?? "203.0.113.7" } },
  } as unknown as LambdaFunctionURLEvent;
}

const VALID = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there" };
const conditionalFail = () => new ConditionalCheckFailedException({ message: "The conditional request failed", $metadata: {} });

beforeEach(() => {
  dbMock.reset();
  sesMock.reset();
  dbMock.on(UpdateItemCommand).resolves({});
  sesMock.on(SendEmailCommand).resolves({ MessageId: "m-1" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function body(res: { body: string }) {
  return JSON.parse(res.body) as { message: string };
}

describe("happy path", () => {
  it("sends one email from noreply with the visitor in Reply-To, and answers JSON 200", async () => {
    const res = await handle(event(VALID), deps());
    expect(res.statusCode).toBe(200);
    expect(res.headers).toEqual({ "content-type": "application/json" });
    expect(body(res).message).toBe("Message sent");

    const sent = sesMock.commandCalls(SendEmailCommand);
    expect(sent).toHaveLength(1);
    const input = sent[0].args[0].input;
    expect(input.FromEmailAddress).toBe("noreply@ashershores.com");
    expect(input.Destination?.ToAddresses).toEqual(["asher.shores5@gmail.com"]);
    expect(input.ReplyToAddresses).toEqual(["ada@example.com"]);
    expect(input.Content?.Simple?.Subject?.Data).toBe("Portfolio contact: Ada Lovelace");
    expect(input.Content?.Simple?.Body?.Text?.Data).toContain("Hello there");
  });

  it("accepts a base64-encoded body", async () => {
    const res = await handle(event(VALID, { base64: true }), deps());
    expect(res.statusCode).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(1);
  });
});

describe("rejects bad requests with 400 JSON and sends nothing", () => {
  const cases: [string, LambdaFunctionURLEvent][] = [
    ["malformed JSON", event("{not json", { raw: true })],
    ["empty body", event("", { raw: true })],
    ["JSON array", event([1, 2])],
    ["JSON null", event(null)],
    ["bad base64 JSON", event("%%%", { raw: true, base64: true })],
    ["missing name", event({ email: VALID.email, message: VALID.message })],
    ["blank name", event({ ...VALID, name: "   " })],
    ["name too long", event({ ...VALID, name: "a".repeat(101) })],
    ["non-string message", event({ ...VALID, message: 42 })],
    ["blank message", event({ ...VALID, message: "\n \t" })],
    ["message too long", event({ ...VALID, message: "a".repeat(5001) })],
    ["email without @", event({ ...VALID, email: "ada.example.com" })],
    ["email too long", event({ ...VALID, email: `${"a".repeat(250)}@x.com` })],
    ["email with space", event({ ...VALID, email: "ada lovelace@example.com" })],
    ["header injection in email (CRLF + Bcc)", event({ ...VALID, email: "ada@example.com\r\nBcc: victim@example.com" })],
    ["header injection in email (LF)", event({ ...VALID, email: "ada@example.com\nX: y" })],
    ["header injection in name (CRLF)", event({ ...VALID, name: "Ada\r\nBcc: victim@example.com" })],
    ["two addresses in email", event({ ...VALID, email: "a@example.com,b@example.com" })],
  ];
  it.each(cases)("%s", async (_label, ev) => {
    const res = await handle(ev, deps());
    expect(res.statusCode).toBe(400);
    expect(res.headers).toEqual({ "content-type": "application/json" });
    expect(typeof body(res).message).toBe("string");
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
    expect(dbMock.commandCalls(UpdateItemCommand)).toHaveLength(0);
  });

  it("accepts limits at the boundary (100-char name, 5000-char message), trimming whitespace", async () => {
    const res = await handle(event({ name: ` ${"n".repeat(100)} `, email: " ada@example.com ", message: "m".repeat(5000) }), deps());
    expect(res.statusCode).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)[0].args[0].input.ReplyToAddresses).toEqual(["ada@example.com"]);
  });
});

describe("method", () => {
  it("refuses anything but POST", async () => {
    const res = await handle(event(VALID, { method: "GET" }), deps());
    expect(res.statusCode).toBe(405);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });
});

describe("honeypot", () => {
  it("silently drops a filled honeypot: 200 but no email and no counter use", async () => {
    const res = await handle(event({ ...VALID, website: "http://spam.example" }), deps());
    expect(res.statusCode).toBe(200);
    expect(body(res).message).toBe("Message sent");
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
    expect(dbMock.commandCalls(UpdateItemCommand)).toHaveLength(0);
  });

  it.each([["empty string", ""], ["absent", undefined]])("an %s honeypot is fine", async (_l, website) => {
    const res = await handle(event({ ...VALID, website }), deps());
    expect(res.statusCode).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(1);
  });
});

describe("rate limits", () => {
  it("checks the per-IP counter first, then the daily total, with the UTC date in the keys", async () => {
    await handle(event(VALID, { ip: "198.51.100.9" }), deps());
    const keys = dbMock.commandCalls(UpdateItemCommand).map((c) => c.args[0].input.Key?.pk?.S);
    expect(keys).toEqual(["ip#198.51.100.9#2026-11-03", "day#2026-11-03"]);
    const limits = dbMock.commandCalls(UpdateItemCommand).map((c) => c.args[0].input.ExpressionAttributeValues?.[":limit"]?.N);
    expect(limits).toEqual(["3", "50"]);
  });

  it("sets expiresAt about two days out", async () => {
    await handle(event(VALID), deps());
    const exp = Number(dbMock.commandCalls(UpdateItemCommand)[0].args[0].input.ExpressionAttributeValues?.[":expiresAt"]?.N);
    expect(exp).toBe(Math.floor(NOW.getTime() / 1000) + 2 * 86400);
  });

  it("429 when the IP is over its limit, without touching the daily total or sending", async () => {
    dbMock.on(UpdateItemCommand).rejectsOnce(conditionalFail());
    const res = await handle(event(VALID), deps());
    expect(res.statusCode).toBe(429);
    expect(res.headers).toEqual({ "content-type": "application/json" });
    expect(dbMock.commandCalls(UpdateItemCommand)).toHaveLength(1);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });

  it("429 when the site-wide daily total is used up", async () => {
    dbMock.on(UpdateItemCommand).resolvesOnce({}).rejectsOnce(conditionalFail());
    const res = await handle(event(VALID), deps());
    expect(res.statusCode).toBe(429);
    expect(dbMock.commandCalls(UpdateItemCommand)).toHaveLength(2);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });

  it("recognizes a ConditionalCheckFailed error by name too (different SDK copy)", async () => {
    dbMock.on(UpdateItemCommand).rejectsOnce(Object.assign(new Error("x"), { name: "ConditionalCheckFailedException" }));
    expect((await handle(event(VALID), deps())).statusCode).toBe(429);
  });

  it("uses limits from env", async () => {
    const d = deps();
    d.env.PER_IP_DAILY_LIMIT = "7";
    d.env.TOTAL_DAILY_LIMIT = "9";
    await handle(event(VALID), d);
    const limits = dbMock.commandCalls(UpdateItemCommand).map((c) => c.args[0].input.ExpressionAttributeValues?.[":limit"]?.N);
    expect(limits).toEqual(["7", "9"]);
  });
});

describe("server errors", () => {
  it("a DynamoDB failure is logged and returns a generic 500", async () => {
    dbMock.on(UpdateItemCommand).rejects(new Error("throttled: secret internals"));
    const res = await handle(event(VALID), deps());
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain("secret internals");
    expect(console.error).toHaveBeenCalled();
  });

  it("an SES failure is logged and returns a generic 500", async () => {
    sesMock.on(SendEmailCommand).rejects(new Error("MessageRejected: Email address is not verified"));
    const res = await handle(event(VALID), deps());
    expect(res.statusCode).toBe(500);
    expect(res.headers).toEqual({ "content-type": "application/json" });
    expect(res.body).not.toContain("verified");
    expect(console.error).toHaveBeenCalled();
  });

  it("missing configuration is a 500, not a send", async () => {
    const d = deps();
    delete d.env.TABLE_NAME;
    expect((await handle(event(VALID), d)).statusCode).toBe(500);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });
});
