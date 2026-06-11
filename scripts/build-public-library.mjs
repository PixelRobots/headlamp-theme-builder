import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(repoRoot, 'src', 'library', 'themes');
const outputDir = path.join(repoRoot, 'public', 'library');
const outputThemeDir = path.join(outputDir, 'themes');
const pagesBaseUrl = 'https://pixelrobots.github.io/headlamp-theme-builder/library/themes';

function modesFor(entry) {
  return Array.from(
    new Set(
      (Array.isArray(entry.themes) ? entry.themes : [])
        .map(theme => theme?.base)
        .filter(mode => mode === 'light' || mode === 'dark')
    )
  );
}

await mkdir(outputThemeDir, { recursive: true });

const files = (await readdir(sourceDir))
  .filter(file => file.endsWith('.json'))
  .sort((left, right) => left.localeCompare(right));

const themes = [];

for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const outputPath = path.join(outputThemeDir, file);
  const entry = JSON.parse(await readFile(sourcePath, 'utf8'));

  await copyFile(sourcePath, outputPath);

  themes.push({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    modes: modesFor(entry),
    jsonUrl: `${pagesBaseUrl}/${file}`,
    themes: entry.themes,
  });
}

await writeFile(
  path.join(outputDir, 'index.json'),
  `${JSON.stringify(
    {
      version: 1,
      themes,
    },
    null,
    2
  )}\n`
);

console.log(`Generated public theme library with ${themes.length} themes.`);
