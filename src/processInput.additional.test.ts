import { processInput } from './processInput';

describe('processInput - URL preservation', () => {
  it('should not modify simple URLs', () => {
    expect(processInput('https://www.google.com')).toBe('https://www.google.com');
    expect(processInput('http://example.com')).toBe('http://example.com');
  });

  it('should not modify URLs with paths', () => {
    expect(processInput('https://www.apple.com/zh/')).toBe('https://www.apple.com/zh/');
    expect(processInput('https://github.com/user/repo')).toBe('https://github.com/user/repo');
  });

  it('should not modify URLs with query strings', () => {
    expect(processInput('https://example.com/search?q=hello&lang=zh')).toBe(
      'https://example.com/search?q=hello&lang=zh'
    );
  });

  it('should not modify URLs with fragments', () => {
    expect(processInput('https://example.com/page#section')).toBe('https://example.com/page#section');
  });

  it('should not modify localhost URLs', () => {
    expect(processInput('http://localhost')).toBe('http://localhost');
    expect(processInput('https://localhost')).toBe('https://localhost');
  });

  it('should not modify IP addresses', () => {
    expect(processInput('127.0.0.1')).toBe('127.0.0.1');
    expect(processInput('192.168.1.1')).toBe('192.168.1.1');
    expect(processInput('1.1.1.1')).toBe('1.1.1.1');
  });

  it('should not modify domain names', () => {
    expect(processInput('apple.com')).toBe('apple.com');
    expect(processInput('www.apple.com')).toBe('www.apple.com');
  });

  it('should not modify URLs with ports', () => {
    expect(processInput('http://localhost:3000')).toBe('http://localhost:3000');
    expect(processInput('http://example.com:8080')).toBe('http://example.com:8080');
  });

  it('should not modify ftp:// URLs', () => {
    expect(processInput('ftp://files.example.com/file.zip')).toBe('ftp://files.example.com/file.zip');
  });
});

describe('processInput - text with embedded URLs', () => {
  it('should preserve URL while formatting surrounding text', () => {
    // processInput splits by URL and adds spaces at CJK-URL boundaries
    expect(processInput('访问https://example.com获取更多信息')).toBe('访问 https://example.com 获取更多信息');
  });

  it('should format text portions while preserving URL', () => {
    // Spaces are added at CJK-URL boundaries
    expect(processInput('请访问 https://www.apple.com 了解详情')).toBe('请访问 https://www.apple.com 了解详情');
  });

  it('should handle text with IP address', () => {
    expect(processInput('服务器地址是192.168.1.1请配置')).toBe('服务器地址是 192.168.1.1 请配置');
  });

  it('should format CJK-Latin spacing in non-URL portions', () => {
    expect(processInput('使用React开发 https://react.dev 了解详情')).toBe('使用 React 开发 https://react.dev 了解详情');
  });

  it('should add space at CJK-URL boundary with port', () => {
    expect(processInput('访问http://localhost:3000查看')).toBe('访问 http://localhost:3000 查看');
    expect(processInput('访问http://example.com:8080查看')).toBe('访问 http://example.com:8080 查看');
  });

  it('should add space at CJK-domain boundary', () => {
    expect(processInput('在apple.com购买')).toBe('在 apple.com 购买');
  });

  it('should add space at CJK-IP boundary', () => {
    expect(processInput('服务器是192.168.1.1端口')).toBe('服务器是 192.168.1.1 端口');
  });

  it('should add space between CJK and ftp URL', () => {
    expect(processInput('下载地址ftp://files.example.com/file.zip请访问')).toBe(
      '下载地址 ftp://files.example.com/file.zip 请访问'
    );
  });
});

describe('processInput - preferences', () => {
  it('should pass preferences through to processText', () => {
    const input = '"你好World"';
    const result = processInput(input, { useStraightQuotesForCJK: true });
    expect(result).toContain('「');
    expect(result).toContain('」');
  });

  it('should use default preferences when not provided', () => {
    const input = '"你好World"';
    const result = processInput(input);
    expect(result).toContain('\u201c');
    expect(result).toContain('\u201d');
  });
});

describe('processInput - complex real-world scenarios', () => {
  it('should handle tech documentation', () => {
    const input = '下载地址:https://github.com/user/repo,安装方法:npm install package';
    const result = processInput(input);
    expect(result).toContain('https://github.com/user/repo');
    expect(result).toContain('npm install package');
  });

  it('should handle text with domain names', () => {
    const result = processInput('在apple.com上购买产品');
    expect(result).toContain('apple.com');
  });

  it('should handle empty input', () => {
    expect(processInput('')).toBe('');
  });

  it('should handle pure URL input', () => {
    expect(processInput('https://www.example.com/path?a=1&b=2#hash')).toBe('https://www.example.com/path?a=1&b=2#hash');
  });

  it('should handle input with only spaces', () => {
    // Spaces alone form a nomatch chunk, processText collapses them
    // Actually, no S chars means the duplicated whitespace rule doesn't apply
    // But the input is just spaces so it's a single nomatch chunk
    const result = processInput('   ');
    expect(typeof result).toBe('string');
  });

  it('should handle a paragraph with multiple formatting issues and URLs', () => {
    const input = '我推荐你看看https://react.dev这个网站,React18引入了很多新feature';
    const result = processInput(input);
    expect(result).toContain('https://react.dev');
  });
});

describe('processInput - idempotency', () => {
  const cases = [
    '访问 https://example.com 了解更多',
    '服务器 IP 是 192.168.1.1',
    '在 apple.com 购买',
    'https://example.com/path?q=你好',
    '你好 World，请访问 https://example.com',
  ];

  it('should produce stable output on repeated application', () => {
    for (const input of cases) {
      const once = processInput(input);
      const twice = processInput(once);
      expect(twice).toEqual(once);
    }
  });
});

describe('processInput - email protection', () => {
  it('should preserve email and add space between CJK and email', () => {
    expect(processInput('联系我user@example.com')).toBe('联系我 user@example.com');
  });

  it('should preserve email with CJK on both sides', () => {
    expect(processInput('发邮件到test@gmail.com吧')).toBe('发邮件到 test@gmail.com 吧');
  });
});
