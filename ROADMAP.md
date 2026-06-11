# Roadmap

This roadmap captures planned improvements for Headlamp Theme Builder. It is not a fixed release commitment; priorities may change as Headlamp plugin APIs and user feedback evolve.

## Near Term

### Theme JSON Schema

Publish a formal JSON schema for importable themes and library entries.

Goals:

- Validate single theme files. **Done:** schema and runtime validation added.
- Validate paired light/dark theme bundles. **Done:** each imported theme in a bundle is validated.
- Validate library entries used by `src/library/themes`. **Done:** library-entry schema added.
- Make it easier for users to catch missing or invalid fields before import.

### Theme Validation

Expand validation beyond the existing contrast badges.

Goals:

- Warn when required theme fields are missing. **Done:** missing required fields are hard errors.
- Warn when text/background contrast falls below WCAG AA. **Done:** builder summary shows contrast warnings.
- Warn when terminal foreground, cursor, or ANSI colours are hard to read. **Partially done:** terminal foreground and cursor checks are included.
- Surface validation results before download or apply. **Done:** builder summary is shown and hard errors block apply/download.

### Export Metadata

Let users customise generated plugin metadata before downloading.

Goals:

- Plugin name.
- Version.
- Description.
- Author/provider.
- Optional homepage/repository.

### GitHub-Friendly URL Imports

Make theme imports easier when users paste GitHub URLs.

Goals:

- Accept `github.com/.../blob/.../*.json` URLs.
- Convert GitHub file URLs to raw URLs automatically.
- Keep normal raw URL imports for other hosts.
- Show clear errors when CORS blocks a URL.

## Preview Improvements

### More Headlamp Surfaces

Add preview screens that cover more of the real Headlamp UI.

Candidates:

- Logs view.
- Exec terminal.
- Resource details.
- Tables with filters and actions.
- Forms.
- Dialogs and drawers.
- Error and warning states.

### Side-by-Side Light/Dark Editing

Offer an editor mode that shows light and dark variants together.

Goals:

- Compare both variants without switching the active base mode.
- Copy colours between variants.
- Highlight differences between variants.

## Theme Library

### Community Theme Contributions

Document how to add themes to the bundled library.

Goals:

- Add contribution rules for JSON files in `src/library/themes`.
- Require accessible contrast checks for contributed themes.
- Include preview screenshots or generated preview metadata where useful.

### More Built-In Themes

Add more ready-made themes.

Candidates:

- Accessibility/high-contrast themes.
- More cloud-inspired palettes.
- More editor-inspired palettes.
- Company/team brand starter themes.

## Sharing

### Shareable Theme Links

Allow users to share a theme without manually downloading and uploading JSON.

Possible approaches:

- URL encoded theme state.
- GitHub gist/raw URL workflow.
- Downloadable JSON bundle with import instructions.

### Public Theme Library

Host curated theme JSON files in the repository so users can import them by URL.

Goals:

- Stable raw URLs for each bundled theme.
- Index file listing available themes.
- Clear compatibility/version notes.

## Documentation

### Generated Theme Plugin Guide

Improve docs for downloaded compiled theme plugins.

Goals:

- Permanent install steps.
- Upgrade/removal steps.
- Compatibility troubleshooting.
- Difference between JSON export and compiled plugin download.
