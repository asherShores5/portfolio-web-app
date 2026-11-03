import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../lib/app";
import { readContactConfig } from "../lib/config";
import { CiStack, DEPLOY_ROLE_NAME } from "../lib/ci";
import { DMARC_VALUE } from "../lib/contact";

const ACCOUNT = "111111111111";
const config = readContactConfig(() => undefined, {});

// One synth for the file: bundling the Lambda with esbuild is the slow part.
let contact: Template;
let ci: Template;
beforeAll(() => {
  const built = buildApp(new App(), { account: ACCOUNT, region: "us-west-1", config });
  contact = Template.fromStack(built.contact);
  ci = Template.fromStack(built.ci);
}, 120_000);

type Statement = { Action: string | string[]; Resource: unknown; Condition?: unknown; Effect: string };
function statements(t: Template): Statement[] {
  return Object.values(t.findResources("AWS::IAM::Policy")).flatMap(
    (p) => (p as { Properties: { PolicyDocument: { Statement: Statement[] } } }).Properties.PolicyDocument.Statement,
  );
}
const actionsOf = (s: Statement) => (Array.isArray(s.Action) ? s.Action : [s.Action]);

describe("config defaults", () => {
  it("are ashershores.com's zone and the noreply sender", () => {
    expect(config).toMatchObject({
      hostedZoneId: "Z03837921G383RCR4HG5",
      zoneName: "ashershores.com",
      senderEmail: "noreply@ashershores.com",
      recipientEmail: "asher.shores5@gmail.com",
      perIpDailyLimit: 3,
      totalDailyLimit: 50,
    });
  });

  it("rejects a non-numeric limit", () => {
    expect(() => readContactConfig((k) => (k === "perIpDailyLimit" ? "lots" : undefined), {})).toThrow(/positive integer/);
  });
});

describe("Function URL", () => {
  it("is public (anonymous visitors) with CORS POST-only from the site origins", () => {
    contact.hasResourceProperties("AWS::Lambda::Url", {
      AuthType: "NONE",
      Cors: {
        AllowOrigins: ["https://www.ashershores.com", "https://ashershores.com"],
        AllowMethods: ["POST"],
        AllowHeaders: ["content-type"],
      },
    });
    const urls = contact.findResources("AWS::Lambda::Url");
    const cors = (Object.values(urls)[0] as { Properties: { Cors: { AllowOrigins: string[]; AllowCredentials?: boolean } } }).Properties.Cors;
    expect(cors.AllowOrigins).not.toContain("*");
    expect(cors.AllowCredentials).toBeFalsy();
  });

  it("is exported as a stack output", () => {
    contact.hasOutput("FunctionUrl", {});
  });
});

describe("Lambda", () => {
  it("runs Node 22, 10s timeout, reserved concurrency 2, and gets its config from env", () => {
    contact.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs22.x",
      Timeout: 10,
      ReservedConcurrentExecutions: 2,
      Environment: {
        Variables: Match.objectLike({
          SENDER_EMAIL: "noreply@ashershores.com",
          RECIPIENT_EMAIL: "asher.shores5@gmail.com",
          PER_IP_DAILY_LIMIT: "3",
          TOTAL_DAILY_LIMIT: "50",
        }),
      },
      LoggingConfig: { LogGroup: Match.anyValue() },
    });
  });

  it("logs to a group with 30-day retention", () => {
    contact.hasResourceProperties("AWS::Logs::LogGroup", { RetentionInDays: 30 });
  });
});

describe("IAM", () => {
  it("SES SendEmail is limited to the domain and recipient identities, as noreply, never '*'", () => {
    const ses = statements(contact).filter((s) => actionsOf(s).some((a) => a.startsWith("ses:")));
    expect(ses).toHaveLength(1);
    expect(actionsOf(ses[0])).toEqual(["ses:SendEmail"]);
    expect(ses[0].Condition).toEqual({ StringEquals: { "ses:FromAddress": "noreply@ashershores.com" } });
    const resources = JSON.stringify(ses[0].Resource);
    expect(resources).toContain(`:${ACCOUNT}:identity/ashershores.com`);
    expect(resources).toContain(`:${ACCOUNT}:identity/asher.shores5@gmail.com`);
    expect(Array.isArray(ses[0].Resource) && (ses[0].Resource as unknown[]).length).toBe(2);
    expect(resources).not.toContain('"*"');
  });

  it("no statement in the contact stack grants a '*' resource", () => {
    for (const s of statements(contact)) expect(JSON.stringify(s.Resource)).not.toBe('"*"');
  });

  it("DynamoDB access is UpdateItem on the table only", () => {
    const dynamo = statements(contact).filter((s) => actionsOf(s).some((a) => a.startsWith("dynamodb:")));
    expect(dynamo.flatMap(actionsOf)).toEqual(["dynamodb:UpdateItem"]);
  });
});

describe("rate-limit table", () => {
  it("is on-demand, keyed by pk, with TTL on expiresAt", () => {
    contact.hasResourceProperties("AWS::DynamoDB::Table", {
      BillingMode: "PAY_PER_REQUEST",
      KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
      TimeToLiveSpecification: { AttributeName: "expiresAt", Enabled: true },
    });
  });
});

describe("mail DNS", () => {
  it("SES domain identity with Easy DKIM, and its three CNAMEs in the zone", () => {
    contact.hasResourceProperties("AWS::SES::EmailIdentity", {
      EmailIdentity: "ashershores.com",
      DkimAttributes: { SigningEnabled: true },
    });
    contact.resourceCountIs("AWS::Route53::RecordSet", 4); // 3 DKIM CNAMEs + DMARC
    contact.hasResourceProperties("AWS::Route53::RecordSet", { Type: "CNAME", HostedZoneId: "Z03837921G383RCR4HG5" });
  });

  it("publishes a strict DMARC record", () => {
    contact.hasResourceProperties("AWS::Route53::RecordSet", {
      Name: "_dmarc.ashershores.com.",
      Type: "TXT",
      HostedZoneId: "Z03837921G383RCR4HG5",
      ResourceRecords: [`"${DMARC_VALUE}"`],
    });
    expect(DMARC_VALUE).toBe("v=DMARC1; p=reject; adkim=s; aspf=r");
  });
});

describe("tags and budget", () => {
  it("tags resources app=portfolio", () => {
    contact.hasResourceProperties("AWS::DynamoDB::Table", { Tags: Match.arrayWith([{ Key: "app", Value: "portfolio" }]) });
    contact.hasResourceProperties("AWS::Lambda::Function", { Tags: Match.arrayWith([{ Key: "app", Value: "portfolio" }]) });
    ci.hasResourceProperties("AWS::IAM::Role", { Tags: Match.arrayWith([{ Key: "app", Value: "portfolio" }]) });
  });

  it("has a $1/month budget filtered on the app tag", () => {
    contact.hasResourceProperties("AWS::Budgets::Budget", {
      Budget: Match.objectLike({
        BudgetName: "portfolio-monthly",
        BudgetLimit: { Amount: 1, Unit: "USD" },
        CostFilters: { TagKeyValue: ["user:app$portfolio"] },
      }),
      NotificationsWithSubscribers: Match.arrayWith([
        Match.objectLike({ Subscribers: [{ SubscriptionType: "EMAIL", Address: "asher.shores5@gmail.com" }] }),
      ]),
    });
  });
});

describe("CI deploy role", () => {
  it("trusts only this repo's production environment, via the existing OIDC provider", () => {
    ci.resourceCountIs("Custom::AWSCDKOpenIdConnectProvider", 0);
    ci.resourceCountIs("AWS::IAM::OIDCProvider", 0);
    ci.hasResourceProperties("AWS::IAM::Role", {
      RoleName: DEPLOY_ROLE_NAME,
      AssumeRolePolicyDocument: {
        Statement: [
          Match.objectLike({
            Action: "sts:AssumeRoleWithWebIdentity",
            Principal: { Federated: `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com` },
            Condition: {
              StringEquals: {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                "token.actions.githubusercontent.com:sub": ["repo:asherShores5/portfolio-web-app:environment:production"],
              },
            },
          }),
        ],
      },
    });
  });

  it("adds the ID-form subject when the repo ID is known, still environment-only", () => {
    const t = Template.fromStack(new CiStack(new App(), "Ci", { env: { account: ACCOUNT, region: "us-west-1" }, githubRepoId: "123" }));
    const role = Object.values(t.findResources("AWS::IAM::Role"))[0] as {
      Properties: { AssumeRolePolicyDocument: { Statement: { Condition: { StringEquals: Record<string, string[]> } }[] } };
    };
    const subs = role.Properties.AssumeRolePolicyDocument.Statement[0].Condition.StringEquals["token.actions.githubusercontent.com:sub"];
    expect(subs).toEqual([
      "repo:asherShores5/portfolio-web-app:environment:production",
      "repo:asherShores5@71547146/portfolio-web-app@123:environment:production",
    ]);
    for (const s of subs) expect(s.endsWith(":environment:production")).toBe(true);
  });

  it("rejects a non-numeric repo ID", () => {
    expect(() => new CiStack(new App(), "Ci", { githubRepoId: "abc" })).toThrow(/numeric/);
  });

  it("can only assume the CDK bootstrap roles", () => {
    const s = statements(ci);
    expect(s).toHaveLength(1);
    expect(s[0].Action).toBe("sts:AssumeRole");
    expect(s[0].Resource).toBe(`arn:aws:iam::${ACCOUNT}:role/cdk-hnb659fds-*`);
  });
});
