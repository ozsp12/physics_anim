# Publishing

The repository is published at:

```text
https://ozsp12.github.io/physics_anim/
```

GitHub Pages uses the `main` branch and repository root (`/`) as the single publication source. Individual simulations therefore retain stable paths, currently:

```text
https://ozsp12.github.io/physics_anim/rollercoster_loop/
```

The workflow `.github/workflows/pages.yml` performs validation only; it does not deploy GitHub Pages.

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
