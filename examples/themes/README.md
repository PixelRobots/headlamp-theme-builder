# Theme JSON Examples

Headlamp Theme Builder can import theme JSON from a local file or a URL.

Supported shapes:

- `single-theme.json`: one theme object.
- `theme-library-entry.json`: a library card with one or more themes.
- Builder exports from **Save / Load**, which contain a `themes` array and optional `logoDataUrl`.

URL imports run in the browser, so the host must allow CORS. Raw GitHub URLs are a good option for shared themes.
