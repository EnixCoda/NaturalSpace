import { processText } from './processText';
import { processInput } from './processInput';

/**
 * Tests derived from pangu.js's exhaustive per-symbol test suite and
 * autocorrect's real-world formatting fixtures.
 *
 * Sources:
 *   https://github.com/vinta/pangu.js/tree/master/tests/shared
 *   https://github.com/huacnlee/autocorrect/tree/main/autocorrect/src/rule
 *
 * The goal is to cover every symbol type that appears near CJK text, using
 * the same concrete examples the upstream projects use.
 */

const t = (input: string, expected: string, preferences?: Preferences) => {
  const result = processText(input, preferences);
  expect(result).toEqual(expected);
  expect(processText(result, preferences)).toEqual(expected); // idempotency
};

const ti = (input: string, expected: string, preferences?: Preferences) => {
  const result = processInput(input, preferences);
  expect(result).toEqual(expected);
  expect(processInput(result, preferences)).toEqual(expected);
};

// ─── 1. CJK ↔ alphabets & numbers (pangu.js cjk-alphabets-numbers) ──

describe('pangu-derived - CJK and alphabets/numbers', () => {
  it('single char: CJK + letter', () => {
    t('中a', '中 a');
    t('a中', 'a 中');
  });

  it('single char: CJK + digit', () => {
    t('1中', '1 中');
    t('中1', '中 1');
  });

  it('alpha + digit near CJK', () => {
    t('中a1', '中 a1');
    t('a1中', 'a1 中');
    t('a中1', 'a 中 1');
    t('1中a', '1 中 a');
  });

  it('multi-char alphabets', () => {
    t('中文abc', '中文 abc');
    t('abc中文', 'abc 中文');
  });

  it('multi-char numbers', () => {
    t('中文123', '中文 123');
    t('123中文', '123 中文');
  });

  // pangu.js: Latin-1 Supplement (Ø, Ñ, é, etc.)
  it('Latin-1 Supplement chars adjacent to CJK', () => {
    t('中文Ø漢字', '中文 Ø 漢字');
    t('中文 Ø 漢字', '中文 Ø 漢字'); // already spaced
  });

  // pangu.js: Greek letters
  it('Greek letters adjacent to CJK — BUG: no space added', () => {
    // BUG: β (U+03B2) is outside the extended Latin range [a-zA-Z\u00C0-\u024F]
    //      Greek block starts at U+0370 — not covered
    t('中文β漢字', '中文 β 漢字');
    t('我是α，我是Ω', '我是 α，我是 Ω');
  });

  // pangu.js: Roman numerals (Number Forms block)
  it('Roman numerals adjacent to CJK — BUG: no space added', () => {
    // BUG: Ⅶ (U+2166, Number Forms block U+2150-U+218F) not in CJK range
    t('中文Ⅶ漢字', '中文 Ⅶ 漢字');
  });

  // pangu.js: Hiragana adjacent to Latin
  it('Hiragana adjacent to Latin', () => {
    t('abcあ123', 'abc あ 123');
  });

  // pangu.js: Katakana adjacent to Latin
  it('Katakana adjacent to Latin', () => {
    t('abcア123', 'abc ア 123');
  });

  // pangu.js: Bopomofo adjacent to Latin
  it('Bopomofo adjacent to Latin', () => {
    t('abcㄅ123', 'abc ㄅ 123');
  });
});

// ─── 2. Symbol `-` (minus / hyphen) ─────────────────────────────────

describe('pangu-derived - dash/hyphen symbol', () => {
  it('CJK-dash-CJK — NaturalSpace keeps dash as-is (pangu.js adds spaces)', () => {
    // Design difference: NaturalSpace does not add spaces around dash between CJK.
    // pangu.js would produce '前面 - 後面', but NaturalSpace leaves it unchanged.
    t('前面-後面', '前面-後面');
  });

  it('pure Latin hyphen → no change', () => {
    t('Vinta-Mollie', 'Vinta-Mollie');
  });

  it('Latin-dash-CJK — BUG: no space added', () => {
    // BUG: NaturalSpace does not add space before CJK after dash
    t('Vinta-陳上進', 'Vinta - 陳上進');
  });

  it('CJK-dash-Latin — BUG: only space before dash, not after', () => {
    // BUG: '陳上進-Vinta' → '陳上進 -Vinta' (space before dash but not after)
    // Should be either '陳上進-Vinta' (no change) or '陳上進 - Vinta' (full spacing)
    t('陳上進-Vinta', '陳上進 - Vinta');
  });

  it('letter range A-B in CJK sentence — BUG: no spaces around dash', () => {
    // BUG: 'A-B' inside CJK context should get spaces: 'A - B'
    t('得到一個A-B的結果', '得到一個 A - B 的結果');
  });

  it('compound words inside CJK sentence stay hyphenated', () => {
    t(
      '這間公司提供了一套state-of-the-art的real-time系統',
      '這間公司提供了一套 state-of-the-art 的 real-time 系統',
    );
  });

  it('AI model names with hyphens next to CJK', () => {
    t('Anthropic的claude-4-opus模型', 'Anthropic 的 claude-4-opus 模型');
    t('OpenAI的o3-pro模型', 'OpenAI 的 o3-pro 模型');
    t('OpenAI的gpt-4o模型', 'OpenAI 的 gpt-4o 模型');
    t('OpenAI的GPT-5模型', 'OpenAI 的 GPT-5 模型');
    t('Google的gemini-2.5-pro模型', 'Google 的 gemini-2.5-pro 模型');
  });

  it('already spaced — no change', () => {
    t('前面 - 後面', '前面 - 後面');
    t('陳上進 - Vinta', '陳上進 - Vinta');
  });
});

// ─── 3. Symbol `,` (comma) ──────────────────────────────────────────

describe('pangu-derived - comma symbol', () => {
  it('comma between two CJK chars → convert to fullwidth', () => {
    // NaturalSpace converts comma near CJK to ，
    t('前面,後面', '前面，後面');
  });

  it('comma in pure English text → add space after', () => {
    t('Hello,World', 'Hello, World');
  });
});

// ─── 4. Symbol `:` (colon) ──────────────────────────────────────────

describe('pangu-derived - colon symbol', () => {
  it('CJK colon CJK → convert to full-width', () => {
    t('前面:後面', '前面：後面');
  });

  it('CJK colon number → convert to full-width', () => {
    t('電話:123456789', '電話：123456789');
  });

  it('letter colon letter stays half-width (not before digit)', () => {
    // Colon in pure Latin only fires after a letter per current rules
    t('前面:I have no idea後面', '前面：I have no idea 後面');
  });

  it('time format — colon must NOT get space', () => {
    t('Time is 14:30 now', 'Time is 14:30 now');
  });

  it('docker image tag — colon must NOT get space', () => {
    t('拉取node:18-alpine镜像', '拉取 node:18-alpine 镜像'); // BUG: currently gets space
  });

  it('ratio — colon must NOT get space', () => {
    t('屏幕比例为16:9', '屏幕比例为 16:9');
  });
});

// ─── 5. Symbol `!` (exclamation) ────────────────────────────────────

describe('pangu-derived - exclamation mark', () => {
  it('CJK ! end-of-string → convert to fullwidth', () => {
    t('前面!', '前面！');
  });

  it('CJK !! → convert both', () => {
    t('前面!!', '前面！！');
  });

  it('CJK ! CJK → convert, no space', () => {
    t('前面!後面', '前面！後面');
  });

  it('CJK ! latin → convert, add space after', () => {
    t('前面!abc', '前面！abc');
  });

  it('already fullwidth — no change', () => {
    t('前面！後面', '前面！後面');
  });
});

// ─── 6. Symbol `@` (at sign) ────────────────────────────────────────

describe('pangu-derived - at sign', () => {
  it('@username in CJK sentence — BUG: no space before @', () => {
    // BUG: NaturalSpace does not treat @ as a symbol needing space from CJK
    t('請@vinta吃大便', '請 @vinta 吃大便');
  });

  it('@username with underscore — BUG: no space before @', () => {
    t('請@vinta_chen吃大便', '請 @vinta_chen 吃大便');
  });

  it('@CamelCase username — BUG: no space before @', () => {
    t('請@VintaChen吃大便', '請 @VintaChen 吃大便');
  });

  it('@CJK username — space added before @, CJK after @ merges', () => {
    // Space is added before @ (CJK→@ spacing), but no_space_between_CJK merges 進 and 吃
    t('請@陳上進 吃大便', '請 @陳上進吃大便');
  });
});

// ─── 7. Symbol `#` (hash) ───────────────────────────────────────────

describe('pangu-derived - hashtag symbol', () => {
  it('#alphanumeric tag — BUG: no space before # from CJK', () => {
    // BUG: NaturalSpace doesn't add space between CJK and # sign
    t('前面#H2G2後面', '前面 #H2G2 後面');
  });

  it('#CJK tag — BUG: no space before # from CJK', () => {
    t('前面#銀河便車指南後面', '前面 #銀河便車指南後面');
  });

  it('C# near CJK → preserve and add space', () => {
    t('前面C#後面', '前面 C# 後面');
  });

  it('F# near CJK', () => {
    t('前面F#後面', '前面 F# 後面');
  });
});

// ─── 8. Symbol `$` (dollar sign) ────────────────────────────────────

describe('pangu-derived - dollar sign', () => {
  it('CJK $ CJK — BUG: no space added around $', () => {
    // BUG: NaturalSpace only handles $ followed by a digit/letter
    //      but bare $ between CJK chars gets no space
    t('前面$後面', '前面 $ 後面');
  });

  it('CJK $number → $number stays together, space before', () => {
    t('前面$100後面', '前面 $100 後面');
  });

  it('already spaced — BUG: space before $ gets removed', () => {
    // BUG: '前面 $ 後面' → '前面$ 後面' (space before $ removed by no_space_before_punctuations)
    t('前面 $ 後面', '前面 $ 後面');
  });
});

// ─── 9. Symbol `` ` `` (backtick) ───────────────────────────────────

describe('pangu-derived - backtick', () => {
  it('CJK `code` CJK — BUG: no spaces added around backtick pair', () => {
    // BUG: NaturalSpace has no rule for backtick spacing
    t('前面`中間`後面', '前面 `中間` 後面');
  });

  it('real-world Claude Code example — backtick spaced, space before curly quote lost', () => {
    ti(
      '雖然知道可以在Claude Code直接執行shell指令，例如`! git commit -a -m "蛤"`，但是看了文件才知道原來在 http://command.md 裡面也可以用`!`啊#TIL',
      '雖然知道可以在 Claude Code 直接執行 shell 指令，例如 `! git commit -a -m \u201c蛤\u201d`，但是看了文件才知道原來在 http://command.md 裡面也可以用 `!` 啊 #TIL',
    );
  });
});

// ─── 10. Double quotes adjacent to CJK ──────────────────────────────

describe('pangu-derived - double quotes', () => {
  it('CJK "mixed" CJK — BUG: no space before/after curly quotes', () => {
    // BUG: NaturalSpace converts " to curly " but doesn't add surrounding spaces
    t('前面"中文123漢字"後面', '前面 \u201c中文 123 漢字\u201d 後面');
  });

  it('CJK "CJK number" CJK', () => {
    t('前面"中文123"後面', '前面 \u201c中文 123\u201d 後面');
  });

  it('head "CJK" CJK — BUG: no space between Latin and opening curly quote', () => {
    t('head "中文123漢字"後面', 'head \u201c中文 123 漢字\u201d 後面');
  });
});

// ─── 11. autocorrect fullwidth cases ────────────────────────────────

describe('pangu-derived - autocorrect fullwidth', () => {
  it('simple sentence with comma and period', () => {
    t('你好,这是一个句子.', '你好，这是一个句子。');
  });

  it('Traditional Chinese sentence', () => {
    t('你好,這是一個句子.', '你好，這是一個句子。');
  });

  it('Japanese sentence-ending period conversion', () => {
    t(
      'でもっと多くのことができるようになります.そんな新機能の数々をさっそく体験してみましょう.',
      'でもっと多くのことができるようになります。そんな新機能の数々をさっそく体験してみましょう。',
    );
  });

  it('brand name with comma + exclamation', () => {
    t('刚刚买了一部 iPhone,好开心!', '刚刚买了一部 iPhone，好开心！');
  });

  it('question sentence', () => {
    t('蚂蚁集团上市后有多大的上涨空间?', '蚂蚁集团上市后有多大的上涨空间？');
  });

  it('long technical sentence — NaturalSpace converts parens to full-width', () => {
    // NaturalSpace converts () to （） based on CJK adjacency regardless of content inside.
    // autocorrect would keep (如 ...) as half-width. Design difference.
    t(
      '我们需要一位熟悉 JavaScript、HTML5,至少理解一种框架 (如 Backbone.js、AngularJS、React 等) 的前端开发者.',
      '我们需要一位熟悉 JavaScript、HTML5，至少理解一种框架（如 Backbone.js、AngularJS、React 等）的前端开发者。',
    );
  });

  it('colon and exclamation in same sentence', () => {
    t('蚂蚁疾奔:蚂蚁集团两地上市~全速推进!', '蚂蚁疾奔：蚂蚁集团两地上市~全速推进！');
  });

  it('stock ticker in parens — BUG: space added after period in identifier', () => {
    // BUG: BABA.N → BABA. N (period followed by capital letter gets a space)
    t(
      '蚂蚁集团是阿里巴巴 (BABA.N) 旗下金融科技子公司',
      '蚂蚁集团是阿里巴巴 (BABA.N) 旗下金融科技子公司',
    );
  });

  it('semicolon between CJK — NaturalSpace converts to full-width (autocorrect skips)', () => {
    // Design difference: NaturalSpace converts ; → ；near CJK.
    // autocorrect intentionally skips ; as it's "dangerous".
    // Document current NaturalSpace behavior as the expected output.
    t('中文;中文', '中文；中文');
  });
});

// ─── 12. Korean text ────────────────────────────────────────────────

describe('pangu-derived - Korean text', () => {
  it('Korean comma/period — NaturalSpace converts because Korean is in CJK range', () => {
    // Korean Hangul (U+AC00-U+D7A3) is in the CJK range used by NaturalSpace.
    // autocorrect keeps Korean commas/periods half-width.
    // Document NaturalSpace's current behavior:
    t('근면, 검소, 협동은 우리 겨레의 미덕이다.', '근면，검소，협동은우리겨레의미덕이다。');
  });

  it('Korean + English spacing', () => {
    t('한국어English혼합', '한국어 English 혼합');
  });

  it('Korean + number spacing', () => {
    t('한국어123혼합', '한국어 123 혼합');
  });
});

// ─── 13. Compound real-world sentences from pangu.js ────────────────

describe('pangu-derived - complex real-world sentences', () => {
  it('pangu.js text-file fixture line 1 — NaturalSpace uses "" not 「」', () => {
    // pangu.js expects 「」 corner brackets; NaturalSpace converts to curly ""
    t(
      'Sephiroth見到他這等神情，也是悚然一驚：「此人來歷不小啊！不知我這太極拳是否對付得了？」',
      'Sephiroth 見到他這等神情，也是悚然一驚：\u201c此人來歷不小啊！不知我這太極拳是否對付得了？\u201d',
    );
  });

  it('pangu.js text-file fixture line 2 — NaturalSpace uses "" not 「」', () => {
    t(
      '張無忌道：「Tifa，你待孩兒恩重如山，孩兒便粉身碎骨，也不足以報太師父和Red XIII的大恩。我武當派功夫雖不敢說天下無敵，但也不致輸於西域少林的手下。太師父儘管放心。」',
      '張無忌道：\u201cTifa，你待孩兒恩重如山，孩兒便粉身碎骨，也不足以報太師父和 Red XIII 的大恩。我武當派功夫雖不敢說天下無敵，但也不致輸於西域少林的手下。太師父儘管放心。\u201d',
    );
  });

  it('pangu.js text-file percentage lines', () => {
    t(
      '新八的構造成分有95%是眼鏡、3%是水、2%是垃圾',
      '新八的構造成分有 95% 是眼鏡、3% 是水、2% 是垃圾',
    );
  });

  it('Sci-Fi hyphen in English text — no change', () => {
    t('Sci-Fi', 'Sci-Fi');
  });

  it('CJK surrounded hyphenated English tech terms', () => {
    t(
      '系統具備end-to-end加密功能以及cutting-edge的效能',
      '系統具備 end-to-end 加密功能以及 cutting-edge 的效能',
    );
  });

  it('letter grade with trailing dash — BUG: no space after trailing dash', () => {
    // BUG: 'D-の結果' → 'D-の結果' (no space between D- and CJK)
    // Expected: 'D- の結果' (space after trailing dash unit)
    t('得到一個D-的結果', '得到一個 D- 的結果');
  });
});

// ─── 14. Numbers and units edge cases ───────────────────────────────

describe('pangu-derived - numbers and units', () => {
  it('negative number in CJK sentence', () => {
    t('气温为-5度', '气温为 -5 度');
  });

  it('positive number with + prefix — BUG: no space before +number', () => {
    // BUG: '盈利+100元' → '盈利+100 元' (no space between CJK and +100)
    t('盈利+100元', '盈利 +100 元');
  });

  it('10% near CJK', () => {
    t('增长了10%的速度', '增长了 10% 的速度');
  });

  it('CJK + percent + CJK (no space after %)', () => {
    // % is a unit — add_space_after_units adds space when followed by CJK
    t('有50%的可能', '有 50% 的可能');
  });

  it('number with comma thousand separator', () => {
    t('共有1,234,567名用户', '共有 1,234,567 名用户');
  });

  it('decimals in CJK context', () => {
    t('精度达到0.001毫米', '精度达到 0.001 毫米');
  });
});
