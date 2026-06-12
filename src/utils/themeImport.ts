import { completeTheme } from '../defaults/defaultTheme';
import {
  normalizeThemeLibraryEntry,
  type RawThemeLibraryEntry,
  type ThemeLibraryEntry,
} from '../library/themeLibrary';
import type { HeadlampTheme } from '../types/theme';
import { assertValidThemes } from './themeValidation';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'imported-theme';
}

export interface ThemeImportUrl {
  url: string;
  wasConverted: boolean;
}

export function normalizeThemeImportUrl(value: string): ThemeImportUrl {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('Enter a valid HTTP or HTTPS URL.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Theme URLs must start with http:// or https://.');
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

  if (hostname !== 'github.com') {
    return { url: parsedUrl.toString(), wasConverted: false };
  }

  const [owner, repo, marker, ref, ...pathParts] = parsedUrl.pathname
    .split('/')
    .filter(Boolean);

  if (!owner || !repo || marker !== 'blob' || !ref || pathParts.length < 1) {
    throw new Error(
      'GitHub imports must point to a JSON file, for example github.com/owner/repo/blob/main/theme.json.'
    );
  }

  const filePath = pathParts.join('/');
  if (!filePath.toLowerCase().endsWith('.json')) {
    throw new Error('That GitHub URL does not point to a JSON file.');
  }

  return {
    url: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`,
    wasConverted: true,
  };
}

function isThemeLike(value: unknown): value is Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'> {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    (value.base === 'light' || value.base === 'dark')
  );
}

function isThemeLibraryEntryLike(value: unknown): value is RawThemeLibraryEntry {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    Array.isArray(value.themes) &&
    value.themes.every(isThemeLike)
  );
}

function getRawThemes(data: unknown): Array<Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'>> {
  if (Array.isArray(data)) {
    return data.filter(isThemeLike);
  }

  if (isThemeLike(data)) {
    return [data];
  }

  if (isRecord(data) && Array.isArray(data.themes)) {
    return data.themes.filter(isThemeLike);
  }

  return [];
}

export function getImportedThemes(data: unknown): HeadlampTheme[] {
  const themes = getRawThemes(data);
  if (themes.length < 1) {
    throw new Error('Theme JSON must contain at least one valid theme.');
  }

  assertValidThemes(themes);
  return themes.map(theme => completeTheme(theme as HeadlampTheme));
}

export function getImportedLogoDataUrl(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  return typeof data.logoDataUrl === 'string' ? data.logoDataUrl : null;
}

export function getImportedLibraryEntry(data: unknown, fallbackName = 'Imported Theme'): ThemeLibraryEntry {
  if (isThemeLibraryEntryLike(data)) {
    assertValidThemes(data.themes);
    return normalizeThemeLibraryEntry({
      id: typeof data.id === 'string' ? data.id : slugify(data.name),
      name: data.name,
      description:
        typeof data.description === 'string'
          ? data.description
          : 'Imported theme library entry.',
      tags: Array.from(
        new Set([
          'imported',
          ...(Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string') : []),
        ])
      ),
      jsonUrl: typeof data.jsonUrl === 'string' ? data.jsonUrl : undefined,
      themes: data.themes,
    });
  }

  const themes = getImportedThemes(data);
  const source = isRecord(data) && isRecord(data.source) ? data.source : null;
  const sourceName = source && typeof source.name === 'string' ? source.name : undefined;
  const sourceUrl = source && typeof source.url === 'string' ? source.url : undefined;
  const entryName =
    isRecord(data) && typeof data.name === 'string'
      ? data.name
      : sourceName
        ? sourceName
        : themes.length === 1
          ? themes[0].name
          : fallbackName;

  return {
    id: `imported-${slugify(entryName)}`,
    name: entryName,
    description: 'Imported theme JSON.',
    tags: ['imported'],
    jsonUrl: sourceUrl,
    themes,
  };
}
