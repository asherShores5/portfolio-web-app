import { describe, expect, it } from "vitest";
import { counterUpdate, dayKey } from "../lambda/contact/rateLimit";
import { subjectFor, validate } from "../lambda/contact/validate";

// Words DynamoDB allows unaliased in these expressions: functions and keywords, not attribute names.
const EXPRESSION_KEYWORDS = new Set(["ADD", "SET", "OR", "AND", "attribute_not_exists"]);

/** Every identifier in an expression must be a #name or :value placeholder (or a keyword). */
function bareNames(expr: string): string[] {
  return (expr.match(/[#:]?[A-Za-z_][A-Za-z0-9_]*/g) ?? []).filter((t) => !/^[#:]/.test(t) && !EXPRESSION_KEYWORDS.has(t));
}

describe("DynamoDB expressions", () => {
  const input = counterUpdate("t", "day#2026-11-03", 50, new Date("2026-11-03T00:00:00Z")).input;

  it("alias every attribute name (count is a reserved word; mocks don't catch a bare one)", () => {
    expect(bareNames(input.UpdateExpression!)).toEqual([]);
    expect(bareNames(input.ConditionExpression!)).toEqual([]);
    expect(input.ExpressionAttributeNames).toEqual({ "#count": "count", "#expiresAt": "expiresAt" });
  });

  it("the bare-name check itself catches an unaliased name", () => {
    expect(bareNames("ADD count :one")).toEqual(["count"]);
  });

  it("every placeholder used is defined", () => {
    const text = `${input.UpdateExpression} ${input.ConditionExpression}`;
    for (const n of text.match(/#\w+/g)!) expect(input.ExpressionAttributeNames).toHaveProperty(n);
    for (const v of text.match(/:\w+/g)!) expect(input.ExpressionAttributeValues).toHaveProperty(v);
  });
});

describe("dayKey", () => {
  it("is the UTC date", () => {
    expect(dayKey(new Date("2026-11-03T23:59:59-08:00"))).toBe("2026-11-04");
  });
});

describe("subjectFor", () => {
  it("strips CR/LF and control characters and caps the length", () => {
    const s = subjectFor(`Ada\r\nBcc: x@example.com\t${"z".repeat(200)}`);
    expect(s).not.toMatch(/[\r\n\t]/);
    expect(s.startsWith("Portfolio contact: Ada Bcc: x@example.com ")).toBe(true);
    expect(s.length).toBeLessThanOrEqual("Portfolio contact: ".length + 80);
  });
});

describe("validate", () => {
  it("accepts unicode names and messages with newlines", () => {
    const r = validate({ name: "Zoë Ñúñez", email: "zoe+test@sub.example.co.uk", message: "line 1\nline 2" });
    expect(r.kind).toBe("ok");
  });

  it("treats a non-string honeypot value as filled", () => {
    expect(validate({ name: "a", email: "a@b.co", message: "m", website: 1 }).kind).toBe("honeypot");
  });

  it.each(["a@b", "@b.com", "a@.com", "a@b.c", "<a@b.com>", "a@b.com\u0000"])("rejects email %j", (email) => {
    expect(validate({ name: "a", email, message: "m" }).kind).toBe("invalid");
  });
});
