# Hello World Web App

A tiny static web application with a complete GitHub promotion flow.

## Environments

- Dev is the first deployment environment.
- UAT runs only after Dev succeeds.
- Prod runs only after UAT succeeds.
- GitHub Environment approvals can pause promotion before UAT and Prod.

With GitHub Pages enabled, the online URLs will look like this:

```text
https://<github-user-or-org>.github.io/<repo-name>/dev/
https://<github-user-or-org>.github.io/<repo-name>/uat/
https://<github-user-or-org>.github.io/<repo-name>/prod/
```

## Local Run

Open `index.html` in a browser. No dependency install is required.

## GitHub Setup

1. Create an empty GitHub repository.
2. Push this project to it.
3. In GitHub, open **Settings > Pages**.
4. Choose branch `gh-pages` and folder `/root`.
5. In **Settings > Environments**, create:
   - `dev`
   - `uat`
   - `prod`
6. Add required reviewers to `uat` and `prod` if you want manual approval gates.

## Promotion Flow

```text
feature/* -> pull request -> main
main -> Promote workflow -> dev -> uat -> prod
```

## Deploy Like Harness

1. Open **Actions** in GitHub.
2. Select the **Promote** workflow.
3. Click **Run workflow**.
4. Choose the highest environment:
   - `dev` deploys only Dev.
   - `uat` deploys Dev, then UAT.
   - `prod` deploys Dev, then UAT, then Prod.
5. If `uat` or `prod` has required reviewers, GitHub pauses the workflow until it is approved.
