# Headlamp Theme Builder Deployment Guide

This guide covers installing, upgrading, verifying, and removing the Headlamp Theme Builder plugin.

## Install from Headlamp Desktop

1. Open Headlamp Desktop.
2. Go to **Plugin Catalog**.
3. Search for **Headlamp Theme Builder**.
4. Open the plugin details page and click **Install**.
5. Restart Headlamp if prompted.
6. Open **Theme Builder** from the sidebar.

Artifact Hub package URL:

```text
https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
```

## Install in-cluster with Helm

When Headlamp is deployed in Kubernetes, use the Headlamp plugin manager sidecar and point it at the Artifact Hub package URL.

Add this to your Headlamp Helm values:

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

## Install with the Headlamp Plugin CLI

You can install directly from Artifact Hub with the Headlamp plugin tooling:

```bash
npx @kinvolk/headlamp-plugin install \
  https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
```

Use this route for local testing or environments where you manage the Headlamp plugin folder yourself.

## Verify the Plugin Loaded

After installing or upgrading:

1. Restart Headlamp.
2. Open **Settings** > **Plugins**.
3. Confirm **Headlamp Theme Builder** is listed as installed.
4. Confirm **Theme Builder** appears in the sidebar.

If the plugin is installed but the sidebar item does not appear, restart Headlamp again and check the plugin logs for load errors.

## Upgrade

For Headlamp Desktop, upgrade from the Plugin Catalog when a new version is available.

For Helm/plugin manager installs, update the pinned version in your plugin manager config:

```yaml
plugins:
  - name: headlamp-theme-builder
    source: https://artifacthub.io/packages/headlamp/headlamp-theme-builder/headlamp-theme-builder
    version: 1.0.0
```

Then run your normal `helm upgrade` command.

## Remove

For Headlamp Desktop, uninstall the plugin from **Settings** > **Plugins**.

For Helm/plugin manager installs, remove `headlamp-theme-builder` from the plugin manager config and run `helm upgrade`.

## Troubleshooting

### Plugin is on Artifact Hub but not in the Headlamp catalog

Headlamp can filter catalog results. Check the Plugin Catalog filters and make sure community or unverified plugins are not hidden.

Artifact Hub and Headlamp may also cache package metadata, so new releases can take time to appear.

### Plugin is installed but Theme Builder is missing from the sidebar

Restart Headlamp. If it still does not appear, check whether the installed plugin bundle failed to load.

Common causes are:

- The installed package is an older cached build.
- Headlamp needs a restart after install or upgrade.
- The plugin bundle failed during startup.

### README image is missing in the catalog

The plugin README uses absolute image URLs so the catalog can render images outside the Git repository layout. If the image is still missing, wait for the catalog cache to refresh.
