import { describe, expect, it } from 'vitest';
import { defaultDark, defaultLight } from '../../src/defaults/defaultTheme';
import { muiToHeadlampTheme } from '../../src/utils/muiToHeadlampTheme';
import { decodeSharedThemeState, encodeSharedThemeState } from '../../src/utils/shareTheme';
import { getImportedLibraryEntry, normalizeThemeImportUrl } from '../../src/utils/themeImport';
import { validateThemesForUse } from '../../src/utils/themeValidation';

describe('theme import URLs', () => {
  it('converts GitHub blob URLs to raw JSON URLs', () => {
    expect(
      normalizeThemeImportUrl(
        'https://github.com/PixelRobots/headlamp-theme-builder/blob/main/src/library/themes/pixelrobots.json'
      )
    ).toEqual({
      url: 'https://raw.githubusercontent.com/PixelRobots/headlamp-theme-builder/main/src/library/themes/pixelrobots.json',
      wasConverted: true,
    });
  });

  it('keeps raw URLs unchanged', () => {
    expect(
      normalizeThemeImportUrl(
        'https://raw.githubusercontent.com/PixelRobots/headlamp-theme-builder/main/src/library/themes/pixelrobots.json'
      )
    ).toEqual({
      url: 'https://raw.githubusercontent.com/PixelRobots/headlamp-theme-builder/main/src/library/themes/pixelrobots.json',
      wasConverted: false,
    });
  });

  it('rejects GitHub URLs that do not point to JSON files', () => {
    expect(() =>
      normalizeThemeImportUrl(
        'https://github.com/PixelRobots/headlamp-theme-builder/blob/main/README.md'
      )
    ).toThrow('That GitHub URL does not point to a JSON file.');
  });
});

describe('theme library imports', () => {
  it('marks imported library entries as imported even when they already have tags', () => {
    const entry = getImportedLibraryEntry({
      id: 'custom',
      name: 'Custom',
      description: 'Custom library entry.',
      tags: ['dark', 'team'],
      themes: [
        {
          ...defaultDark,
          name: 'Custom Dark',
          base: 'dark',
        },
      ],
    });

    expect(entry.tags).toEqual(['imported', 'dark', 'team']);
  });
});

describe('theme validation', () => {
  it('does not warn for the default starter themes', () => {
    const result = validateThemesForUse([defaultLight, defaultDark]);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('warns when terminal ANSI colours have low contrast', () => {
    const result = validateThemesForUse([
      {
        ...defaultDark,
        name: 'Low ANSI',
        terminal: {
          ...defaultDark.terminal,
          background: '#101010',
          ansi: {
            ...defaultDark.terminal?.ansi,
            black: '#101010',
          },
        },
      },
    ]);

    expect(result.warnings).toContain(
      'Low ANSI (dark): ANSI black against terminal background is 1.0:1; recommended minimum is 3:1.'
    );
  });
});

describe('current theme imports', () => {
  it('normalizes MUI rgb colours to hex colours', () => {
    const imported = muiToHeadlampTheme(
      {
        palette: {
          mode: 'dark',
          primary: {
            main: 'rgb(81, 177, 72)',
            contrastText: 'rgb(255 255 255)',
          },
          secondary: {
            main: 'rgba(192, 255, 217, 1)',
          },
          text: {
            primary: 'rgb(250, 249, 248)',
            secondary: 'rgb(205 205 205 / 1)',
          },
          background: {
            default: 'rgb(20, 20, 36)',
            paper: '#1b1a31',
          },
        },
        typography: {
          fontFamily: 'Roboto',
        },
        shape: {
          borderRadius: 8,
        },
      },
      'Imported'
    );

    expect(imported.primary).toBe('#51b148');
    expect(imported.secondary).toBe('#c0ffd9');
    expect(imported.sidebar.color).toBe('#cdcdcd');
    expect(imported.navbar.searchHint).toBe('#cdcdcd');
    expect(validateThemesForUse([imported]).errors).toEqual([]);
  });
});

describe('shared theme links', () => {
  it('round trips shared theme state', () => {
    const customDark = {
      ...defaultDark,
      name: 'Custom Dark',
      primary: '#ffea00',
      sidebar: {
        ...defaultDark.sidebar,
        selectedColor: '#101010',
      },
    };
    const encoded = encodeSharedThemeState({
      active: 'dark',
      themes: [customDark],
    });

    expect(decodeSharedThemeState(encoded)).toEqual({
      version: 2,
      active: 'dark',
      themes: [customDark],
    });
    expect(encoded.length).toBeLessThan(160);
  });

});
