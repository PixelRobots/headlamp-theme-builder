# Headlamp Theme Builder Plugin

<img src="../public/headlamp-theme-builder.png" alt="Headlamp Theme Builder logo" width="140">

[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/headlamp-theme-builder)](https://artifacthub.io/packages/search?repo=headlamp-theme-builder)

Build, preview, apply, and export Headlamp themes from inside Headlamp.

The plugin embeds the Headlamp Theme Builder as a Headlamp route. It can:

- Preview theme changes in a Headlamp-like UI.
- Apply the current builder theme to the current Headlamp session.
- Download a compiled theme plugin zip.
- Export and import theme JSON for sharing or later editing.

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

If the plugin is visible on Artifact Hub but not in Headlamp's Plugin Catalog,
turn off the catalog's **Only official plugins** filter. Headlamp's catalog can
hide community plugins by default unless they are official or allow-listed.

## Install in-cluster with Helm

When Headlamp is deployed in Kubernetes, use the Headlamp plugin manager sidecar
and point it at the Artifact Hub package URL:

```yaml
config:
  watchPlugins: true

pluginsManager:
  enabled: true
  configContent: |
    plugins:
      - name: headlamp-theme-builder
        source: https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
        version: 1.0.0
    installOptions:
      parallel: true
      maxConcurrent: 2
```

Apply it with your Headlamp Helm values:

```bash
helm upgrade --install my-headlamp headlamp/headlamp \
  --namespace kube-system \
  -f values.yaml
```

If you keep plugin configuration in a separate file, create `plugin.yml`:

```yaml
plugins:
  - name: headlamp-theme-builder
    source: https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
    version: 1.0.0

installOptions:
  parallel: true
  maxConcurrent: 2
```

Then install or upgrade Headlamp with:

```bash
helm upgrade --install my-headlamp headlamp/headlamp \
  --namespace kube-system \
  -f values.yaml \
  --set pluginsManager.configContent="$(cat plugin.yml)"
```

## Install with the Headlamp plugin CLI

You can install directly from Artifact Hub with the Headlamp plugin tooling:

```bash
npx @kinvolk/headlamp-plugin install \
  https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
```

Use this route for local testing or environments where you manage the Headlamp
plugin folder yourself.

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

The v1.0.0 release tarball is `headlamp-theme-builder-1.0.0.tar.gz`.

Logo and project author: [Pixelrobots](https://pixelrobots.co.uk).
