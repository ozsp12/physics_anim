# Publishing

The repository is configured for deployment to:

```text
https://ozsp12.github.io/physics_anim/
```

The static site itself is the directory `rollercoster_loop/`. The GitHub Actions workflow uploads that directory as the Pages artifact, so the live site opens the simulation directly rather than showing the repository documentation.

## Automated publication

The scripts require Git and GitHub CLI with an authenticated session:

```bash
gh auth login
```

### Windows PowerShell

From the extracted repository directory:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\publish_repository.ps1
```

### Linux or macOS

```bash
./publish_repository.sh
```

The scripts perform the following operations:

1. initialize the local `main` branch when necessary;
2. commit the complete repository structure;
3. create the public repository `ozsp12/physics_anim` when it does not exist;
4. push the `main` branch;
5. configure GitHub Pages to use a custom workflow;
6. dispatch `.github/workflows/pages.yml`.

## Manual fallback

Create a public repository named `physics_anim`, upload the project contents to its `main` branch, and select **GitHub Actions** under **Settings → Pages → Build and deployment**. Run the workflow named **Deploy interactive simulation to GitHub Pages** if the initial push did not trigger it.
