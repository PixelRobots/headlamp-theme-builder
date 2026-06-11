# Downloaded Theme Plugin Guide

This guide is for theme plugins downloaded from Headlamp Theme Builder with **Download plugin**. These generated plugins are different from the Theme Builder plugin itself: they only register one or more Headlamp themes and, optionally, a logo.

## Install Permanently

1. Download the theme plugin zip from the website or the Headlamp Theme Builder plugin.
2. Extract the zip.
3. Copy the extracted plugin folder into your Headlamp plugins directory.

Common desktop plugin locations:

```text
Windows: %APPDATA%\Headlamp\Config\plugins
macOS: ~/Library/Application Support/Headlamp/Config/plugins
Linux: ~/.config/Headlamp/Config/plugins
```

4. Restart Headlamp.
5. Open **Settings > Plugins** and confirm the theme plugin is loaded.
6. Open Headlamp's theme selector and pick the generated theme.

## Upgrade

1. Download the updated theme plugin zip.
2. Stop Headlamp.
3. Replace the old generated theme plugin folder with the newly extracted folder.
4. Start Headlamp again.

If the package name changed in the download metadata dialog, remove the old folder as well. Headlamp treats each package folder/name as a separate plugin.

## Remove

1. Stop Headlamp.
2. Delete the generated theme plugin folder from the Headlamp plugins directory.
3. Start Headlamp again.

If the removed theme was selected, Headlamp may fall back to another available theme.

## Compatibility Troubleshooting

If Headlamp shows the generated theme plugin as incompatible:

- Download the theme plugin again from the current Theme Builder version.
- Make sure the extracted folder contains `main.js` and `package.json`.
- Make sure `package.json` includes `main: "main.js"` and the Headlamp plugin dependency metadata.
- Remove older copies of the same generated theme plugin from the plugins directory.
- Restart Headlamp after replacing plugin files.

Older generated plugins may not include the compatibility metadata newer Headlamp versions expect.

## JSON Export vs Compiled Plugin Download

Use **Export saved JSON** when you want to:

- keep editing the theme later,
- share theme source with another person,
- import the theme back into the website or Theme Builder plugin,
- contribute a theme JSON file to the public library.

Use **Download plugin** when you want to:

- install the theme permanently in Headlamp,
- give someone a ready-to-copy plugin folder,
- register a theme without installing the full Theme Builder plugin.

JSON files are editable source. Downloaded plugin zips are installable runtime packages.
