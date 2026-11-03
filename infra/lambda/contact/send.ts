import { SendEmailCommand, type SESv2Client } from "@aws-sdk/client-sesv2";
import { type ContactMessage, subjectFor } from "./validate";

export interface MailConfig {
  from: string;
  to: string;
}

export function buildEmail(cfg: MailConfig, msg: ContactMessage): SendEmailCommand {
  return new SendEmailCommand({
    FromEmailAddress: cfg.from,
    Destination: { ToAddresses: [cfg.to] },
    // The visitor's address goes only in Reply-To (validated, no CR/LF), never in From.
    ReplyToAddresses: [msg.email],
    Content: {
      Simple: {
        Subject: { Data: subjectFor(msg.name), Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `Name: ${msg.name}\nEmail: ${msg.email}\n\n${msg.message}\n\n-- sent from the ashershores.com contact form`,
            Charset: "UTF-8",
          },
        },
      },
    },
  });
}

export async function sendContactEmail(ses: SESv2Client, cfg: MailConfig, msg: ContactMessage): Promise<void> {
  await ses.send(buildEmail(cfg, msg));
}
