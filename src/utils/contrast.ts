export interface ContrastResult {
  ratio: number;
  label: 'AAA' | 'AA' | 'Low';
  passes: boolean;
}

function expandHex(value: string): string {
  const hex = value.trim().replace(/^#/, '');
  if (hex.length === 3) {
    return hex
      .split('')
      .map(char => char + char)
      .join('');
  }
  return hex;
}

function hexToRgb(value: string): [number, number, number] | null {
  const hex = expandHex(value);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function channelToLinear(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(value: string): number | null {
  const rgb = hexToRgb(value);
  if (!rgb) {
    return null;
  }

  const [red, green, blue] = rgb.map(channelToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground: string, background: string): number | null {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) {
    return null;
  }

  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);
  return (light + 0.05) / (dark + 0.05);
}

export function getContrastResult(foreground: string, background: string): ContrastResult | null {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) {
    return null;
  }

  if (ratio >= 7) {
    return { ratio, label: 'AAA', passes: true };
  }

  if (ratio >= 4.5) {
    return { ratio, label: 'AA', passes: true };
  }

  return { ratio, label: 'Low', passes: false };
}
