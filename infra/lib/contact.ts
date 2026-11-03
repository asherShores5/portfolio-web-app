import * as path from "node:path";
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
  aws_budgets as budgets,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as nodejs,
  aws_logs as logs,
  aws_route53 as route53,
  aws_ses as ses,
} from "aws-cdk-lib";
import type { Construct } from "constructs";
import { APP_TAG, BUDGET_EMAIL, type ContactConfig, SITE_ORIGINS } from "./config";

export const DMARC_VALUE = "v=DMARC1; p=reject; adkim=s; aspf=r";

interface ContactStackProps extends StackProps {
  config: ContactConfig;
}

/**
 * The contact form backend: a public Function URL (anonymous site visitors are the audience, so no
 * auth; CORS limits browsers to the site's origins), DynamoDB rate-limit counters, and SES sending
 * from the ashershores.com domain identity (Easy DKIM + DMARC in Route 53).
 */
export class ContactStack extends Stack {
  readonly functionUrl: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, props: ContactStackProps) {
    super(scope, id, props);
    const { config } = props;

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.zoneName,
    });

    // ---- SES: domain identity with Easy DKIM CNAMEs published to the zone ----
    const identity = new ses.EmailIdentity(this, "DomainIdentity", {
      identity: ses.Identity.publicHostedZone(zone),
      dkimSigning: true,
    });
    // Nothing else sends mail as ashershores.com, so anything failing DKIM alignment is rejected.
    new route53.TxtRecord(this, "Dmarc", {
      zone,
      recordName: `_dmarc.${config.zoneName}`,
      values: [DMARC_VALUE],
      ttl: Duration.hours(1),
    });

    // ---- rate-limit counters ----
    const table = new dynamodb.Table(this, "RateLimits", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expiresAt",
      removalPolicy: RemovalPolicy.DESTROY, // short-lived counters only
    });

    // ---- the function ----
    const logGroup = new logs.LogGroup(this, "ContactLogs", {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const fn = new nodejs.NodejsFunction(this, "ContactFn", {
      entry: path.join(__dirname, "..", "lambda", "contact", "index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(10),
      reservedConcurrentExecutions: 2,
      logGroup,
      environment: {
        TABLE_NAME: table.tableName,
        SENDER_EMAIL: config.senderEmail,
        RECIPIENT_EMAIL: config.recipientEmail,
        PER_IP_DAILY_LIMIT: String(config.perIpDailyLimit),
        TOTAL_DAILY_LIMIT: String(config.totalDailyLimit),
      },
      bundling: { minify: true, sourceMap: false, target: "node22" }, // @aws-sdk/* comes from the runtime
    });

    // Least privilege: UpdateItem on this table only; SendEmail only through the two identities SES
    // checks (sender domain + sandbox-verified recipient), and only as the noreply sender.
    fn.addToRolePolicy(
      new iam.PolicyStatement({ actions: ["dynamodb:UpdateItem"], resources: [table.tableArn] }),
    );
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail"],
        resources: [
          this.formatArn({ service: "ses", resource: "identity", resourceName: config.mailDomain }),
          this.formatArn({ service: "ses", resource: "identity", resourceName: config.recipientEmail }),
        ],
        conditions: { StringEquals: { "ses:FromAddress": config.senderEmail } },
      }),
    );
    // Deploy order: the identity exists before the function can try to send.
    fn.node.addDependency(identity);

    this.functionUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: SITE_ORIGINS,
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ["content-type"],
        maxAge: Duration.hours(1),
      },
    });

    // ---- cost guardrail: everything here is tagged app=portfolio (bin/app.ts) ----
    new budgets.CfnBudget(this, "Budget", {
      budget: {
        budgetName: "portfolio-monthly",
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: { amount: 1, unit: "USD" },
        costFilters: { TagKeyValue: [`user:app$${APP_TAG}`] },
      },
      notificationsWithSubscribers: [
        {
          notification: { notificationType: "ACTUAL", comparisonOperator: "GREATER_THAN", threshold: 80 },
          subscribers: [{ subscriptionType: "EMAIL", address: BUDGET_EMAIL }],
        },
        {
          notification: { notificationType: "FORECASTED", comparisonOperator: "GREATER_THAN", threshold: 100 },
          subscribers: [{ subscriptionType: "EMAIL", address: BUDGET_EMAIL }],
        },
      ],
    });

    new CfnOutput(this, "FunctionUrl", { value: this.functionUrl.url });
    new CfnOutput(this, "TableName", { value: table.tableName });
  }
}
