import { readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { DEPLOY_BRANCH, DEPLOY_ENVIRONMENT, DEPLOY_ROLE_NAME } from "../lib/ci";

const dir = path.join(__dirname, "..", "..", ".github", "workflows");
const ci = readFileSync(path.join(dir, "ci.yml"), "utf8");
const deploy = readFileSync(path.join(dir, "deploy-backend.yml"), "utf8");
const all = [ci, deploy];

describe("deploy workflow", () => {
  it("runs on pushes to main only, when infra changes", () => {
    expect(deploy).toMatch(new RegExp(`on:\\n  push:\\n    branches: \\[${DEPLOY_BRANCH}\\]\\n    paths:`));
    expect(deploy).not.toContain("pull_request");
    expect(deploy).toContain('"infra/**"');
  });

  it("deploys in the approval-gated environment, as the role PortfolioCi creates, after tests", () => {
    expect(deploy).toContain(`    environment: ${DEPLOY_ENVIRONMENT}\n`);
    expect(deploy).toContain(`role/${DEPLOY_ROLE_NAME}`);
    expect(deploy).toContain("needs: infra-test");
    expect(deploy).toContain("cdk deploy PortfolioContact --require-approval never");
  });

  it("grants id-token: write only inside the deploy job", () => {
    expect(deploy.match(/id-token: write/g)).toHaveLength(1);
    expect(deploy.indexOf("id-token: write")).toBeGreaterThan(deploy.indexOf("  deploy:"));
    expect(ci).not.toContain("id-token");
  });
});

describe("all workflows", () => {
  it("default to read-only contents permission", () => {
    for (const w of all) expect(w).toMatch(/^permissions:\n  contents: read$/m);
  });

  it("pin every action to a full commit SHA", () => {
    for (const w of all) {
      const uses = [...w.matchAll(/uses: (\S+)/g)].map((m) => m[1]);
      expect(uses.length).toBeGreaterThan(0);
      for (const u of uses) expect(u).toMatch(/@[0-9a-f]{40}$/);
    }
  });

  it("never persist the checkout token", () => {
    for (const w of all) {
      const checkouts = w.match(/uses: actions\/checkout@/g)!.length;
      expect(w.match(/persist-credentials: false/g)).toHaveLength(checkouts);
    }
  });

  it("CI has the two jobs branch protection requires", () => {
    expect(ci).toMatch(/^  test:$/m);
    expect(ci).toMatch(/^  infra-test:$/m);
  });
});
