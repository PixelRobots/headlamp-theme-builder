# Headlamp Theme Library

This catalog is generated from curated bundled themes in `src/library/themes` and community/public themes in `library/themes`.

Use the website or Headlamp plugin Library tab to load the public library directly, or import a theme JSON URL manually.

## Contributing Themes

Add community themes to `library/themes/<theme-id>.json`. Keep bundled starter themes in `src/library/themes` unless the theme should ship inside the website and plugin by default.

Requirements:

- Use a unique, lowercase, dash-separated `id`.
- Match the filename to the id, for example `my-theme.json`.
- Include `name`, `description`, `tags`, and at least one theme in `themes`.
- Use `base: "light"` or `base: "dark"`.
- Check readability before opening a PR.

Run this before opening a PR:

```bash
npm run check:library
npm run build
```

## Themes

| Preview | Theme | Description | Source | Modes | Tags |
| --- | --- | --- | --- | --- | --- |
| ![AKS Inspired preview](../public/library/previews/aks-inspired-light.svg) | [AKS Inspired](../src/library/themes/aks-inspired.json) | Azure Kubernetes Service inspired purples with clear operational contrast. | bundled | light, dark | light, dark, cloud, kubernetes |
| ![Dracula preview](../public/library/previews/dracula-dark.svg) | [Dracula](../src/library/themes/dracula.json) | Dark purple developer palette with bright pink, cyan, green, and yellow accents. | bundled | dark | dark, developer, terminal |
| ![EKS Inspired preview](../public/library/previews/eks-inspired-light.svg) | [EKS Inspired](../src/library/themes/eks-inspired.json) | Amazon EKS inspired slate and orange palette for cloud operations. | bundled | light, dark | light, dark, cloud, kubernetes |
| ![GitHub preview](../public/library/previews/github-light.svg) | [GitHub](../src/library/themes/github.json) | Familiar GitHub-style neutrals with strong blue actions and readable surfaces. | bundled | light, dark | light, dark, developer |
| ![GKE Inspired preview](../public/library/previews/gke-inspired-light.svg) | [GKE Inspired](../src/library/themes/gke-inspired.json) | Google Kubernetes Engine inspired blue with restrained Google color accents. | bundled | light, dark | light, dark, cloud, kubernetes |
| ![Monokai preview](../public/library/previews/monokai-dark.svg) | [Monokai](../src/library/themes/monokai.json) | High-energy dark editor palette with lime, pink, orange, and violet accents. | bundled | dark | dark, developer, terminal |
| ![Nord preview](../public/library/previews/nord-dark.svg) | [Nord](../src/library/themes/nord.json) | Cool arctic blues with soft contrast and calm terminal colors. | bundled | dark | dark, developer, terminal |
| ![One Dark Pro preview](../public/library/previews/one-dark-pro-dark.svg) | [One Dark Pro](../src/library/themes/one-dark-pro.json) | VS Code-style dark palette with blue actions, green success, and warm editor accents. | bundled | dark | dark, developer, terminal |
| ![Pixelrobots preview](../public/library/previews/pixelrobots-light.svg) | [Pixelrobots](../src/library/themes/pixelrobots.json) | Pixel Robots black and yellow palette using the site accent, #ffea00. | bundled | light, dark | light, dark, brand, terminal |
| ![Solarized preview](../public/library/previews/solarized-light.svg) | [Solarized](../src/library/themes/solarized.json) | Classic low-glare palette with balanced light and dark variants. | bundled | light, dark | light, dark, developer |
