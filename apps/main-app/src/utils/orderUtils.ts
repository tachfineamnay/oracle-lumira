// Local copy for frontend build (avoids cross-package import during Docker build)
const LEVEL_NAME_BY_LEVEL: Record<number, string> = {
  1: 'Simple',
  2: 'Intuitive',
  3: 'Alchimique',
  4: 'Intégrale',
};

export function getLevelNameFromLevel(level: number): string {
  const levelName = LEVEL_NAME_BY_LEVEL[level];
  if (!levelName) throw new Error(`Unknown level "${level}"`);
  return levelName;
}

export function getLevelNameSafely(level: number, fallback: string = 'Simple'): string {
  try {
    return getLevelNameFromLevel(level);
  } catch {
    return fallback;
  }
}

export function levelKeyToLevelNumber(key: string): 1 | 2 | 3 | 4 {
  const normalized = String(key || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  switch (normalized) {
    case 'initie':
    case 'initiee':
    case 'simple':
      return 1;
    case 'mystique':
    case 'intuitive':
      return 2;
    case 'profond':
    case 'alchimique':
      return 3;
    case 'integrale':
      return 4;
    default:
      throw new Error(`Unknown level key "${key}"`);
  }
}
