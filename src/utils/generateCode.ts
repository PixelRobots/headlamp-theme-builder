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

function slugify(value: string): string {
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

export async function downloadPlugin(
  themes: HeadlampTheme[],
  logoDataUrl?: string | null,
  metadata?: PluginMetadata,
  options?: GeneratedThemePluginOptions
): Promise<void> {
  const pluginName = themes[0]?.name ?? 'my-theme';
  const safe = slugify(metadata?.name || pluginName);

  const zip = new JSZip();
  const plugin = zip.folder(safe)!;
  plugin.file('main.js', generateCompiledMainJs(themes, logoDataUrl));
  plugin.file('package.json', generatePackageJson(pluginName, metadata, options));
  plugin.file(
    'theme-source.json',
    JSON.stringify(
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
    )
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${safe}-headlamp-plugin.zip`);
}
