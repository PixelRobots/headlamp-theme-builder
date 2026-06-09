import type { HeadlampTheme } from '../types/theme';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/** Serialise a value for inclusion in a TypeScript source file. */
function serialize(v: unknown, indent = 2): string {
  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v))
    return `[${v.map(i => serialize(i)).join(', ')}]`;
  if (typeof v === 'object' && v !== null) {
    const pad = ' '.repeat(indent);
    const entries = Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${pad}  ${k}: ${serialize(val, indent + 2)}`)
      .join(',\n');
    return `{\n${entries},\n${pad}}`;
  }
  return String(v);
}

export function generateThemesTs(themes: HeadlampTheme[]): string {
  const varNames = themes.map((_, i) => `theme${i}`);
  const declarations = themes
    .map(
      (t, i) =>
        `export const ${varNames[i]}: AppTheme = ${serialize(t)};`
    )
    .join('\n\n');

  return [
    `import type { AppTheme } from '@kinvolk/headlamp-plugin/lib/lib/AppTheme';`,
    '',
    declarations,
    '',
    `export const themes: AppTheme[] = [${varNames.join(', ')}];`,
    '',
  ].join('\n');
}

export function generateIndexTsx(themes: HeadlampTheme[]): string {
  const imports = themes
    .map((_, i) => `  theme${i}`) 
    .join(',\n');

  return [
    `import { registerAppTheme } from '@kinvolk/headlamp-plugin/lib/CommonComponents';`,
    `import { themes } from './themes';`,
    '',
    `// Register all themes with Headlamp`,
    `themes.forEach(theme => registerAppTheme(theme));`,
    '',
  ].join('\n');
}

export function generatePackageJson(pluginName: string): string {
  const safe = pluginName.toLowerCase().replace(/\s+/g, '-');
  return JSON.stringify(
    {
      name: safe,
      version: '0.1.0',
      description: `Headlamp theme plugin: ${pluginName}`,
      main: 'dist/main.js',
      devDependencies: {
        '@kinvolk/headlamp-plugin': '^0.9.0',
      },
    },
    null,
    2
  );
}

export async function downloadPlugin(themes: HeadlampTheme[]): Promise<void> {
  const pluginName = themes[0]?.name ?? 'my-theme';
  const safe = pluginName.toLowerCase().replace(/\s+/g, '-');

  const zip = new JSZip();
  const src = zip.folder('src')!;
  src.file('themes.ts', generateThemesTs(themes));
  src.file('index.tsx', generateIndexTsx(themes));
  zip.file('package.json', generatePackageJson(pluginName));
  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
        },
        include: ['src'],
      },
      null,
      2
    )
  );
  zip.file(
    'README.md',
    [
      `# ${pluginName} — Headlamp Theme Plugin`,
      '',
      '## Install',
      '```bash',
      'npm install',
      'npx headlamp-plugin build',
      '```',
      '',
      'Copy `dist/main.js` and `package.json` to:',
      '`%APPDATA%\\Headlamp\\Config\\user-plugins\\<plugin-name>\\` (Windows)',
      '`~/.config/Headlamp/Config/user-plugins/<plugin-name>/` (Linux/macOS)',
      '',
    ].join('\n')
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${safe}-headlamp-plugin.zip`);
}
