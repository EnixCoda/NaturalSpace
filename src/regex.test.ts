import { regex } from './regex';

describe('regex builder', () => {
  describe('of', () => {
    it('should create a context from raw string', () => {
      expect(regex.of('abc')._()).toBe('abc');
    });

    it('should generate a regex with $', () => {
      const re = regex.of('abc').$();
      expect(re).toBeInstanceOf(RegExp);
      expect(re.source).toBe('abc');
      expect(re.flags).toBe('g');
    });

    it('should support custom flags', () => {
      const re = regex.of('abc').$('gi');
      expect(re.flags).toBe('gi');
    });
  });

  describe('rangeOf', () => {
    it('should create a character class', () => {
      expect(regex.rangeOf('abc')._()).toBe('[abc]');
    });

    it('should escape brackets inside range', () => {
      expect(regex.rangeOf('a[b]c')._()).toBe('[a\\[b\\]c]');
    });

    it('should escape leading hyphens', () => {
      expect(regex.rangeOf('-abc')._()).toBe('[\\-abc]');
    });
  });

  describe('rangeOutOf', () => {
    it('should create a negated character class', () => {
      expect(regex.rangeOutOf('abc')._()).toBe('[^abc]');
    });
  });

  describe('before (lookahead)', () => {
    it('should add a positive lookahead', () => {
      expect(regex.of('a').before('b')._()).toBe('a(?=b)');
    });

    it('should work with regex patterns', () => {
      const re = regex.of('[0-9]').before('[a-z]').$();
      expect('1a'.match(re)).not.toBeNull();
      expect('1A'.match(re)).toBeNull();
    });
  });

  describe('after (lookbehind)', () => {
    it('should add a positive lookbehind', () => {
      expect(regex.of('b').after('a')._()).toBe('(?<=a)b');
    });

    it('should work with regex patterns', () => {
      const re = regex.of('[0-9]').after('[a-z]').$();
      expect('a1'.match(re)).not.toBeNull();
      expect('A1'.match(re)).toBeNull();
    });
  });

  describe('nextTo', () => {
    it('should match when adjacent to pattern', () => {
      const pattern = regex.of('x').nextTo('[a-z]')._();
      expect(pattern).toContain('(?=');
    });

    it('should support bothSides option', () => {
      const pattern = regex.of('x').nextTo('[a-z]', { bothSides: true })._();
      expect(pattern).toContain('(?<=');
      expect(pattern).toContain('(?=');
    });

    it('should support allowEdge option', () => {
      const patternWithEdge = regex.of('x').nextTo('[a-z]', { allowEdge: true })._();
      expect(patternWithEdge).toContain('^');

      const patternWithoutEdge = regex.of('x').nextTo('[a-z]', { allowEdge: false })._();
      expect(patternWithoutEdge).not.toContain('^');
    });
  });

  describe('surroundBy', () => {
    it('should wrap pattern with prefix and suffix', () => {
      expect(regex.of('abc').surroundBy('"')._()).toBe('"abc"');
    });

    it('should support different prefix and suffix', () => {
      expect(regex.of('abc').surroundBy('(', ')')._()).toBe('(abc)');
    });
  });

  describe('between', () => {
    it('should place pattern between two others', () => {
      const result = regex.of('x').between('a', 'b')._();
      expect(result).toContain('a');
      expect(result).toContain('b');
      expect(result).toContain('x');
    });
  });

  describe('repeat', () => {
    it('should add * quantifier for min=0', () => {
      expect(regex.of('a').repeat(0)._()).toBe('a*?');
    });

    it('should add + quantifier for min=1', () => {
      expect(regex.of('a').repeat(1)._()).toBe('a+?');
    });

    it('should be greedy when aggressive=true', () => {
      expect(regex.of('a').repeat(0, true)._()).toBe('a*');
      expect(regex.of('a').repeat(1, true)._()).toBe('a+');
    });
  });

  describe('then', () => {
    it('should concatenate patterns', () => {
      expect(regex.of('a').then('b').then('c')._()).toBe('abc');
    });
  });

  describe('or', () => {
    it('should create alternation', () => {
      expect(regex.of('a').or('b')._()).toBe('a|b');
    });
  });

  describe('wrap', () => {
    it('should wrap in capturing group', () => {
      expect(regex.of('abc').wrap()._()).toBe('(abc)');
    });
  });

  describe('chaining', () => {
    it('should support complex chains', () => {
      const result = regex.of('[0-9]').wrap().before('[a-zA-Z]')._();
      expect(result).toBe('([0-9])(?=[a-zA-Z])');
    });

    it('should produce working regexes from chains', () => {
      const re = regex.of('[a-z]').wrap().before('[A-Z]').$();
      const match = 'aB'.match(re);
      expect(match).not.toBeNull();
      // With 'g' flag, match() returns all matches without capture groups
      expect(match![0]).toBe('a');
    });
  });
});
