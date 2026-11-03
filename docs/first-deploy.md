# First deploy: contact backend (`infra/`)

A one-time, by-hand setup. After it, a push to `main` that changes `infra/` deploys the
`PortfolioContact` stack through GitHub Actions (after Asher approves the run). Amplify keeps
building and hosting the site from `main` as before.

Run everything from the dev desktop with admin credentials for the personal AWS account. The
account ID is never committed: CDK reads it from your credentials (`CDK_DEFAULT_ACCOUNT`).

What gets created (us-west-1, everything tagged `app=portfolio`):

- `PortfolioContact`: contact Lambda (Node 22) + public Function URL (CORS: POST from
  https://www.ashershores.com and https://ashershores.com only), rate-limit table (3 per IP per
  day, 50 total per day, TTL cleanup), SES domain identity `ashershores.com` with 3 DKIM CNAMEs,
  a `_dmarc` TXT record, log group (30 days), `portfolio-monthly` $1 budget.
- `PortfolioCi`: the `portfolio-github-deploy` role GitHub Actions assumes. It trusts only this
  repo's `production` GitHub Environment and can only assume the CDK bootstrap roles. It reuses
  the account's existing GitHub OIDC provider (created by Honey Do's CI stack).

## 0. Credentials and region

The dev desktop sets `AWS_REGION=us-west-2` globally, so pin it for this shell.

```sh
aws login --remote --region us-west-1 --profile personal   # if the session expired
export AWS_PROFILE=personal AWS_REGION=us-west-1 AWS_DEFAULT_REGION=us-west-1
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO_ID=$(gh api repos/asherShores5/portfolio-web-app --jq .id)
echo "$CDK_DEFAULT_ACCOUNT $REPO_ID"
cd infra && npm ci && npm test
```

## 1. Checks before deploying (read-only)

```sh
# CDK bootstrap: expect CREATE_COMPLETE or UPDATE_COMPLETE (version 32 as of 2026-11-03)
aws cloudformation describe-stacks --stack-name CDKToolkit \
  --query 'Stacks[0].[StackStatus,Outputs[?OutputKey==`BootstrapVersion`].OutputValue|[0]]' --output text
# Only if that fails: npx cdk bootstrap "aws://$CDK_DEFAULT_ACCOUNT/us-west-1"

# GitHub OIDC provider exists (imported, not created):
aws iam list-open-id-connect-providers   # expect .../oidc-provider/token.actions.githubusercontent.com

# No mail records yet (the stack adds _dmarc and 3 DKIM CNAMEs; expect no output):
aws route53 list-resource-record-sets --hosted-zone-id Z03837921G383RCR4HG5 \
  --query "ResourceRecordSets[?Type=='TXT' || Type=='MX' || Type=='SPF' || starts_with(Name, '_dmarc')]" --output text

# The recipient is verified in SES us-west-1 (the account is in the SES sandbox, which also
# requires the To address to be verified): expect asher.shores5@gmail.com ... SUCCESS
aws sesv2 list-email-identities --output text
```

## 2. Review the change sets, then deploy

Create each change set without running it, read it, then run exactly that change set.
For brand-new stacks every resource is an `Add`; look for anything unexpected (extra IAM,
`Replacement`, a `*` resource).

```sh
npx cdk deploy PortfolioCi PortfolioContact -c githubRepoId="$REPO_ID" \
  --no-execute --change-set-name first-deploy

for S in PortfolioCi PortfolioContact; do
  aws cloudformation describe-change-set --stack-name $S --change-set-name first-deploy \
    --query 'Changes[].ResourceChange.[Action,ResourceType,LogicalResourceId,Replacement]' --output table
done
```

Check: `PortfolioCi` has one `AWS::IAM::Role` (+ its policy) and no OIDC provider.
`PortfolioContact` has the Lambda, `AWS::Lambda::Url`, table, log group, `AWS::SES::EmailIdentity`,
4 `AWS::Route53::RecordSet`, the budget, and the role/policy. To see the trust and SES policies:
`npx cdk synth PortfolioCi -c githubRepoId="$REPO_ID"` and `npx cdk synth PortfolioContact`.

If it looks right, run the reviewed change sets:

```sh
for S in PortfolioCi PortfolioContact; do
  aws cloudformation execute-change-set --stack-name $S --change-set-name first-deploy
  aws cloudformation wait stack-create-complete --stack-name $S
done
aws cloudformation describe-stacks --stack-name PortfolioContact \
  --query "Stacks[0].Outputs[?OutputKey=='FunctionUrl'].OutputValue" --output text
```

If it looks wrong, don't execute; remove the half-made stacks (they sit in `REVIEW_IN_PROGRESS`
with no resources): `aws cloudformation delete-stack --stack-name <S>` for each.

Later infra changes: `npx cdk diff`, or the same `--no-execute` review, then let CI deploy.
Redeploy `PortfolioCi` by hand only (CI deploys `PortfolioContact` only, so it can't widen its
own trust); always pass `-c githubRepoId="$REPO_ID"` so the trust policy doesn't change.

## 3. GitHub settings

```sh
# Environment `production`, Asher as required reviewer, deploys only from main:
#   Settings > Environments > New environment "production"
#     Required reviewers: asherShores5   (leave "Prevent self-review" unticked: he pushes and approves)
#     Deployment branches and tags: Selected branches -> main
gh secret set AWS_ACCOUNT_ID --body "$CDK_DEFAULT_ACCOUNT"   # a secret so it's masked in public logs
```

Branch protection on `main` (Settings > Branches, or Rulesets): require a pull request, require
status checks `test` and `infra-test` (they appear after the first CI run on a PR), block force
pushes and deletion.

Note: `test` runs `npm ci && npm test && npm run build` in `portfolio/`, which expects the Vite
migration (`npm test` must exit, not watch). Until that lands, `test` fails on the current CRA app.

## 4. Wait for SES verification

DKIM CNAMEs usually verify within minutes (up to 72 hours). Expect `SUCCESS` and `true`:

```sh
aws sesv2 get-email-identity --email-identity ashershores.com \
  --query '{dkim:DkimAttributes.Status, sending:VerifiedForSendingStatus}'
dig +short TXT _dmarc.ashershores.com
```

Sending fails with a 500 (`MessageRejected` in the logs) until this is done.

## 5. Smoke test

```sh
URL=<FunctionUrl>
J='content-type: application/json'
O='Origin: https://www.ashershores.com'

# Valid -> 200 {"message":"Message sent"}; an email arrives from noreply@ashershores.com,
# Reply-To = the address below. Check Gmail "Show original": DKIM=PASS, DMARC=PASS.
curl -s -i -X POST "$URL" -H "$J" -H "$O" -d '{"name":"Smoke test","email":"asher.shores5@gmail.com","message":"hello 1"}'

# Invalid -> 400
curl -s -i -X POST "$URL" -H "$J" -H "$O" -d '{"name":"","email":"nope","message":""}'
curl -s -i -X POST "$URL" -H "$J" -H "$O" -d '{not json'

# Honeypot -> 200, but no email arrives
curl -s -i -X POST "$URL" -H "$J" -H "$O" -d '{"name":"Bot","email":"a@b.co","message":"x","website":"spam"}'

# Rate limit: two more valid ones (2 more emails), then the 4th from this IP today -> 429
for i in 2 3 4; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL" -H "$J" -H "$O" \
    -d "{\"name\":\"Smoke test\",\"email\":\"asher.shores5@gmail.com\",\"message\":\"hello $i\"}"
done   # expect 200 200 429

# Other origins: the preflight gets no Access-Control-Allow-Origin, so browsers block the call
# (curl itself is never blocked by CORS; the rate limits cover non-browser callers).
curl -s -i -X OPTIONS "$URL" -H 'Origin: https://evil.example' \
  -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type' | grep -i access-control || echo "no CORS headers: blocked"
curl -s -i -X OPTIONS "$URL" -H "$O" \
  -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type' | grep -i access-control-allow-origin
```

Logs: `aws logs tail /aws/lambda/<function name> --since 15m` (name from the stack's resources).
To re-test the rate limit the same day, delete today's `ip#...` item in the table (or wait for UTC
midnight).

## 6. Cutover (after the smoke test passes)

1. Site: set the new Function URL as the committed default in `portfolio/src/config.js`
   (`VITE_CONTACT_ENDPOINT` overrides it at build time).
2. CSP: in `customHttp.yml`, `connect-src` must list the new Function URL origin
   (`https://<id>.lambda-url.us-west-1.on.aws`) and drop the old one.
3. Merge to `main`; Amplify rebuilds. On https://www.ashershores.com send one message through
   the form and confirm it arrives. Check the browser console for CSP or CORS errors.

## 7. Retire the old hand-made function (only after Asher confirms a message arrived)

The old `send-portfolio-contact` (us-west-1, Function URL with CORS methods `*`, SES v1 from the
gmail address) stays until then. Back it up first, then delete:

```sh
B=${BACKUP_DIR:?set BACKUP_DIR to a folder outside the repo}/send-portfolio-contact-$(date +%F)
mkdir -p "$B"
aws lambda get-function --function-name send-portfolio-contact \
  --query 'Configuration.{Runtime:Runtime,Role:Role,Handler:Handler,Timeout:Timeout}' > "$B/config.json"
curl -s -o "$B/code.zip" "$(aws lambda get-function --function-name send-portfolio-contact --query Code.Location --output text)"
aws lambda get-function-url-config --function-name send-portfolio-contact > "$B/url-config.json"

# After Asher's go:
aws lambda delete-function --function-name send-portfolio-contact
```

Then delete its execution role and log group if nothing else uses them (check the role name in
`config.json` first).
