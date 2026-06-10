# Headlamp Theme Builder Plugin

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
