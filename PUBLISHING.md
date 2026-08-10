# Publishing

The repository is published at:

```text
https://ozsp12.github.io/physics_anim/
```

GitHub Pages uses the `main` branch and repository root (`/`) as the single publication source. The canonical vertical-loop route is:

```text
https://ozsp12.github.io/physics_anim/vertical-loop/
```

The historical route below is retained only for backward compatibility and redirects to the canonical application:

```text
https://ozsp12.github.io/physics_anim/rollercoster_loop/
```

The workflow `.github/workflows/pages.yml` performs analytical, numerical, independent Python, integration, and browser validation only; it does not deploy GitHub Pages. Publication remains exclusively branch-based from `main:/`.

## Automated repository setup

The helper scripts require Git and GitHub CLI with an authenticated session:

```bash
gh auth login
```

### Windows PowerShell

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\publish_repository.ps1
```

### Linux or macOS

```bash
./publish_repository.sh
```

The scripts create or update the repository, push `main`, and configure GitHub Pages to publish the root of `main`.

## Manual fallback

Under **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose branch **main**, and choose folder **/(root)**.

## Publication invariants

- `/vertical-loop/` is the canonical simulation URL.
- `/rollercoster_loop/` must remain a redirect and must not be removed without an explicit migration plan.
- CI validation and Pages deployment remain separate mechanisms.
- The Pages source remains `main:/` unless the deployment architecture is intentionally redesigned.
