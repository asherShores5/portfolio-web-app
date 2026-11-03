// Pure validation of the contact form body. No AWS calls here, so it is easy to test.

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type ValidationResult =
  | { kind: "ok"; value: ContactMessage }
  | { kind: "honeypot" }
  | { kind: "invalid"; message: string };

export const LIMITS = { name: 100, email: 254, message: 5000 } as const;

// One @, no spaces or control characters, a dot in the domain. Deliberately simple: SES and the
// visitor's own mail server are the real check. CR/LF are rejected separately (header injection).
const EMAIL_RE = /^[^\s@<>()",;:\\[\]]+@[^\s@<>()",;:\\[\]]+\.[^\s@<>()",;:\\[\]]{2,}$/;
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

/** Parses the raw Function URL body (string, maybe base64). Returns undefined if it isn't a JSON object. */
export function parseBody(body: string | undefined, isBase64Encoded: boolean | undefined): unknown {
  if (body === undefined || body === "") return undefined;
  try {
    const text = isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
    const parsed: unknown = JSON.parse(text);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function validate(input: unknown): ValidationResult {
  if (input === undefined || input === null || typeof input !== "object") {
    return { kind: "invalid", message: "Request body must be a JSON object" };
  }
  const data = input as Record<string, unknown>;

  // Honeypot: a hidden field people never see. Anything in it means a bot; drop it silently.
  const website = data.website;
  if (website !== undefined && website !== null && website !== "") return { kind: "honeypot" };

  const { name, email, message } = data;
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return { kind: "invalid", message: "Name, email and message are required" };
  }
  const n = name.trim();
  const e = email.trim();
  const m = message.trim();

  if (n.length < 1 || n.length > LIMITS.name) return { kind: "invalid", message: `Name must be 1-${LIMITS.name} characters` };
  if (CONTROL_RE.test(n)) return { kind: "invalid", message: "Name contains invalid characters" };
  if (e.length > LIMITS.email || CONTROL_RE.test(e) || !EMAIL_RE.test(e)) {
    return { kind: "invalid", message: "Email address is not valid" };
  }
  if (m.length < 1 || m.length > LIMITS.message) {
    return { kind: "invalid", message: `Message must be 1-${LIMITS.message} characters` };
  }
  return { kind: "ok", value: { name: n, email: e, message: m } };
}

/** Subject line: CR/LF and other control characters removed, then cut to a safe length. */
export function subjectFor(name: string): string {
  const clean = name.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return `Portfolio contact: ${clean}`;
}
