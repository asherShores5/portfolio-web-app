import { type App, Tags } from "aws-cdk-lib";
import { CiStack } from "./ci";
import { APP_TAG, type ContactConfig } from "./config";
import { ContactStack } from "./contact";

export interface AppOptions {
  /** Undefined -> env-agnostic synth (CI tests without credentials). */
  account?: string;
  region: string;
  config: ContactConfig;
  githubRepoId?: string;
}

export interface BuiltApp {
  contact: ContactStack;
  ci: CiStack;
}

export function buildApp(scope: App, opts: AppOptions): BuiltApp {
  Tags.of(scope).add("app", APP_TAG);
  const env = { account: opts.account, region: opts.region };
  const contact = new ContactStack(scope, "PortfolioContact", { env, config: opts.config });
  const ci = new CiStack(scope, "PortfolioCi", { env, githubRepoId: opts.githubRepoId });
  return { contact, ci };
}
