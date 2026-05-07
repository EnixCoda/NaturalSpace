import { no_full_width_numbers } from './no full-width numbers';
import { no_space_before_punctuations } from './no space before punctuations';
import { no_duplicated_whitespace_except_leading_and_trailing_ones } from './no_duplicated_whitespace_except_leading_and_trailing_ones';
import { no_space_around_full_width_punctuation } from './no_space_around_full_width_punctuation';
import { no_space_between_CJK } from './no_space_between_CJK';
import { use_full_width_brackets_if_they_contain_CJK_characters } from './use_full_width_brackets_if_they_contain_CJK_characters';
import { use_full_width_quotes_if_they_contain_CJK_characters } from './use_full_width_quotes_if_they_contain_CJK_characters';
import { use_preferred_full_width_quotes } from './use_preferred_full_width_quotes';
import { use_full_width_punctuation_around_CJK_characters } from './use_full_width_punctuation_around_CJK_characters';
import { ensure_space_before_left_brackets } from './ensure_space_before_left_brackets';
import { use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found } from './use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found';
import { ensure_space_between_CJK_and_digit_letters } from './ensure_space_between_CJK_and_digit_letters';
import { ensure_space_between_numbers_and_units_exclude_exceptions } from './ensure_space_between_numbers_and_units_exclude_exceptions';
import { add_space_after_units } from './add_space_after_units';
import { ensure_space_after_some_half_width_punctuations } from './ensure_space_after_some_half_width_punctuations';
import { ensure_space_around_some_half_width_punctuations } from './ensure_space_around_some_half_width_punctuations';

const prefs: Preferences = {};
const straightQuotePrefs: Preferences = { useStraightQuotesForCJK: true };

describe('no_full_width_numbers', () => {
  const p = (input: string) => no_full_width_numbers(input, prefs);

  it('should convert full-width digits to half-width', () => {
    expect(p('０１２３４５６７８９')).toBe('0123456789');
  });

  it('should convert full-width letters to half-width', () => {
    expect(p('Ａ')).toBe('A');
    expect(p('ｚ')).toBe('z');
    expect(p('ＡＢＣ')).toBe('ABC');
    expect(p('ａｂｃ')).toBe('abc');
  });

  it('should not affect normal half-width characters', () => {
    expect(p('0123456789')).toBe('0123456789');
    expect(p('abc')).toBe('abc');
    expect(p('ABC')).toBe('ABC');
  });

  it('should handle mixed full-width and half-width', () => {
    expect(p('１a２b３c')).toBe('1a2b3c');
    expect(p('hello０world')).toBe('hello0world');
  });

  it('should not affect CJK characters', () => {
    expect(p('你好１２３世界')).toBe('你好123世界');
  });
});

describe('no_space_before_punctuations', () => {
  const p = (input: string) => no_space_before_punctuations(input, prefs);

  it('should remove space before half-width punctuation', () => {
    expect(p('Hello ,')).toBe('Hello,');
    expect(p('Hello .')).toBe('Hello.');
    expect(p('Hello !')).toBe('Hello!');
    expect(p('Hello ?')).toBe('Hello?');
  });

  it('should remove space before full-width punctuation', () => {
    expect(p('你好 ，')).toBe('你好，');
    expect(p('你好 。')).toBe('你好。');
    expect(p('你好 ！')).toBe('你好！');
    expect(p('你好 ？')).toBe('你好？');
  });

  it('should remove multiple spaces before punctuation', () => {
    expect(p('Hello   ,')).toBe('Hello,');
    expect(p('你好   。')).toBe('你好。');
  });

  it('should not affect leading spaces', () => {
    expect(p('  Hello')).toBe('  Hello');
  });

  it('should not strip space before $ when followed by digit', () => {
    expect(p('价格 $10')).toBe('价格 $10');
    expect(p('price $99.99')).toBe('price $99.99');
  });
});

describe('no_duplicated_whitespace_except_leading_and_trailing_ones', () => {
  const p = (input: string) => no_duplicated_whitespace_except_leading_and_trailing_ones(input, prefs);

  it('should collapse multiple spaces to one', () => {
    expect(p('Hello   World')).toBe('Hello World');
    expect(p('a  b  c')).toBe('a b c');
  });

  it('should preserve leading whitespace', () => {
    expect(p('    Hello World')).toBe('    Hello World');
  });

  it('should preserve trailing whitespace', () => {
    expect(p('Hello World    ')).toBe('Hello World    ');
  });

  it('should handle single space (no change)', () => {
    expect(p('Hello World')).toBe('Hello World');
  });

  it('should collapse internal spaces while preserving boundaries', () => {
    expect(p('   Hello   World   ')).toBe('   Hello World   ');
  });
});

describe('no_space_around_full_width_punctuation', () => {
  const p = (input: string) => no_space_around_full_width_punctuation(input, prefs);

  it('should remove space after full-width punctuation', () => {
    expect(p('你好， Tim')).toBe('你好，Tim');
  });

  it('should remove space before full-width punctuation', () => {
    expect(p('Tim ，再见')).toBe('Tim，再见');
  });

  it('should remove spaces around full-width punctuation', () => {
    expect(p('你好 ， 世界')).toBe('你好，世界');
    expect(p('你好 。 世界')).toBe('你好。世界');
  });

  it('should handle multiple full-width punctuations', () => {
    expect(p('你好 ， 世界 。 再见')).toBe('你好，世界。再见');
  });

  it('should not affect half-width punctuation', () => {
    expect(p('Hello, World')).toBe('Hello, World');
  });
});

describe('no_space_between_CJK', () => {
  const p = (input: string) => no_space_between_CJK(input, prefs);

  it('should remove space between CJK characters', () => {
    expect(p('你 好')).toBe('你好');
    expect(p('你  好  世  界')).toBe('你好世界');
  });

  it('should remove space between Japanese characters', () => {
    expect(p('こ ん に ち は')).toBe('こんにちは');
  });

  it('should remove space between Korean characters', () => {
    expect(p('안 녕 하 세 요')).toBe('안녕하세요');
  });

  it('should not remove space between CJK and Latin', () => {
    expect(p('你好 Hello')).toBe('你好 Hello');
  });

  it('should not remove space between Latin characters', () => {
    expect(p('Hello World')).toBe('Hello World');
  });
});

describe('use_full_width_brackets_if_they_contain_CJK_characters', () => {
  const p = (input: string) => use_full_width_brackets_if_they_contain_CJK_characters(input, prefs);

  it('should convert half-width brackets to full-width when content has CJK', () => {
    expect(p('(你好)')).toBe('（你好）');
    expect(p('(苹果Apple)')).toBe('（苹果Apple）');
  });

  it('should not convert brackets when content is pure Latin', () => {
    expect(p('(Apple)')).toBe('(Apple)');
    expect(p('(hello world)')).toBe('(hello world)');
  });

  it('should handle multiple brackets', () => {
    expect(p('(你好) and (Apple)')).toBe('（你好） and (Apple)');
  });

  it('should not affect already full-width brackets', () => {
    expect(p('（你好）')).toBe('（你好）');
  });
});

describe('use_full_width_quotes_if_they_contain_CJK_characters', () => {
  it('should convert to straight quotes when preference is set', () => {
    const p = (input: string) => use_full_width_quotes_if_they_contain_CJK_characters(input, straightQuotePrefs);
    expect(p('"你好"')).toBe('「你好」');
    expect(p('"你好 Tim"')).toBe('「你好 Tim」');
  });

  it('should convert to curly quotes when preference is not set', () => {
    const p = (input: string) => use_full_width_quotes_if_they_contain_CJK_characters(input, prefs);
    expect(p('"你好"')).toBe('\u201c你好\u201d');
  });

  it('should not convert quotes with pure Latin content', () => {
    const p = (input: string) => use_full_width_quotes_if_they_contain_CJK_characters(input, straightQuotePrefs);
    expect(p('"Hello"')).toBe('"Hello"');
  });
});

describe('use_preferred_full_width_quotes', () => {
  it('should convert curly quotes to straight quotes when preference is set', () => {
    const p = (input: string) => use_preferred_full_width_quotes(input, straightQuotePrefs);
    expect(p('\u201c你好\u201d')).toBe('「你好」');
  });

  it('should convert straight quotes to curly quotes when preference is not set', () => {
    const p = (input: string) => use_preferred_full_width_quotes(input, prefs);
    expect(p('「你好」')).toBe('\u201c你好\u201d');
  });
});

describe('use_full_width_punctuation_around_CJK_characters', () => {
  const p = (input: string) => use_full_width_punctuation_around_CJK_characters(input, prefs);

  it('should convert half-width punctuation after CJK to full-width', () => {
    expect(p('你好,世界')).toBe('你好，世界');
    expect(p('你好.')).toBe('你好。');
    expect(p('你好!')).toBe('你好！');
    expect(p('你好?')).toBe('你好？');
    expect(p('你好;世界')).toBe('你好；世界');
    expect(p('你好:世界')).toBe('你好：世界');
  });

  it('should convert half-width punctuation before CJK to full-width', () => {
    expect(p(',你好')).toBe('，你好');
    expect(p(':你好')).toBe('：你好');
  });

  it('should not convert punctuation between Latin characters', () => {
    expect(p('Hello, World')).toBe('Hello, World');
    expect(p('Hello.')).toBe('Hello.');
  });

  it('period guards — digit, letter, abbreviation, identifier', () => {
    // line 27: digit guard — period after digit before CJK stays half-width
    expect(p('你好，1.安装')).toBe('你好，1.安装'); // propagation: digit guard
    // line 31: letter guard — abbreviation before CJK
    expect(p('你好，Inc.好')).toBe('你好，Inc.好');
    // line 25: U.S.A. abbreviation guard
    expect(p('你好，U.S.好')).toBe('你好，U.S.好');
    // line 34 (markdown image): ![ preserved
    expect(p('你好！好![alt](url)')).toBe('你好！好![alt](url)');
  });
});

describe('ensure_space_before_left_brackets', () => {
  const p = (input: string) => ensure_space_before_left_brackets(input, prefs);

  it('should add space before left bracket when attached to text', () => {
    expect(p('A(Apple)')).toBe('A (Apple)');
    expect(p('Hello(world)')).toBe('Hello (world)');
  });

  it('should not add space when already present', () => {
    expect(p('A (Apple)')).toBe('A (Apple)');
  });

  it('should not add space at start of string', () => {
    expect(p('(Apple)')).toBe('(Apple)');
  });

  it('should add space before ( in function call context', () => {
    expect(p('sizeof(int)')).toBe('sizeof (int)');
  });
});

describe('use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found', () => {
  const p = (input: string) => use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found(input, prefs);

  it('should convert full-width punctuation to half-width inside 《》 with no CJK', () => {
    expect(p('《Title，subtitle》')).toBe('《Title,subtitle》');
    expect(p('《Hello：World》')).toBe('《Hello:World》');
  });

  it('should not convert when CJK is present inside brackets', () => {
    expect(p('《你好，世界》')).toBe('《你好，世界》');
  });

  it('should handle 「」 brackets', () => {
    expect(p('「Hello，World」')).toBe('「Hello,World」');
  });

  it('should handle "" brackets', () => {
    expect(p('\u201cHello，World\u201d')).toBe('\u201cHello,World\u201d');
  });
});

describe('ensure_space_between_CJK_and_digit_letters', () => {
  const p = (input: string) => ensure_space_between_CJK_and_digit_letters(input, prefs);

  it('should add space between CJK and digits', () => {
    expect(p('你好123')).toBe('你好 123');
    expect(p('123你好')).toBe('123 你好');
  });

  it('should add space between CJK and letters', () => {
    expect(p('你好Hello')).toBe('你好 Hello');
    expect(p('Hello你好')).toBe('Hello 你好');
  });

  it('should handle Japanese', () => {
    expect(p('こんにちは123')).toBe('こんにちは 123');
    expect(p('こんにちはHello')).toBe('こんにちは Hello');
  });

  it('should handle Korean', () => {
    expect(p('안녕하세요123')).toBe('안녕하세요 123');
    expect(p('안녕하세요Hello')).toBe('안녕하세요 Hello');
  });

  it('should not add space between pure digits/letters', () => {
    expect(p('Hello123')).toBe('Hello123');
    expect(p('abc def')).toBe('abc def');
  });

  it('should not add double spaces', () => {
    expect(p('你好 Hello')).toBe('你好 Hello');
  });

  it('should add space around C# and C++ at CJK boundaries', () => {
    expect(p('学习C#语言')).toBe('学习 C# 语言');
    expect(p('学习C++语言')).toBe('学习 C++ 语言');
  });

  it('should add space after closing ) before CJK', () => {
    // ensure_space_before_left_brackets handles space before (; this processor handles ) before CJK
    expect(p('iPhone(US)中文版')).toBe('iPhone(US) 中文版');
  });

  it('should add space before negative number after CJK', () => {
    expect(p('温度为-1度')).toBe('温度为 -1 度');
    // Space after % before CJK is added by add_space_after_units (different processor)
    expect(p('跌幅为-5%增长')).toBe('跌幅为 -5%增长');
  });

  it('should add space between CJK and $ before digit', () => {
    expect(p('价格$10的商品')).toBe('价格 $10 的商品');
  });
});

describe('ensure_space_between_numbers_and_units_exclude_exceptions', () => {
  const p = (input: string) => ensure_space_between_numbers_and_units_exclude_exceptions(input, prefs);

  it('should add space between numbers and letter units', () => {
    expect(p('10GB')).toBe('10 GB');
    expect(p('5TB')).toBe('5 TB');
    expect(p('100Mbps')).toBe('100 Mbps');
  });

  it('should not add space before % unit', () => {
    expect(p('50%')).toBe('50%');
    expect(p('12.3%')).toBe('12.3%');
  });

  it('should not add space before ° unit', () => {
    expect(p('90°')).toBe('90°');
    expect(p('360°')).toBe('360°');
  });

  it('should not split single-letter suffix abbreviations or chemical formulas', () => {
    expect(p('H2O')).toBe('H2O');
    expect(p('4K')).toBe('4K');
    expect(p('1080p')).toBe('1080p');
    expect(p('v2.0beta')).toBe('v2.0beta');
  });
});

describe('add_space_after_units', () => {
  const p = (input: string) => add_space_after_units(input, prefs);

  it('should add space after % when followed by text', () => {
    expect(p('50%增长')).toBe('50% 增长');
    expect(p('12%abc')).toBe('12% abc');
  });

  it('should not add space after % at end of string', () => {
    expect(p('50%')).toBe('50%');
  });

  it('should add space after ° when followed by text', () => {
    expect(p('90°角')).toBe('90° 角');
  });
});

describe('ensure_space_after_some_half_width_punctuations', () => {
  const p = (input: string) => ensure_space_after_some_half_width_punctuations(input, prefs);

  it('should add space after comma in English text', () => {
    expect(p('Hello,Tim')).toBe('Hello, Tim');
  });

  it('should add space after period in English text', () => {
    expect(p('Hello.Tim')).toBe('Hello. Tim');
  });

  it('should add space after colon in English text', () => {
    expect(p('Hello:Tim')).toBe('Hello: Tim');
  });

  it('should not add space if already present', () => {
    expect(p('Hello, Tim')).toBe('Hello, Tim');
  });

  it('should handle multiple instances', () => {
    // The rule requires [a-z] before the punctuation, so single-char 'b' after '.' doesn't match
    expect(p('Hello,Tim.Good:morning')).toBe('Hello, Tim. Good: morning');
  });

  it('should add space after comma/period/colon following uppercase letters or digits', () => {
    expect(p('A,B,C')).toBe('A, B, C');
    expect(p('OK.Start')).toBe('OK. Start');
    expect(p('NOTE:important')).toBe('NOTE: important');
    expect(p('1,a')).toBe('1, a');
  });
});

describe('ensure_space_around_some_half_width_punctuations', () => {
  const p = (input: string) => ensure_space_around_some_half_width_punctuations(input, prefs);

  it('should add space around & for non-uppercase content', () => {
    expect(p('a&b')).toBe('a & b'); // lowercase → operator, split
    expect(p('好&坏')).toBe('好 & 坏'); // CJK-&-CJK gets spaces
  });

  it('should not split all-uppercase abbreviations', () => {
    expect(p('R&D')).toBe('R&D'); // all-uppercase → abbreviation, no split
    expect(p('AT&T')).toBe('AT&T'); // all-uppercase → abbreviation, no split
    expect(p('a&&b')).toBe('a && b'); // lowercase → split
  });

  it('should not add space when already present', () => {
    expect(p('a & b')).toBe('a & b');
  });
});
