import { getLevelNameFromLevel, getLevelNameSafely, levelKeyToLevelNumber } from '../utils/orderUtils';

describe('orderUtils', () => {
  describe('getLevelNameFromLevel', () => {
    it.each([
      [1, 'Simple'],
      [2, 'Intuitive'],
      [3, 'Alchimique'],
      [4, 'Intégrale'],
    ])('returns %s for level %d', (level, expected) => {
      expect(getLevelNameFromLevel(level as number)).toBe(expected);
    });

    it('throws for unsupported levels', () => {
      expect(() => getLevelNameFromLevel(0)).toThrow('Unknown level "0"');
      expect(() => getLevelNameFromLevel(5)).toThrow('Unknown level "5"');
    });
  });

  describe('getLevelNameSafely', () => {
    it('returns derived value when level is valid', () => {
      expect(getLevelNameSafely(2)).toBe('Intuitive');
    });

    it('returns fallback when level is invalid', () => {
      expect(getLevelNameSafely(9)).toBe('Simple');
      expect(getLevelNameSafely(9, 'Fallback')).toBe('Fallback');
    });
  });

  describe('levelKeyToLevelNumber', () => {
    it.each([
      ['simple', 1],
      ['initié', 1],
      ['intuitive', 2],
      ['integrale', 4],
      ['Intégrale', 4],
      ['ALCHIMIQUE', 3],
    ])('normalizes key %s to level %d', (key, expected) => {
      expect(levelKeyToLevelNumber(key)).toBe(expected);
    });

    it('throws when key is unknown', () => {
      expect(() => levelKeyToLevelNumber('unknown')).toThrow('Unknown level key "unknown"');
    });
  });
});
