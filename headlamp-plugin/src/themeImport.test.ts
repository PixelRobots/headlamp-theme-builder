import { describe, expect, it } from 'vitest';
import { normalizeThemeImportUrl } from '../../src/utils/themeImport';

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
