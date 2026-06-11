# Changelog

All notable changes to Headlamp Theme Builder are documented here.

## Unreleased

- Added light/dark preview toggles to paired theme library cards.
- Added delete actions for imported library themes while keeping bundled themes fixed.
- Added a mobile warning dialog on the website to recommend desktop or the Headlamp plugin.
- Added generated plugin metadata controls for name, version, description, and author.
- Changed builder plugin downloads to export only the active theme being edited.
- Added builder validation summaries and blocked apply/download when hard theme errors are present.
- Added JSON schemas and runtime validation for imported themes and library entries.
- Added a public roadmap for planned theme schema, validation, preview, library, sharing, and documentation improvements.
- Added website and plugin screenshots to the README files.
- Added example theme JSON files for single-theme and library-entry imports.
- Clarified JSON URL import CORS expectations and older downloaded theme plugin compatibility troubleshooting.
- Renamed library download actions to "Download plugin" for clarity.

## v1.1.0 - 2026-06-11

- Added a bundled theme library to the website and Headlamp plugin.
- Added Pixelrobots, AKS Inspired, EKS Inspired, GKE Inspired, GitHub, Dracula, Nord, Solarized, Monokai, and One Dark Pro library themes.
- Added library preview cards with edit, download, and in-plugin apply actions.
- Added light/dark apply selection for paired library themes in the Headlamp plugin.
- Added JSON file and URL import for theme library entries, saved builder themes, theme arrays, and single theme JSON files.
- Added imported theme library persistence in the Headlamp plugin.
- Moved bundled library themes into repository JSON files under `src/library/themes`.
- Changed website library cards to only offer edit and download actions.
- Changed library apply behavior in the Headlamp plugin so applying a theme does not load it into the builder draft; editing is now the only action that changes the builder state.
- Added separate plugin storage for applied themes and builder draft state.
- Added theme support for Headlamp shape/button settings, navbar search hint, sidebar action background, terminal colors, and terminal ANSI colors.
- Fixed the color picker closing while dragging inside the saturation panel.
- Fixed outside-click handling so the color picker closes when clicking away.
- Fixed local plugin sidebar registration to keep the v1.0.0 route/menu behavior.
- Removed the new icon dependency from the Headlamp plugin library apply button to avoid plugin load failures on Headlamp builds that do not expose those icon components.

## v1.0.0 - 2026-06-10

- Added the Headlamp Theme Builder website with live theme preview.
- Added the embedded Headlamp Theme Builder plugin.
- Added theme plugin downloads containing the runtime files Headlamp needs.
- Added support for applying the current builder theme inside Headlamp.
- Added custom logo support for generated Headlamp theme plugins.
- Added GitHub Pages deployment for the website.
- Added Artifact Hub metadata for publishing the Headlamp plugin.
- Added Pixelrobots branding and PNG logo assets.
