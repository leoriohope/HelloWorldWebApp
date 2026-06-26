# Hello World Web App

A tiny static web application with a complete GitHub delivery flow.

## Environments

- `develop` branch deploys to Dev.
- `release/*` branches deploy to UAT.
- `main` branch deploys to Prod.

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

## Branch Flow

```text
feature/* -> pull request -> develop -> dev
develop -> release/vX.Y.Z -> uat
release/vX.Y.Z -> main -> prod
```
