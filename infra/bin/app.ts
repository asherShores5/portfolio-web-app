import { App } from "aws-cdk-lib";
import { buildApp } from "../lib/app";
import { readContactConfig } from "../lib/config";

// No account ID in this repo: `-c account=...` or CDK_DEFAULT_ACCOUNT (set by the CDK CLI from your
// credentials). Without either, the stacks synth env-agnostic, which is enough for CI's `cdk synth`.
// Zone ID/name default to ashershores.com's (see lib/config.ts and docs/first-deploy.md).
const app = new App();
const ctx = (k: string) => app.node.tryGetContext(k);
const region = ctx("region") ?? "us-west-1"; // pinned: the dev desktop sets AWS_REGION=us-west-2 globally

buildApp(app, {
  account: (ctx("account") ?? process.env.CDK_DEFAULT_ACCOUNT) || undefined,
  region,
  config: readContactConfig(ctx, process.env),
  // GitHub Actions sets GITHUB_REPOSITORY_ID; locally pass `-c githubRepoId=...` (docs/first-deploy.md).
  githubRepoId: (ctx("githubRepoId") ?? process.env.GITHUB_REPOSITORY_ID) || undefined,
});
