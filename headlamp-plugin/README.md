# Headlamp Theme Builder Plugin

<img src="https://raw.githubusercontent.com/PixelRobots/headlamp-theme-builder/main/public/headlamp-theme-builder.png" alt="Headlamp Theme Builder logo" width="140">

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/headlamp-theme-builder)](https://artifacthub.io/packages/search?repo=headlamp-theme-builder)

Build, preview, apply, and export Headlamp themes from inside Headlamp.

![Headlamp Theme Builder plugin](https://raw.githubusercontent.com/PixelRobots/headlamp-theme-builder/main/docs/screenshots/plugin-builder.png)

The plugin embeds the Headlamp Theme Builder as a Headlamp route. It can:

- Preview theme changes in a Headlamp-like UI.
- Apply the current builder theme to the current Headlamp session.
- Download a compiled theme plugin zip.
- Export and import theme JSON for sharing or later editing.

![Headlamp Theme Builder library](https://raw.githubusercontent.com/PixelRobots/headlamp-theme-builder/main/docs/screenshots/plugin-library.png)

Theme JSON can be imported from a file or URL. URL imports run in the browser, so the host must allow CORS. Raw GitHub URLs work well.

If an older downloaded theme plugin shows as incompatible in Headlamp, download it again from the current builder. Newer downloads include the compatibility metadata Headlamp expects.

Artifact Hub and the Headlamp Plugin Catalog can take time to refresh after a new release.

Planned improvements are tracked in the
[roadmap](https://github.com/PixelRobots/headlamp-theme-builder/blob/main/ROADMAP.md).

For maintainer release steps, see the
[release guide](https://github.com/PixelRobots/headlamp-theme-builder/blob/main/headlamp-plugin/DEPLOYMENT.md).

## Install from Headlamp Desktop

1. Open Headlamp Desktop.
2. Go to **Plugin Catalog**.
3. Search for **Headlamp Theme Builder**.
4. Open the plugin detail page and click **Install**.
5. Restart Headlamp if prompted.
6. Open **Theme Builder** from the sidebar.

Artifact Hub package URL:

```text
https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
```

## Development

```bash
cd headlamp-plugin
npm install
npm run start
```

## Build

```bash
cd headlamp-plugin
npm run build
```

## Release

```bash
cd headlamp-plugin
npm run build
npm run package
```

The v1.1.0 release tarball is `headlamp-theme-builder-1.1.0.tar.gz`.

Logo and project author: [Pixelrobots](https://pixelrobots.co.uk).
