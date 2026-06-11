# Contributing Public Themes

Public themes live in `library/themes`. They are not bundled into the plugin by default, but they are published to the public library so users can import them from the website or Headlamp plugin.

## Add a Theme

1. Create `library/themes/<theme-id>.json`.
2. Use a unique lowercase, dash-separated `id`.
3. Match the filename to the id, for example `my-theme.json`.
4. Include `name`, `description`, `tags`, and at least one theme in `themes`.
5. Use `base: "light"` or `base: "dark"` for each theme.
6. Run the checks before opening a PR:

```bash
npm run build:library
npm run check:library
npm run build
```

## What CI Checks

The theme library workflow validates that:

- theme IDs are unique,
- required library fields are present,
- community filenames match their theme IDs,
- contributed text, link, sidebar, terminal, and ANSI colours meet contrast thresholds,
- the generated public index is current,
- generated previews and `library/README.md` are current,
- the website still builds.

## Bundled vs Public

Use `src/library/themes` only for curated starter themes that should ship inside the website and plugin. Use `library/themes` for community/public themes that should be importable without increasing the plugin bundle.
