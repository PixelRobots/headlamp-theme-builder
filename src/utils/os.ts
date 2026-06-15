export type OS = 'windows' | 'mac' | 'linux';

export function detectOS(): OS {
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform ?? '').toLowerCase();
  if (platform.includes('win') || ua.includes('windows')) return 'windows';
  if (platform.includes('mac') || ua.includes('mac os')) return 'mac';
  return 'linux';
}

export function pluginArchiveFormat(os: OS): 'zip' | 'tar.gz' {
  return os === 'windows' ? 'zip' : 'tar.gz';
}
