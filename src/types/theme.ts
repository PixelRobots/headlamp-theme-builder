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
    searchHint?: string;
  };
  terminal?: {
    background?: string;
    foreground?: string;
    cursor?: string;
    ansi?: {
      black?: string;
      red?: string;
      green?: string;
      yellow?: string;
      blue?: string;
      magenta?: string;
      cyan?: string;
      white?: string;
      brightBlack?: string;
      brightRed?: string;
      brightGreen?: string;
      brightYellow?: string;
      brightBlue?: string;
      brightMagenta?: string;
      brightCyan?: string;
      brightWhite?: string;
    };
  };
  fontFamily?: string[];
  radius?: number;
  buttonTextTransform?: 'none' | 'uppercase';
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
  | 'terminal.cursor'
  | 'terminal.ansi.black'
  | 'terminal.ansi.red'
  | 'terminal.ansi.green'
  | 'terminal.ansi.yellow'
  | 'terminal.ansi.blue'
  | 'terminal.ansi.magenta'
  | 'terminal.ansi.cyan'
  | 'terminal.ansi.white'
  | 'terminal.ansi.brightBlack'
  | 'terminal.ansi.brightRed'
  | 'terminal.ansi.brightGreen'
  | 'terminal.ansi.brightYellow'
  | 'terminal.ansi.brightBlue'
  | 'terminal.ansi.brightMagenta'
  | 'terminal.ansi.brightCyan'
  | 'terminal.ansi.brightWhite';
