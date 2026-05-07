/**
 * coverage-and-edge-cases.test.ts
 *
 * Two goals:
 * 1. Push branch coverage for processors that were below 90%
 * 2. Edge-case correctness for non-CJK/non-Latin scripts, URLs, and Markdown
 */

import { processInput } from './processInput';
import { processText } from './processText';

const t = (input: string, expected: string, preferences?: Preferences) => {
  const result = processText(input, preferences);
  expect(result).toEqual(expected);
  expect(processText(result, preferences)).toEqual(expected); // idempotency
};

const ti = (input: string, expected: string, preferences?: Preferences) => {
  const result = processInput(input, preferences);
  expect(result).toEqual(expected);
  expect(processInput(result, preferences)).toEqual(expected); // idempotency
};

// ─── 1. use_full_width_punctuation_around_CJK_characters — propagation guards ──
// These exercise the while-loop body (lines 50-53) that runs after the initial
// replace and guards against incorrect cascading conversions.

describe('coverage - fullwidth punct propagation guards', () => {
  it('propagation: digit guard — period after digit stays half-width', () => {
    // Initial pass converts comma; propagation re-checks period → digit guard fires
    t('你好,1.安装', '你好，1. 安装');
  });

  it('propagation: letter guard — abbreviation period stays half-width', () => {
    // Comma converts, propagation encounters Inc. before CJK → letter guard fires
    t('你好,Inc.好', '你好，Inc. 好');
  });

  it('propagation: U.S.A. abbreviation guard', () => {
    // Uppercase-prev AND prev-2-is-dot guard (line 50)
    t('你好,U.S.好', '你好，U.S. 好');
  });

  it('propagation: identifier guard — period between letter and letter/digit', () => {
    // v2.0 — period with letter before and digit after → identifier guard (line 52)
    t('你好,v2.0版', '你好，v2.0 版');
  });

  it('propagation: ellipsis guard — consecutive dots stay', () => {
    // .. adjacent to CJK stays as-is (ellipsis guard)
    t('你好,..好', '你好，..好');
  });

  it('propagation triggered by existing fullwidth char in input', () => {
    // 。 already present → propagation runs; , before CJK stays as 。 context
    t('你好。1.配置步骤', '你好。1. 配置步骤');
  });
});

// ─── 2. ensure_space_after_some_half_width_punctuations — branch coverage ───

describe('coverage - space after half-width punct, ALLCAPS branches', () => {
  it('ALLCAPS.UppercaseLetter — NOT a ticker (letter follows cap)', () => {
    // HELLO.World: afterCap='o' (letter) → guard false → split with space
    t('HELLO.World test', 'HELLO. World test');
  });

  it('ALLCAPS.UppercaseLetter where next is letter — split', () => {
    t('USA.Nat says', 'USA. Nat says');
  });

  it('stock ticker — ALLCAPS.SINGLECAP with non-letter following — stays', () => {
    // BABA.N followed by space/end → guard fires → no split
    t('Stock BABA.N closed up', 'Stock BABA.N closed up');
  });
});

// ─── 3. no_space_before_punctuations — branch coverage ──────────────────────

describe('coverage - no_space_before_punct branch paths', () => {
  it('$ preceded by alnum, not followed by alnum → strip space', () => {
    // prev='a' (alnum), afterNext=',' (non-alnum) → falls through → strip
    t('a $,后', 'a$，后');
  });

  it('$ at start of string or after non-alnum → preserve space', () => {
    // prev=undefined (start of string), afterNext non-alnum → preserve
    t('$ 后面', '$ 后面');
  });

  it('/ not after alnum (CJK before slash) → strip space', () => {
    // prev='前'(CJK, not alnum) → guard does not fire → strip
    t('前 /api', '前/api');
  });

  it('/ after alnum (letter before slash) → preserve space', () => {
    // prev='T'(letter, alnum) → guard fires → preserve
    t('调用GET /api接口', '调用 GET /api 接口');
  });

  it('dash followed by digit → strip space before dash', () => {
    // afterDash='5' (digit, not ' ' or letter) → falls through → strip
    // (other processors re-add spacing as negative number context)
    t('前 -5后', '前 -5 后');
  });

  it('dash followed by space → preserve space before dash', () => {
    // afterDash=' ' → line 32 fires → preserve
    t('前 - 後', '前 - 後');
  });

  it('dash followed by letter → preserve space before dash', () => {
    // afterDash='V' → line 35 fires → preserve
    t('陳 -Vinta', '陳 - Vinta');
  });
});

// ─── 4. Non-CJK/non-Latin scripts near CJK ──────────────────────────────────

describe('edge cases - non-CJK/non-Latin scripts', () => {
  it('Thai script between CJK and Latin — no spaces added', () => {
    // Thai (U+0E00-U+0E7F) is neither CJK nor Latin-like
    // Current behavior: no automatic spacing at script boundaries
    t('中文สวัสดีEnglish', '中文สวัสดีEnglish');
  });

  it('Arabic script near CJK — no spaces added', () => {
    t('中文مرحباEnglish', '中文مرحباEnglish');
  });

  it('Hebrew script near CJK — no spaces added', () => {
    t('中文שלוםEnglish', '中文שלוםEnglish');
  });

  it('Thai-only text stays unchanged', () => {
    t('สวัสดีครับ', 'สวัสดีครับ');
  });

  it('Arabic-only text stays unchanged', () => {
    t('مرحبا بالعالم', 'مرحبا بالعالم');
  });

  it('CJK with Thai then Latin: CJK→Thai boundary not spaced', () => {
    t('你好สวัสดีworld', '你好สวัสดีworld');
  });

  it('Korean Hangul mixed with CJK — treated same as CJK', () => {
    // Hangul is in CJK range, so spacing rules apply
    t('한국어와中文', '한국어와中文');
  });

  it('Korean Hangul + Latin spacing', () => {
    t('한국어Hello', '한국어 Hello');
  });
});

// ─── 5. URL handling ─────────────────────────────────────────────────────────

describe('edge cases - URL handling via processInput', () => {
  it('URL between CJK text is preserved intact', () => {
    ti('点击http://foo.com/path?q=中文查看', '点击 http://foo.com/path?q=中文查看');
  });

  it('HTTPS URL preserved', () => {
    ti('访问https://example.com了解更多', '访问 https://example.com 了解更多');
  });

  it('mailto: URL preserved', () => {
    ti('邮件mailto:user@example.com联系', '邮件 mailto:user@example.com 联系');
  });

  it('URL with query params and hash preserved', () => {
    ti(
      '参考https://docs.example.com/guide?lang=zh#section的说明',
      '参考 https://docs.example.com/guide?lang=zh#section 的说明',
    );
  });

  it('multiple URLs in text', () => {
    ti(
      '从https://a.com下载并访问https://b.com',
      '从 https://a.com 下载并访问 https://b.com',
    );
  });
});

// ─── 6. Markdown-style formatting preservation ───────────────────────────────

describe('edge cases - markdown-style text', () => {
  it('bold markers ** preserved around CJK', () => {
    t('**加粗**文本', '**加粗**文本');
  });

  it('italic markers * preserved', () => {
    t('*斜体*文本', '*斜体*文本');
  });

  it('heading # marker preserved', () => {
    t('# 标题 Title', '# 标题 Title');
  });

  it('inline code backtick pairs get spacing from adjacent CJK', () => {
    t('运行`npm install`命令', '运行 `npm install` 命令');
  });

  it('markdown link text preserved', () => {
    t('点击[链接](url)查看', '点击[链接](url)查看');
  });

  it('markdown image syntax preserved', () => {
    // ![ should not trigger the ! → ！ conversion
    t('图片![alt](url)', '图片![alt](url)');
  });

  it('code fence markers unchanged', () => {
    t('代码如下：```python', '代码如下：```python');
  });

  it('multiple backtick inline codes in one sentence', () => {
    t('用`git add`和`git commit`提交', '用 `git add` 和 `git commit` 提交');
  });
});

// ─── 7. processInput chunk-boundary spacing ──────────────────────────────────

describe('edge cases - processInput chunk boundaries', () => {
  it('CJK→URL→CJK: no stray spaces injected', () => {
    ti('前往https://example.com查看详情', '前往 https://example.com 查看详情');
  });

  it('plain Latin URL with no CJK', () => {
    ti('Visit https://example.com for details', 'Visit https://example.com for details');
  });

  it('URL immediately at start of input', () => {
    ti('https://example.com是好网站', 'https://example.com 是好网站');
  });

  it('URL at end of input', () => {
    ti('好网站是https://example.com', '好网站是 https://example.com');
  });
});

// ─── 8. processText vs processInput diff for URL content ─────────────────────

describe('edge cases - processText breaks URLs, processInput preserves', () => {
  it('processInput preserves URL up to space; & after space-in-URL still gets spaced', () => {
    // URLs with spaces are split — only the part up to the first space is protected.
    // & in the unprotected suffix gets spaced by ensure_space_around_some_half_width_punctuations.
    const raw = '查询https://search.example.com?q=hello world&lang=zh结果';
    const result = processInput(raw);
    // The URL portion before the space is preserved
    expect(result).toContain('https://search.example.com?q=hello world');
    // The & after the space-break gets spaced (not inside URL protection)
    expect(result).toContain(' & ');
  });

  it('processInput preserves URL without spaces completely intact', () => {
    // Well-formed URLs (no spaces) are protected from reformatting
    const raw = '查询https://search.example.com?q=hello&lang=zh结果';
    const result = processInput(raw);
    expect(result).toContain('https://search.example.com?q=hello&lang=zh');
  });
});
