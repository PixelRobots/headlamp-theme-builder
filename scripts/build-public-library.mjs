import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundledSourceDir = path.join(repoRoot, 'src', 'library', 'themes');
const communitySourceDir = path.join(repoRoot, 'library', 'themes');
const catalogReadmePath = path.join(repoRoot, 'library', 'README.md');
const outputDir = path.join(repoRoot, 'public', 'library');
const outputThemeDir = path.join(outputDir, 'themes');
const outputPreviewDir = path.join(outputDir, 'previews');
const pagesLibraryUrl = 'https://pixelrobots.github.io/headlamp-theme-builder/library';
const checkOnly = process.argv.includes('--check');

function compareJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function markdownEscape(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'theme';
}

function modesFor(entry) {
  return Array.from(
    new Set(
      (Array.isArray(entry.themes) ? entry.themes : [])
        .map(theme => theme?.base)
        .filter(mode => mode === 'light' || mode === 'dark')
    )
  );
}

function assertString(value, label, errors) {
  if (typeof value !== 'string' || value.trim().length < 1) {
    errors.push(`${label} is required.`);
  }
}

function validateEntry(entry, file, source, seenIds) {
  const errors = [];

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return [`${file} must contain a theme library entry object.`];
  }

  assertString(entry.id, `${file}: id`, errors);
  assertString(entry.name, `${file}: name`, errors);
  assertString(entry.description, `${file}: description`, errors);

  if (typeof entry.id === 'string') {
    if (seenIds.has(entry.id)) {
      errors.push(`${file}: duplicate theme id "${entry.id}".`);
    }
    seenIds.add(entry.id);
  }

  if (!Array.isArray(entry.themes) || entry.themes.length < 1) {
    errors.push(`${file}: themes must contain at least one theme.`);
  } else {
    entry.themes.forEach((theme, index) => {
      assertString(theme?.name, `${file}: themes[${index}].name`, errors);
      if (theme?.base !== 'light' && theme?.base !== 'dark') {
        errors.push(`${file}: themes[${index}].base must be "light" or "dark".`);
      }
    });
  }

  if (entry.tags !== undefined && !Array.isArray(entry.tags)) {
    errors.push(`${file}: tags must be an array when provided.`);
  }

  if (source === 'community' && typeof entry.id === 'string' && !file.startsWith(`${entry.id}.`)) {
    errors.push(`${file}: community theme filename should match its id (${entry.id}.json).`);
  }

  return errors;
}

async function readThemeSource(sourceDir, source) {
  let files = [];
  try {
    files = await readdir(sourceDir);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  return Promise.all(
    files
      .filter(file => file.endsWith('.json'))
      .sort((left, right) => left.localeCompare(right))
      .map(async file => {
        const sourcePath = path.join(sourceDir, file);
        return {
          file,
          source,
          entry: JSON.parse(await readFile(sourcePath, 'utf8')),
        };
      })
  );
}

function previewSvg(theme, title) {
  const navbar = theme.navbar ?? {};
  const sidebar = theme.sidebar ?? {};
  const background = theme.background ?? {};
  const text = theme.text ?? {};
  const terminal = theme.terminal ?? {};

  const colors = {
    bg: background.default ?? (theme.base === 'dark' ? '#151515' : '#ffffff'),
    surface: background.surface ?? (theme.base === 'dark' ? '#252525' : '#f4f4f4'),
    muted: background.muted ?? (theme.base === 'dark' ? '#333333' : '#e6e6e6'),
    navbar: navbar.background ?? '#202020',
    navbarText: navbar.color ?? '#ffffff',
    sidebar: sidebar.background ?? '#202020',
    sidebarText: sidebar.color ?? '#ffffff',
    selected: sidebar.selectedBackground ?? theme.primary ?? '#1976d2',
    action: sidebar.actionBackground ?? theme.secondary ?? '#2e7d32',
    primary: theme.primary ?? '#1976d2',
    text: text.primary ?? (theme.base === 'dark' ? '#f4f4f4' : '#222222'),
    terminal: terminal.background ?? background.muted ?? '#111111',
    terminalText: terminal.foreground ?? text.primary ?? '#f4f4f4',
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="${escapeHtml(title)} preview">
  <rect width="640" height="360" rx="18" fill="${escapeHtml(colors.bg)}"/>
  <rect x="22" y="22" width="596" height="48" rx="10" fill="${escapeHtml(colors.navbar)}"/>
  <rect x="44" y="40" width="96" height="12" rx="6" fill="${escapeHtml(colors.navbarText)}" opacity="0.9"/>
  <rect x="456" y="38" width="116" height="16" rx="8" fill="none" stroke="${escapeHtml(colors.navbarText)}" opacity="0.65"/>
  <rect x="22" y="82" width="132" height="250" rx="10" fill="${escapeHtml(colors.sidebar)}"/>
  <rect x="44" y="108" width="70" height="11" rx="5.5" fill="${escapeHtml(colors.sidebarText)}" opacity="0.7"/>
  <rect x="44" y="135" width="88" height="28" rx="8" fill="${escapeHtml(colors.selected)}"/>
  <rect x="44" y="183" width="74" height="11" rx="5.5" fill="${escapeHtml(colors.sidebarText)}" opacity="0.5"/>
  <rect x="44" y="210" width="74" height="11" rx="5.5" fill="${escapeHtml(colors.sidebarText)}" opacity="0.42"/>
  <rect x="44" y="288" width="88" height="26" rx="8" fill="${escapeHtml(colors.action)}"/>
  <rect x="178" y="92" width="418" height="216" rx="12" fill="${escapeHtml(colors.surface)}" stroke="${escapeHtml(colors.muted)}"/>
  <rect x="206" y="122" width="156" height="16" rx="8" fill="${escapeHtml(colors.text)}" opacity="0.9"/>
  <rect x="206" y="160" width="336" height="72" rx="10" fill="${escapeHtml(colors.muted)}"/>
  <rect x="230" y="186" width="250" height="12" rx="6" fill="${escapeHtml(colors.text)}" opacity="0.5"/>
  <rect x="230" y="208" width="112" height="18" rx="9" fill="${escapeHtml(colors.primary)}"/>
  <rect x="206" y="250" width="336" height="38" rx="10" fill="${escapeHtml(colors.terminal)}"/>
  <rect x="230" y="264" width="210" height="10" rx="5" fill="${escapeHtml(colors.terminalText)}" opacity="0.9"/>
</svg>
`;
}

function firstThemeByMode(entry, mode) {
  return entry.themes.find(theme => theme.base === mode);
}

function getPreviewFiles(item) {
  return modesFor(item.entry).map(mode => {
    const theme = firstThemeByMode(item.entry, mode);
    return {
      mode,
      file: `${item.entry.id}-${mode}.svg`,
      content: previewSvg(theme, `${item.entry.name} ${mode}`),
    };
  });
}

function publicEntry(item) {
  const modes = modesFor(item.entry);
  const firstMode = modes[0] ?? 'dark';

  return {
    id: item.entry.id,
    name: item.entry.name,
    description: item.entry.description,
    source: item.source,
    tags: Array.isArray(item.entry.tags) ? item.entry.tags : [],
    modes,
    jsonUrl: `${pagesLibraryUrl}/themes/${item.file}`,
    previewUrl: `${pagesLibraryUrl}/previews/${item.entry.id}-${firstMode}.svg`,
    previews: Object.fromEntries(
      modes.map(mode => [mode, `${pagesLibraryUrl}/previews/${item.entry.id}-${mode}.svg`])
    ),
    themes: item.entry.themes,
  };
}

function catalogReadme(entries) {
  const rows = entries
    .map(item => {
      const entry = item.entry;
      const modes = modesFor(entry);
      const tags = Array.isArray(entry.tags) ? entry.tags.join(', ') : '';
      const previews = modes
        .map(mode => {
          const previewPath = `../public/library/previews/${entry.id}-${mode}.svg`;
          return `![${markdownEscape(entry.name)} ${mode} preview](${previewPath})`;
        })
        .join('<br>');
      const jsonPath = item.source === 'bundled'
        ? `../src/library/themes/${item.file}`
        : `themes/${item.file}`;

      return `| ${previews} | \`${markdownEscape(entry.id)}\` | [${markdownEscape(entry.name)}](${jsonPath}) | ${markdownEscape(entry.description)} | ${item.source} | ${markdownEscape(modes.join(', '))} | ${markdownEscape(tags)} |`;
    })
    .join('\n');

  return `# Headlamp Theme Library

This catalog is generated from curated bundled themes in \`src/library/themes\` and community/public themes in \`library/themes\`.

Use the website or Headlamp plugin Library tab to load the public library directly, or import a theme JSON URL manually.

## Contributing Themes

Add community themes to \`library/themes/<theme-id>.json\`. Keep bundled starter themes in \`src/library/themes\` unless the theme should ship inside the website and plugin by default.

Requirements:

- Use a unique, lowercase, dash-separated \`id\`.
- Match the filename to the id, for example \`my-theme.json\`.
- Include \`name\`, \`description\`, \`tags\`, and at least one theme in \`themes\`.
- Use \`base: "light"\` or \`base: "dark"\`.
- Check readability before opening a PR.

Run this before opening a PR:

\`\`\`bash
npm run check:library
npm run build
\`\`\`

## Themes

| Preview | ID | Theme | Description | Source | Modes | Tags |
| --- | --- | --- | --- | --- | --- | --- |
${rows}
`;
}

async function writeIfChanged(filePath, content) {
  if (checkOnly) {
    let current = null;
    try {
      current = await readFile(filePath, 'utf8');
    } catch {
      throw new Error(`${path.relative(repoRoot, filePath)} is missing. Run npm run build:library.`);
    }

    if (current !== content) {
      throw new Error(`${path.relative(repoRoot, filePath)} is stale. Run npm run build:library.`);
    }
    return;
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}

const rawItems = [
  ...(await readThemeSource(bundledSourceDir, 'bundled')),
  ...(await readThemeSource(communitySourceDir, 'community')),
];

const seenIds = new Set();
const errors = rawItems.flatMap(item => validateEntry(item.entry, item.file, item.source, seenIds));

if (errors.length > 0) {
  throw new Error(`Theme library validation failed:\n${errors.join('\n')}`);
}

const sortedItems = rawItems.sort((left, right) => left.entry.name.localeCompare(right.entry.name));
const publicEntries = sortedItems.map(publicEntry);
const publicIndex = `${JSON.stringify({ version: 1, themes: publicEntries }, null, 2)}\n`;

await mkdir(outputThemeDir, { recursive: true });
await mkdir(outputPreviewDir, { recursive: true });

await writeIfChanged(path.join(outputDir, 'index.json'), publicIndex);
await writeIfChanged(catalogReadmePath, catalogReadme(sortedItems));

for (const item of sortedItems) {
  await writeIfChanged(
    path.join(outputThemeDir, item.file),
    `${JSON.stringify(item.entry, null, 2)}\n`
  );

  for (const preview of getPreviewFiles(item)) {
    await writeIfChanged(path.join(outputPreviewDir, preview.file), preview.content);
  }
}

if (checkOnly) {
  const currentIndex = JSON.parse(await readFile(path.join(outputDir, 'index.json'), 'utf8'));
  if (!compareJson(currentIndex, { version: 1, themes: publicEntries })) {
    throw new Error('public/library/index.json is stale. Run npm run build:library.');
  }
}

console.log(
  `${checkOnly ? 'Checked' : 'Generated'} public theme library with ${publicEntries.length} themes.`
);
