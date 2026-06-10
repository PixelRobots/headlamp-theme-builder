/**
 * Subset of the Headlamp AppTheme shape that is exposed to plugins.
 * Mirror of @kinvolk/headlamp-plugin lib/lib/AppTheme.
 */
export interface HeadlampTheme {
  name: string;
  base: 'light' | 'dark';
  primary: string;
  secondary: string;
  text: { primary: string };
  link: { color: string };
  background: {
    default: string;
    surface: string;
    muted: string;
  };
  sidebar: {
    background: string;
    color: string;
    selectedBackground: string;
    selectedColor: string;
    actionBackground: string;
  };
  navbar: {
    background: string;
    color: string;
  };
  terminal?: {
    background?: string;
    foreground?: string;
    cursor?: string;
  };
  fontFamily?: string[];
  radius?: number;
  buttonTextTransform?: 'none' | 'uppercase' | 'capitalize';
}

/** All the colour fields the builder exposes, keyed for the UI. */
export type ColourKey =
  | 'primary'
  | 'secondary'
  | 'text.primary'
  | 'link.color'
  | 'background.default'
  | 'background.surface'
  | 'background.muted'
  | 'sidebar.background'
  | 'sidebar.color'
  | 'sidebar.selectedBackground'
  | 'sidebar.selectedColor'
  | 'sidebar.actionBackground'
  | 'navbar.background'
  | 'navbar.color'
  | 'terminal.background'
  | 'terminal.foreground'
  | 'terminal.cursor';
