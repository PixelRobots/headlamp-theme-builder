# Headlamp Theme Builder

A live theme builder for [Headlamp](https://headlamp.dev) — pick colours in the left panel, see them applied to a real MUI preview on the right, then download a ready-to-install Headlamp plugin zip.

## Features

- Live preview of navbar, sidebar, cards, and buttons
- Edit light and dark variants independently
- Downloads an installable compiled Headlamp plugin zip, with editable source files included
- Includes an uploaded custom logo in the generated plugin

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Using the downloaded plugin

1. Unzip the downloaded file
2. Copy the generated plugin folder to your Headlamp user-plugins directory:
   - **Windows:** `%APPDATA%\Headlamp\Config\user-plugins\<plugin-name>\`
   - **Linux/macOS:** `~/.config/Headlamp/Config/user-plugins/<plugin-name>/`
3. Restart Headlamp and select your theme in Settings → General → Theme.

The zip includes `main.js` at the plugin root, so it is ready to install without running a build. It also includes `src/`, `tsconfig.json`, and `dist/main.js` if you want to edit or rebuild it later.

## Tech stack

- React 18 + TypeScript
- Vite
- MUI v6 (same component library as Headlamp)
- react-colorful (colour pickers)
- JSZip + file-saver (plugin download)
