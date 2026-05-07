import {
  halfToFullWidthMap,
  fullToHalfWidthMap,
  transformHalfToFullWidth,
  transformFullToHalfWidth,
  getAllHalfWidthForms,
  getAllFullWidthForms,
  getAllHalfAndFullWidthForms,
  fullWidthCharacterRules,
} from './fullAndHalfWidthSymbols';

describe('fullAndHalfWidthSymbols', () => {
  describe('halfToFullWidthMap', () => {
    it('should contain common punctuation mappings', () => {
      expect(halfToFullWidthMap[',']).toBe('，');
      expect(halfToFullWidthMap['.']).toBe('。');
      expect(halfToFullWidthMap['!']).toBe('！');
      expect(halfToFullWidthMap['?']).toBe('？');
      expect(halfToFullWidthMap[':']).toBe('：');
      expect(halfToFullWidthMap[';']).toBe('；');
      expect(halfToFullWidthMap['(']).toBe('（');
      expect(halfToFullWidthMap[')']).toBe('）');
    });

    it('should not be empty', () => {
      expect(Object.keys(halfToFullWidthMap).length).toBeGreaterThan(0);
    });
  });

  describe('fullToHalfWidthMap', () => {
    it('should contain reverse mappings', () => {
      expect(fullToHalfWidthMap['，']).toBe(',');
      expect(fullToHalfWidthMap['。']).toBe('.');
      expect(fullToHalfWidthMap['！']).toBe('!');
      expect(fullToHalfWidthMap['？']).toBe('?');
      expect(fullToHalfWidthMap['：']).toBe(':');
      expect(fullToHalfWidthMap['；']).toBe(';');
    });

    it('should map full-width digits to half-width', () => {
      expect(fullToHalfWidthMap['０']).toBe('0');
      expect(fullToHalfWidthMap['１']).toBe('1');
      expect(fullToHalfWidthMap['９']).toBe('9');
    });

    it('should map full-width letters to half-width', () => {
      expect(fullToHalfWidthMap['Ａ']).toBe('A');
      expect(fullToHalfWidthMap['Ｚ']).toBe('Z');
      expect(fullToHalfWidthMap['ａ']).toBe('a');
      expect(fullToHalfWidthMap['ｚ']).toBe('z');
    });

    it('should map full-width symbols to half-width', () => {
      expect(fullToHalfWidthMap['＄']).toBe('$');
      expect(fullToHalfWidthMap['＊']).toBe('*');
      expect(fullToHalfWidthMap['＋']).toBe('+');
      expect(fullToHalfWidthMap['－']).toBe('-');
      expect(fullToHalfWidthMap['／']).toBe('/');
    });
  });

  describe('transformHalfToFullWidth', () => {
    it('should transform known half-width chars', () => {
      expect(transformHalfToFullWidth(',')).toBe('，');
      expect(transformHalfToFullWidth('.')).toBe('。');
      expect(transformHalfToFullWidth('!')).toBe('！');
    });

    it('should return input unchanged for unknown chars', () => {
      expect(transformHalfToFullWidth('x')).toBe('x');
      expect(transformHalfToFullWidth('你')).toBe('你');
    });
  });

  describe('transformFullToHalfWidth', () => {
    it('should transform known full-width chars', () => {
      expect(transformFullToHalfWidth('，')).toBe(',');
      expect(transformFullToHalfWidth('。')).toBe('.');
      expect(transformFullToHalfWidth('！')).toBe('!');
      expect(transformFullToHalfWidth('０')).toBe('0');
      expect(transformFullToHalfWidth('Ａ')).toBe('A');
    });

    it('should return input unchanged for unknown chars', () => {
      expect(transformFullToHalfWidth('x')).toBe('x');
      expect(transformFullToHalfWidth('你')).toBe('你');
    });
  });

  describe('getAllHalfWidthForms', () => {
    it('should return a non-empty string', () => {
      const result = getAllHalfWidthForms();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be memoized (return same reference)', () => {
      expect(getAllHalfWidthForms()).toBe(getAllHalfWidthForms());
    });

    it('should contain common half-width chars', () => {
      const result = getAllHalfWidthForms();
      expect(result).toContain('!');
      expect(result).toContain(',');
      expect(result).toContain('.');
    });
  });

  describe('getAllFullWidthForms', () => {
    it('should return a non-empty string', () => {
      const result = getAllFullWidthForms();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be memoized (return same reference)', () => {
      expect(getAllFullWidthForms()).toBe(getAllFullWidthForms());
    });

    it('should contain common full-width chars', () => {
      const result = getAllFullWidthForms();
      expect(result).toContain('！');
      expect(result).toContain('，');
      expect(result).toContain('。');
    });

    it('should contain extra full-width forms', () => {
      const result = getAllFullWidthForms();
      expect(result).toContain('《');
      expect(result).toContain('》');
      expect(result).toContain('「');
      expect(result).toContain('」');
    });
  });

  describe('getAllHalfAndFullWidthForms', () => {
    it('should contain both half and full width forms', () => {
      const result = getAllHalfAndFullWidthForms();
      expect(result).toContain('!');
      expect(result).toContain('！');
      expect(result).toContain(',');
      expect(result).toContain('，');
    });

    it('should be longer than either individual list', () => {
      const combined = getAllHalfAndFullWidthForms();
      const half = getAllHalfWidthForms();
      const full = getAllFullWidthForms();
      expect(combined.length).toBeGreaterThan(half.length);
      expect(combined.length).toBeGreaterThan(full.length);
    });
  });

  describe('fullWidthCharacterRules', () => {
    it('should have 10 digit mappings', () => {
      const digitRules = fullWidthCharacterRules.filter(([half]) => /^\d$/.test(half));
      expect(digitRules.length).toBe(10);
    });

    it('should have 26 uppercase letter mappings', () => {
      const upperRules = fullWidthCharacterRules.filter(([half]) => /^[A-Z]$/.test(half));
      expect(upperRules.length).toBe(26);
    });

    it('should have 26 lowercase letter mappings', () => {
      const lowerRules = fullWidthCharacterRules.filter(([half]) => /^[a-z]$/.test(half));
      expect(lowerRules.length).toBe(26);
    });

    it('should map digits correctly', () => {
      const zeroRule = fullWidthCharacterRules.find(([half]) => half === '0');
      expect(zeroRule).toBeDefined();
      expect(zeroRule![1]).toBe('０');

      const nineRule = fullWidthCharacterRules.find(([half]) => half === '9');
      expect(nineRule).toBeDefined();
      expect(nineRule![1]).toBe('９');
    });
  });
});
