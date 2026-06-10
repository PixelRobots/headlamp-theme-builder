# Headlamp Theme Builder Plugin

<img src="../public/headlamp-theme-builder.png" alt="Headlamp Theme Builder logo" width="140">

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/headlamp-theme-builder)](https://artifacthub.io/packages/search?repo=headlamp-theme-builder)

This plugin embeds the Headlamp Theme Builder inside Headlamp.

It lives in this repository as a nested Headlamp plugin package. It does not require changes to
the Headlamp application source.

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

The plugin can:

- Preview theme changes in a Headlamp-like UI.
- Download a compiled theme plugin zip.
- Apply the current builder theme to this Headlamp session by saving the generated theme in browser storage, registering it, setting Headlamp's theme preference, and reloading.

## Release

```bash
cd headlamp-plugin
npm run build
npm run package
```

The v1.0.0 release tarball is `headlamp-theme-builder-1.0.0.tar.gz`.

Logo and project author: [Pixelrobots](https://pixelrobots.co.uk).
