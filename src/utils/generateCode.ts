import type { HeadlampTheme } from '../types/theme';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/** Serialise a value for inclusion in a TypeScript source file. */
function serialize(v: unknown, indent = 2): string {
  if (typeof v === 'string') return JSON.stringify(v);
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

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'my-theme';
}

const BUILT_IN_THEME_NAMES = ['Light', 'Dark'];

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  repository?: string;
}

export interface ThemeSourceMetadata {
  id?: string;
  name?: string;
  url?: string;
  source?: string;
}

export interface GeneratedThemePluginOptions {
  source?: ThemeSourceMetadata;
  format?: 'zip' | 'tar.gz';
}

export function generateThemesTs(themes: HeadlampTheme[]): string {
  const varNames = themes.map((_, i) => `theme${i}`);
  const declarations = themes
    .map(
      (t, i) =>
        `export const ${varNames[i]} = ${serialize(t)} as AppTheme;`
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

export function generateIndexTsx(logoDataUrl?: string | null): string {
  return [
    logoDataUrl
      ? `import { AppLogoProps, registerAppLogo, registerAppTheme } from '@kinvolk/headlamp-plugin/lib';`
      : `import { registerAppTheme } from '@kinvolk/headlamp-plugin/lib';`,
    `import { themes } from './themes';`,
    '',
    `const builtInThemeNames = new Set(${JSON.stringify(BUILT_IN_THEME_NAMES)});`,
    '',
    `// Register only custom theme names. Headlamp already provides Light and Dark.`,
    `themes.filter(theme => !builtInThemeNames.has(theme.name)).forEach(theme => registerAppTheme(theme));`,
    '',
    ...(logoDataUrl
      ? [
          `const logoDataUrl = ${JSON.stringify(logoDataUrl)};`,
          '',
          `function ThemeBuilderLogo(props: AppLogoProps) {`,
          `  const { logoType, className } = props;`,
          '',
          `  return (`,
          `    <img`,
          `      src={logoDataUrl}`,
          `      alt="logo"`,
          `      className={className}`,
          `      style={{`,
          `        display: 'block',`,
          `        height: logoType === 'small' ? 28 : 32,`,
          `        maxWidth: logoType === 'small' ? 44 : 180,`,
          `        width: 'auto',`,
          `        objectFit: 'contain',`,
          `      }}`,
          `    />`,
          `  );`,
          `}`,
          '',
          `registerAppLogo(ThemeBuilderLogo);`,
          '',
        ]
      : []),
  ].join('\n');
}

export function generatePackageJson(
  pluginName: string,
  metadata?: PluginMetadata,
  options?: GeneratedThemePluginOptions
): string {
  const safe = slugify(metadata?.name || pluginName);
  const packageJson: Record<string, unknown> = {
    name: safe,
    version: metadata?.version || '0.1.0',
    description: metadata?.description || `Headlamp theme plugin: ${pluginName}`,
    main: 'main.js',
    devDependencies: {
      '@kinvolk/headlamp-plugin': '^0.14.0',
    },
    headlampThemeBuilder: {
      generatedBy: 'Headlamp Theme Builder',
      source: options?.source ?? null,
    },
  };

  if (metadata?.author) {
    packageJson.author = metadata.author;
  }

  if (metadata?.homepage) {
    packageJson.homepage = metadata.homepage;
  }

  if (metadata?.repository) {
    packageJson.repository = {
      type: 'git',
      url: metadata.repository,
    };
  }

  return JSON.stringify(
    packageJson,
    null,
    2
  );
}

export function downloadThemeJson(themes: HeadlampTheme[], logoDataUrl?: string | null): void {
  const pluginName = themes[0]?.name ?? 'my-theme';
  const safe = slugify(pluginName);
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    themes,
    logoDataUrl: logoDataUrl ?? null,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  saveAs(blob, `${safe}-headlamp-theme.json`);
}

function generateCompiledMainJs(themes: HeadlampTheme[], logoDataUrl?: string | null): string {
  const logoCode = logoDataUrl
    ? `
  var logoDataUrl = ${JSON.stringify(logoDataUrl)};
  function ThemeBuilderLogo(props) {
    props = props || {};
    var style = {
      display: 'block',
      height: props.logoType === 'small' ? '28px' : '32px',
      maxWidth: props.logoType === 'small' ? '44px' : '180px',
      width: 'auto',
      objectFit: 'contain'
    };

    return pluginLib.React.createElement('img', {
      src: logoDataUrl,
      alt: 'logo',
      className: props.className,
      style: style
    });
  }

  pluginLib.registerAppLogo(ThemeBuilderLogo);`
    : '';

  return `(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(require('@kinvolk/headlamp-plugin/lib'));
  } else if (typeof define === 'function' && define.amd) {
    define(['@kinvolk/headlamp-plugin/lib'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory(global.pluginLib);
  }
})(this, function(pluginLib) {
  'use strict';

  var themes = ${JSON.stringify(themes, null, 2)};
  var builtInThemeNames = ${JSON.stringify(BUILT_IN_THEME_NAMES)};
  themes.forEach(function(theme) {
    if (builtInThemeNames.indexOf(theme.name) === -1) {
      pluginLib.registerAppTheme(theme);
    }
  });
${logoCode}
});
`;
}

// --- tar.gz helpers (no extra dependencies, uses native CompressionStream) ---

function createTarHeader(name: string, size: number): Uint8Array {
  const header = new Uint8Array(512);
  const enc = new TextEncoder();
  function writeStr(offset: number, maxLen: number, value: string) {
    header.set(enc.encode(value).slice(0, maxLen), offset);
  }
  writeStr(0, 100, name);
  writeStr(100, 8, '0000755\0');
  writeStr(108, 8, '0000000\0');
  writeStr(116, 8, '0000000\0');
  writeStr(124, 12, size.toString(8).padStart(11, '0') + '\0');
  writeStr(136, 12, Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0');
  header.fill(32, 148, 156); // checksum field = spaces during calculation
  header[156] = 48; // '0' = regular file
  writeStr(257, 6, 'ustar\0');
  writeStr(263, 2, '00');
  let checksum = 0;
  for (let i = 0; i < 512; i++) checksum += header[i];
  writeStr(148, 8, checksum.toString(8).padStart(6, '0') + '\0 ');
  return header;
}

async function createTarGzBlob(
  files: { name: string; content: string }[],
  folderName: string
): Promise<Blob> {
  const enc = new TextEncoder();
  const blocks: Uint8Array[] = [];
  for (const file of files) {
    const data = enc.encode(file.content);
    blocks.push(createTarHeader(`${folderName}/${file.name}`, data.length));
    const padded = new Uint8Array(Math.ceil(data.length / 512) * 512);
    padded.set(data);
    blocks.push(padded);
  }
  blocks.push(new Uint8Array(1024)); // end-of-archive: two 512-byte zero blocks
  const total = blocks.reduce((s, b) => s + b.length, 0);
  const tar = new Uint8Array(total);
  let offset = 0;
  for (const b of blocks) { tar.set(b, offset); offset += b.length; }
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(tar);
  writer.close();
  return new Response(cs.readable).blob();
}

// -------------------------------------------------------------------------

export async function downloadPlugin(
  themes: HeadlampTheme[],
  logoDataUrl?: string | null,
  metadata?: PluginMetadata,
  options?: GeneratedThemePluginOptions
): Promise<void> {
  const pluginName = themes[0]?.name ?? 'my-theme';
  const safe = slugify(metadata?.name || pluginName);
  const format = options?.format ?? 'zip';

  const mainJs = generateCompiledMainJs(themes, logoDataUrl);
  const packageJson = generatePackageJson(pluginName, metadata, options);
  const themeSource = JSON.stringify(
    {
      version: 1,
      generatedBy: 'Headlamp Theme Builder',
      generatedAt: new Date().toISOString(),
      source: options?.source ?? null,
      themes,
      logoDataUrl: logoDataUrl ?? null,
    },
    null,
    2
  );

  if (format === 'tar.gz') {
    const blob = await createTarGzBlob(
      [
        { name: 'main.js', content: mainJs },
        { name: 'package.json', content: packageJson },
        { name: 'theme-source.json', content: themeSource },
      ],
      safe
    );
    saveAs(blob, `${safe}-headlamp-plugin.tar.gz`);
  } else {
    const zip = new JSZip();
    const plugin = zip.folder(safe)!;
    plugin.file('main.js', mainJs);
    plugin.file('package.json', packageJson);
    plugin.file('theme-source.json', themeSource);
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${safe}-headlamp-plugin.zip`);
  }
}
