import { completeTheme } from '../defaults/defaultTheme';
import type { HeadlampTheme } from '../types/theme';
import aksInspired from './themes/aks-inspired.json';
import dracula from './themes/dracula.json';
import eksInspired from './themes/eks-inspired.json';
import github from './themes/github.json';
import gkeInspired from './themes/gke-inspired.json';
import monokai from './themes/monokai.json';
import nord from './themes/nord.json';
import oneDarkPro from './themes/one-dark-pro.json';
import pixelrobots from './themes/pixelrobots.json';
import solarized from './themes/solarized.json';

export interface ThemeLibraryEntry {
  id: string;
  name: string;
  description: string;
  tags: string[];
  themes: HeadlampTheme[];
}

export interface RawThemeLibraryEntry {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  themes: Array<Partial<HeadlampTheme> & Pick<HeadlampTheme, 'name' | 'base'>>;
}

export function normalizeThemeLibraryEntry(entry: RawThemeLibraryEntry): ThemeLibraryEntry {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    tags: entry.tags ?? [],
    themes: entry.themes.map(theme => completeTheme(theme as HeadlampTheme)),
  };
}

const bundledThemeLibrary = [
  pixelrobots,
  aksInspired,
  eksInspired,
  gkeInspired,
  github,
  dracula,
  nord,
  solarized,
  monokai,
  oneDarkPro,
] as unknown as RawThemeLibraryEntry[];

export const themeLibrary: ThemeLibraryEntry[] = bundledThemeLibrary.map(normalizeThemeLibraryEntry);
