import { processText } from './processText';

// Helper: assert idempotency (running twice should produce same output)
const t = (input: string, expected: string, preferences?: Preferences) => {
  const result = processText(input, preferences);
  expect(result).toEqual(expected);
  expect(processText(result, preferences)).toEqual(expected);
};

describe('processText - CJK and Latin spacing', () => {
  it('should add space between Chinese and English', () => {
    t('中文English中文', '中文 English 中文');
  });

  it('should add space between Chinese and single letter', () => {
    t('使用A方案', '使用 A 方案');
  });

  it('should handle camelCase words adjacent to CJK', () => {
    t('使用iPhone拍照', '使用 iPhone 拍照');
    t('下载macOS系统', '下载 macOS 系统');
  });

  it('should handle abbreviations adjacent to CJK', () => {
    t('这是HTML标签', '这是 HTML 标签');
    t('使用CSS样式', '使用 CSS 样式');
    t('安装SDK之后', '安装 SDK 之后');
  });

  it('should handle mixed Japanese and English', () => {
    t('これはTestです', 'これは Test です');
    t('Appleの製品', 'Apple の製品');
  });

  it('should handle mixed Korean and English', () => {
    t('이것은Test입니다', '이것은 Test 입니다');
    t('Apple의제품', 'Apple 의제품');
  });

  it('should not split dotted identifiers like React.js adjacent to CJK', () => {
    t('使用React.js开发', '使用 React.js 开发');
    t('打开index.html文件', '打开 index.html 文件');
    t('使用console.log调试', '使用 console.log 调试');
    t('安装node.js环境', '安装 node.js 环境');
    t('修改vue.config.js配置', '修改 vue.config.js 配置');
  });
});

describe('processText - CJK and digit spacing', () => {
  it('should add space between Chinese and digits', () => {
    t('第3章', '第 3 章');
    t('共10人', '共 10 人');
    t('2023年', '2023 年');
  });

  it('should handle decimal numbers', () => {
    t('花了3.5元', '花了 3.5 元');
  });

  it('should handle large numbers', () => {
    t('超过10000次', '超过 10000 次');
  });

  it('should handle dates', () => {
    t('2023年12月25日', '2023 年 12 月 25 日');
  });

  it('should handle version numbers', () => {
    t('版本v2更新', '版本 v2 更新');
  });
});

describe('processText - full-width punctuation conversion', () => {
  it('should convert comma to full-width around CJK', () => {
    t('你好,世界', '你好，世界');
  });

  it('should convert period to full-width around CJK', () => {
    t('结束了.', '结束了。');
  });

  it('should convert exclamation mark to full-width around CJK', () => {
    t('太好了!', '太好了！');
  });

  it('should convert question mark to full-width around CJK', () => {
    t('真的吗?', '真的吗？');
  });

  it('should convert colon to full-width around CJK', () => {
    t('注意:重要', '注意：重要');
  });

  it('should convert semicolon to full-width around CJK', () => {
    t('第一;第二', '第一；第二');
  });

  it('should not convert punctuation in pure English', () => {
    t('Hello, World!', 'Hello, World!');
    t('What? Really.', 'What? Really.');
  });

  it('should convert full-width punctuation back to half-width in pure English', () => {
    t('Hello，World', 'Hello, World');
    t('The end。', 'The end.');
  });

  it('should convert all repeated ! and ? to full-width', () => {
    t('太好了!!', '太好了！！');
    t('真的吗??', '真的吗？？');
    t('什么!?', '什么！？');
  });

  it('should convert period after full-width brackets to full-width', () => {
    t('读《书》.', '读《书》。');
  });
});

describe('processText - brackets and parentheses', () => {
  it('should convert half-width brackets to full-width when containing CJK', () => {
    t('(苹果)', '（苹果）');
    t('(记者张三)', '（记者张三）');
  });

  it('should keep half-width brackets for pure English content', () => {
    t('(Apple)', '(Apple)');
    t('(see also)', '(see also)');
  });

  it('should handle mixed content in brackets', () => {
    t('(苹果Apple)', '（苹果 Apple）');
  });

  it('should add space before left bracket', () => {
    t('Apple(苹果)', 'Apple（苹果）');
  });

  it('should handle CJK book title marks', () => {
    t('《三体》', '《三体》');
    t('《三体》是好书', '《三体》是好书');
  });

  it('should add space before ( when CJK precedes non-CJK content', () => {
    t('苹果(Apple)', '苹果 (Apple)');
    t('Apple(苹果)公司', 'Apple（苹果）公司');
  });

  it('should not add extra space inside full-width brackets', () => {
    t('（测试）', '（测试）');
  });

  it('should add space after ) before CJK', () => {
    t('iPhone(US)中文版', 'iPhone (US) 中文版');
    // Full pipeline: space before ( added by ensure_space_before_left_brackets, space after ) added by CJK spacing
  });

  it('should add space before negative numbers and after unit before CJK', () => {
    t('温度为-1度', '温度为 -1 度');
    t('跌幅为-5%增长', '跌幅为 -5% 增长');
  });
});

describe('processText - quotes', () => {
  it('should handle quotes with CJK content (default preference uses curly quotes)', () => {
    t('"你好"', '\u201c你好\u201d');
  });

  it('should use straight quotes when preference is set', () => {
    t('"你好"', '「你好」', { useStraightQuotesForCJK: true });
  });

  it('should not convert quotes with pure English content', () => {
    t('"Hello"', '"Hello"', { useStraightQuotesForCJK: true });
  });

  it('should handle quotes with mixed content (curly quotes by default)', () => {
    t('"苹果Apple"', '\u201c苹果 Apple\u201d');
  });
});

describe('processText - half-width inside CJK brackets', () => {
  it('should use half-width punctuation inside 《》 for English content', () => {
    t(
      '《Hackers＆Painters：Big Ideas from the Computer Age》',
      '《Hackers & Painters: Big Ideas from the Computer Age》'
    );
  });

  it('should convert full-width symbols inside 《》 without CJK', () => {
    t('《Vision，the key to the future》', '《Vision, the key to the future》');
  });

  it('should keep full-width punctuation inside 《》 with CJK', () => {
    t('《你好，世界》', '《你好，世界》');
  });
});

describe('processText - units and numbers', () => {
  it('should add space between number and letter unit', () => {
    t('10Gbps的网速', '10 Gbps 的网速');
    t('有20TB空间', '有 20 TB 空间');
    t('100MHz频率', '100 MHz 频率');
  });

  it('should not add space before % sign', () => {
    t('15%的增长', '15% 的增长');
    t('提升了50%', '提升了 50%');
  });

  it('should not add space before ° sign', () => {
    t('角度为90°', '角度为 90°');
    t('旋转180°', '旋转 180°');
  });

  it('should add space after % before CJK', () => {
    t('增长50%以上', '增长 50% 以上');
  });

  it('should not split single-letter suffix abbreviations adjacent to CJK', () => {
    t('4K屏幕', '4K 屏幕');
    t('1080p分辨率', '1080p 分辨率');
    t('最新版本v2.0beta发布', '最新版本 v2.0beta 发布');
  });
});

describe('processText - space normalization', () => {
  it('should remove spaces between CJK characters', () => {
    t('你 好 世 界', '你好世界');
  });

  it('should collapse multiple spaces to one between English words', () => {
    t('Hello    World', 'Hello World');
  });

  it('should preserve line breaks', () => {
    t('第一行\n第二行', '第一行\n第二行');
  });

  it('should preserve indentation (processText works on content, not standalone leading space)', () => {
    // processText processes inline — leading-only spaces before CJK are not preserved
    // because the "no space between CJK" rule strips them
    t('    Hello World', '    Hello World');
  });

  it('should remove space before full-width punctuation', () => {
    t('你好 ，世界', '你好，世界');
    t('结束 。', '结束。');
  });

  it('should remove space after full-width punctuation', () => {
    t('你好，  世界', '你好，世界');
  });
});

describe('processText - ampersand and special characters', () => {
  it('should not split all-uppercase abbreviations at &', () => {
    t('A&B', 'A&B'); // all-uppercase → abbreviation, no split
    t('R&D', 'R&D'); // all-uppercase → abbreviation, no split
  });

  it('should not split all-uppercase && abbreviations', () => {
    t('A&&B', 'A&&B'); // all-uppercase → no split
  });

  it('should not split all-uppercase abbreviations at & when adjacent to CJK', () => {
    t('R&D部门', 'R&D 部门');
    t('AT&T公司', 'AT&T 公司');
  });
});

describe('processText - full-width digit conversion', () => {
  it('should convert full-width digits to half-width', () => {
    t('０１２３４５６７８９', '0123456789');
  });

  it('should convert full-width digits in context', () => {
    t('第３章', '第 3 章');
    t('花了５０元', '花了 50 元');
  });

  it('should convert full-width letters to half-width', () => {
    t('使用ＡＢＣ方案', '使用 ABC 方案');
  });
});

describe('processText - comma after half-width punctuation in English', () => {
  it('should add space after comma between English words', () => {
    t('Hello,Tim', 'Hello, Tim');
  });

  it('should add space after period between English words', () => {
    t('End.Start', 'End. Start');
  });

  it('should not double-space', () => {
    t('Hello, Tim', 'Hello, Tim');
  });

  it('should handle multiple commas', () => {
    // The rule requires [a-z] before the punctuation to trigger
    t('aa,bb,cc', 'aa, bb, cc');
  });
});

describe('processText - edge cases', () => {
  it('should handle empty string', () => {
    t('', '');
  });

  it('should handle single character', () => {
    t('a', 'a');
    t('你', '你');
    t('1', '1');
  });

  it('should handle pure English text unchanged', () => {
    t('Hello World', 'Hello World');
    t('This is a test.', 'This is a test.');
  });

  it('should handle pure CJK text unchanged', () => {
    t('你好世界', '你好世界');
    t('こんにちは', 'こんにちは');
  });

  it('should handle pure digits unchanged', () => {
    t('12345', '12345');
  });

  it('should handle hyphenated words', () => {
    t('key-value的数据', 'key-value 的数据');
  });

  it('should handle underscore in words', () => {
    t('Hello_Tim', 'Hello_Tim');
    t('my_variable的值', 'my_variable 的值');
  });

  it('should handle multiple sentences', () => {
    t(
      '第一句话.第二句话.',
      '第一句话。第二句话。'
    );
  });

  it('should preserve ASCII ellipsis', () => {
    t('等等...', '等等...');
    t('嗯...好吧', '嗯...好吧');
  });

  it('should preserve markdown link syntax', () => {
    t('点击[链接](url)查看', '点击[链接](url)查看');
    t('使用`console.log`调试', '使用 `console.log` 调试');
  });
});

describe('processText - real-world scenarios', () => {
  it('should format tech article text', () => {
    t(
      '使用React18和TypeScript开发Web应用',
      '使用 React18 和 TypeScript 开发 Web 应用'
    );
  });

  it('should format product description', () => {
    t(
      '新款MacBook Pro配备M2芯片,性能提升20%',
      '新款 MacBook Pro 配备 M2 芯片，性能提升 20%'
    );
  });

  it('should format news text', () => {
    t(
      '据CNN报道,该公司今年营收超过100亿美元.',
      '据 CNN 报道，该公司今年营收超过 100 亿美元。'
    );
  });

  it('should format academic text', () => {
    t(
      '根据IEEE标准,WiFi6的理论速度可达9.6Gbps',
      '根据 IEEE 标准，WiFi6 的理论速度可达 9.6 Gbps'
    );
  });

  it('should format game-related text', () => {
    t(
      '这款游戏需要16GB内存和RTX3080显卡.',
      '这款游戏需要 16 GB 内存和 RTX3080 显卡。'
    );
  });

  it('should format app store description', () => {
    t(
      '下载量超过1000万次,评分4.8分(满分5分).',
      '下载量超过 1000 万次，评分 4.8 分（满分 5 分）。'
    );
  });

  it('should handle programming context', () => {
    t(
      '使用npm install安装依赖包.',
      '使用 npm install 安装依赖包。'
    );
  });

  it('should handle social media text', () => {
    t(
      '今天去了Apple Store买了一台iPhone15 Pro Max,花了9999元!',
      '今天去了 Apple Store 买了一台 iPhone15 Pro Max，花了 9999 元！'
    );
  });
});

describe('processText - idempotency', () => {
  const cases = [
    '你好 World',
    '使用 React 开发',
    '花了 5000 元',
    '10 Gbps 网速',
    '提升 20% 以上',
    '《Hackers & Painters: Big Ideas from the Computer Age》',
    '（记者张三）报道',
    'Hello, World!',
    '你好，世界！',
  ];

  it('should produce stable output on repeated application', () => {
    for (const input of cases) {
      const once = processText(input);
      const twice = processText(once);
      const thrice = processText(twice);
      expect(twice).toEqual(once);
      expect(thrice).toEqual(once);
    }
  });
});

describe('processText - multiline', () => {
  it('should handle multiline text preserving newlines', () => {
    t(
      `第一行text\n第二行text`,
      `第一行 text\n第二行 text`
    );
  });

  it('should preserve empty lines', () => {
    t(
      `第一段\n\n第二段`,
      `第一段\n\n第二段`
    );
  });
});
