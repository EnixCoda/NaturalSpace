import { splitByPattern } from './splitByPattern';

describe('splitByPattern - URL detection', () => {
  it('should detect https URLs', () => {
    expect(splitByPattern('https://example.com')).toEqual([['https://example.com', 'ignore']]);
  });

  it('should detect http URLs', () => {
    expect(splitByPattern('http://example.com')).toEqual([['http://example.com', 'ignore']]);
  });

  it('should detect URLs with paths', () => {
    const result = splitByPattern('https://example.com/path/to/page');
    expect(result).toEqual([['https://example.com/path/to/page', 'ignore']]);
  });

  it('should detect URLs with query params', () => {
    const result = splitByPattern('https://example.com/search?q=hello&lang=en');
    expect(result).toEqual([['https://example.com/search?q=hello&lang=en', 'ignore']]);
  });

  it('should detect URLs with fragments', () => {
    const result = splitByPattern('https://example.com/page#section');
    expect(result).toEqual([['https://example.com/page#section', 'ignore']]);
  });

  it('should detect bare domain names', () => {
    expect(splitByPattern('apple.com')).toEqual([['apple.com', 'ignore']]);
    expect(splitByPattern('www.apple.com')).toEqual([['www.apple.com', 'ignore']]);
  });

  it('should detect localhost URLs', () => {
    expect(splitByPattern('http://localhost')).toEqual([['http://localhost', 'ignore']]);
    expect(splitByPattern('https://localhost')).toEqual([['https://localhost', 'ignore']]);
  });

  it('should detect IP addresses', () => {
    expect(splitByPattern('1.1.1.1')).toEqual([['1.1.1.1', 'ignore']]);
    expect(splitByPattern('127.0.0.1')).toEqual([['127.0.0.1', 'ignore']]);
    expect(splitByPattern('192.168.0.1')).toEqual([['192.168.0.1', 'ignore']]);
    expect(splitByPattern('10.0.0.255')).toEqual([['10.0.0.255', 'ignore']]);
  });
});

describe('splitByPattern - text with URLs', () => {
  it('should split text before URL', () => {
    const result = splitByPattern('visit https://example.com');
    expect(result).toEqual([
      ['visit ', 'nomatch'],
      ['https://example.com', 'ignore'],
    ]);
  });

  it('should split text after URL', () => {
    const result = splitByPattern('https://example.com is great');
    expect(result).toEqual([
      ['https://example.com', 'ignore'],
      [' is great', 'nomatch'],
    ]);
  });

  it('should split text around URL', () => {
    const result = splitByPattern('visit https://example.com today');
    expect(result).toEqual([
      ['visit ', 'nomatch'],
      ['https://example.com', 'ignore'],
      [' today', 'nomatch'],
    ]);
  });

  it('should handle multiple URLs', () => {
    const result = splitByPattern('go to https://site-a.com or https://site-b.com');
    // Should be: text, url, text, url
    const ignoreChunks = result.filter(([, p]) => p === 'ignore');
    expect(ignoreChunks.length).toBe(2);
  });

  it('should handle CJK text around URL', () => {
    const result = splitByPattern('访问https://example.com获取信息');
    expect(result.length).toBe(3);
    expect(result[0]).toEqual(['访问', 'nomatch']);
    expect(result[1][1]).toBe('ignore');
    expect(result[2]).toEqual(['获取信息', 'nomatch']);
  });
});

describe('splitByPattern - plain text', () => {
  it('should return entire text as nomatch when no URL present', () => {
    expect(splitByPattern('Hello World')).toEqual([['Hello World', 'nomatch']]);
    expect(splitByPattern('你好世界')).toEqual([['你好世界', 'nomatch']]);
  });

  it('should handle empty string', () => {
    expect(splitByPattern('')).toEqual([]);
  });

  it('should handle text with numbers that are not IPs', () => {
    // Single digit groups separated by dots but not matching IP pattern well
    expect(splitByPattern('version 3.0')).toEqual([['version 3.0', 'nomatch']]);
  });
});

describe('splitByPattern - edge cases', () => {
  it('should handle URL at start of text', () => {
    const result = splitByPattern('https://example.com是一个网站');
    expect(result[0][1]).toBe('ignore');
    expect(result[1][1]).toBe('nomatch');
  });

  it('should handle URL at end of text', () => {
    const result = splitByPattern('网站地址是https://example.com');
    expect(result[0][1]).toBe('nomatch');
    expect(result[1][1]).toBe('ignore');
  });

  it('should handle adjacent URLs', () => {
    const result = splitByPattern('https://alpha.com https://beta.com');
    const ignoreChunks = result.filter(([, p]) => p === 'ignore');
    expect(ignoreChunks.length).toBe(2);
  });
});
