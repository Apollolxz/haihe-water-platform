# GitHub Pages Deployment

This repository includes an automatic GitHub Pages deployment workflow.

## Files

- Build script: [scripts/build-github-pages.ps1](/D:/软件/知识图谱网站 - 副本 (27) - 副本/scripts/build-github-pages.ps1:1)
- Workflow: [.github/workflows/deploy-pages.yml](/D:/软件/知识图谱网站 - 副本 (27) - 副本/.github/workflows/deploy-pages.yml:1)
- Runtime config template: [site.config.js](/D:/软件/知识图谱网站 - 副本 (27) - 副本/haihe-water-platform/frontend/config/site.config.js:1)
- Generated publish directory: `docs/`

## How It Works

1. Push to `main`.
2. GitHub Actions runs `scripts/build-github-pages.ps1`.
3. The workflow uploads `docs/` as the Pages artifact.
4. GitHub Pages deploys the generated static site.

## One-Time GitHub Setting

In the repository `Settings -> Pages`, set the source to `GitHub Actions`.

## Backend Address

Before publishing with a real backend, edit `haihe-water-platform/frontend/config/site.config.js` and set:

```js
apiBaseUrl: 'https://your-backend.example.com'
```

If you want to regenerate the static publish directory locally, run:

```powershell
.\scripts\build-github-pages.ps1
```

## Notes

- `docs/index.html` redirects to `docs/pages/index.html`, so the existing multi-page structure stays intact.
- Local Flask usage is not replaced by this flow.
- If `apiBaseUrl` is left blank, the static site can still open on GitHub Pages, but API-driven features will remain unavailable until the backend is deployed.
