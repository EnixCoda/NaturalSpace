import { Processor } from '../createOrderedProcessor';
import { regex as r } from '../regex';
import { regexSource as rs } from '../regexSource';
import { regexSourceRanges as rsr } from '../regexSource';

// Extended Latin-like character class covering:
//   a-zA-Z0-9     Basic ASCII letters and digits
//   \u00C0-\u024F Latin Extended-A/B (diacritics: café, naïve, etc.)
//   \u0370-\u03FF Greek and Coptic (α, β, Ω, etc.)
//   \u2150-\u218F Number Forms (Ⅶ, ⅓, etc.)
const LATIN_LIKE = 'a-zA-Z0-9\\u00C0-\\u024F\\u0370-\\u03FF\\u2150-\\u218F';

// Pre-compiled regexes (module-level) to avoid rebuilding on every call.
const RE_CJK_BEFORE_LATIN = r.of(rsr.CJK).wrap().before(`[${LATIN_LIKE}]`).$();
const RE_LATIN_BEFORE_CJK = r.of(`[${LATIN_LIKE}]`).wrap().before(rsr.CJK).$();
const RE_LATIN_SYMBOL_BEFORE_CJK = new RegExp(`([a-zA-Z0-9][#+=]+)(?=[${rs.CJK}])`, 'g');
const RE_LETTER_DASH_BEFORE_CJK = new RegExp(`([a-zA-Z0-9]-)(?=[${rs.CJK}])`, 'g');
const RE_PAREN_BEFORE_CJK = new RegExp(`\\)(?=[${rs.CJK}])`, 'g');
// Merged: CJK before [-+$][alnum], @, or # — all add "$1 " so safe to combine
const RE_CJK_BEFORE_SIGN_OR_MENTION = new RegExp(`([${rs.CJK}])(?=(?:[-+$][a-zA-Z0-9]|[@#]))`, 'g');
const RE_MENTION_TAG_BEFORE_CJK = new RegExp(`([@#][a-zA-Z0-9_]+)(?=[${rs.CJK}])`, 'g');
const RE_CJK_BEFORE_BARE_DOLLAR = new RegExp(`([${rs.CJK}])(?=\\$(?![a-zA-Z0-9]))`, 'g');
const RE_BARE_DOLLAR_BEFORE_CJK = new RegExp(`((?<![a-zA-Z0-9])\\$)(?=[${rs.CJK}])`, 'g');
const RE_DOT_BEFORE_CJK = new RegExp(`([a-zA-Z0-9]\\.)(?=[${rs.CJK}])`, 'g');
const RE_ABBREV_DOT_BEFORE_CJK = new RegExp(`(?<=[a-zA-Z]\\.)([A-Z]\\.)(?=[${rs.CJK}])`, 'g');
const RE_LATIN_DASH_CJK = new RegExp(`([a-zA-Z]{2,}) *- *(?=[${rs.CJK}])`, 'g');
const RE_CJK_DASH_LATIN = new RegExp(`([${rs.CJK}]) *- *(?=[a-zA-Z])`, 'g');
const RE_SINGLE_LETTER_RANGE = /(?<![a-zA-Z])([A-Z])-([A-Z])(?![a-zA-Z])/g;
const RE_CJK_BACKTICK_OPEN = new RegExp(`([${rs.CJK}])\`([^\`]+)\``, 'g');
const RE_BACKTICK_CLOSE_CJK = new RegExp(`\`([^\`]+)\`([${rs.CJK}])`, 'g');
// Merged: (CJK | alnum) before \u201c → "$1 \u201c"
const RE_BEFORE_LQUOTE = new RegExp(`([${rs.CJK}a-zA-Z0-9])\u201c`, 'g');
// Merged: \u201d before (CJK | alnum) → "\u201d $1"
const RE_AFTER_RQUOTE = new RegExp(`\u201d([${rs.CJK}a-zA-Z0-9])`, 'g');

// ex: 你好123こんにちは123안녕하세요123 => 你好 123 こんにちは 123 안녕하세요 123
// ex: 学习C#语言 => 学习 C# 语言  (symbol at end of Latin token before CJK)
// ex: iPhone(US)中文版 => iPhone (US) 中文版  (closing ) before CJK)
// ex: 温度为-1度 => 温度为 -1 度  (negative number after CJK)
// ex: 价格$10的商品 => 价格 $10 的商品  (currency symbol after CJK)
// ex: 去café喝咖啡 => 去 café 喝咖啡  (Latin Extended chars treated as letters)
// ex: 设置$HOME环境变量 => 设置 $HOME 环境变量  (env var after CJK)
// ex: 去U.S.A.旅游 => 去 U.S.A. 旅游  (abbreviation before CJK)
// ex: 中文β漢字 => 中文 β 漢字  (Greek letters)
// ex: 中文Ⅶ漢字 => 中文 Ⅶ 漢字  (Roman numerals)
// ex: 請@vinta吃 => 請 @vinta 吃  (@ mentions)
// ex: 前面#tag後面 => 前面 #tag 後面  (hashtags)
// ex: 盈利+100元 => 盈利 +100 元  (positive numbers)
export const ensure_space_between_CJK_and_digit_letters: Processor = (input) =>
  input
    .replace(RE_CJK_BEFORE_LATIN, '$1 ')
    .replace(RE_LATIN_BEFORE_CJK, '$1 ')
    // Latin word-ending symbols (#, +) directly before CJK → add space
    .replace(RE_LATIN_SYMBOL_BEFORE_CJK, '$1 ')
    // Letter-dash before CJK → add space (D-的 → D- 的)
    .replace(RE_LETTER_DASH_BEFORE_CJK, '$1 ')
    // Closing ) before CJK → add space, UNLESS ) is part of a markdown link [text](url)
    .replace(RE_PAREN_BEFORE_CJK, (match, offset, str) => {
      const lastOpen = str.lastIndexOf('(', offset - 1);
      if (lastOpen > 0 && str[lastOpen - 1] === ']') return match; // markdown link
      return ') ';
    })
    // CJK before negative/positive number, currency, env variable, @ or # → add space
    .replace(RE_CJK_BEFORE_SIGN_OR_MENTION, '$1 ')
    // @username or #tag followed by CJK → add space after the token
    .replace(RE_MENTION_TAG_BEFORE_CJK, '$1 ')
    // CJK before bare $ (not followed by alnum) → add space
    .replace(RE_CJK_BEFORE_BARE_DOLLAR, '$1 ')
    // Bare $ followed by CJK → add space
    .replace(RE_BARE_DOLLAR_BEFORE_CJK, '$1 ')
    // Period/dot after alnum, before CJK → add space (1.安装, Inc.开发)
    .replace(RE_DOT_BEFORE_CJK, '$1 ')
    // Abbreviation ending with dot before CJK → add space (e.g., U.S.A.旅游 → U.S.A. 旅游)
    .replace(RE_ABBREV_DOT_BEFORE_CJK, '$1 ')
    // Dash at Latin↔CJK boundary: add space on both sides of dash
    // Latin-dash-CJK: Vinta-陳 → Vinta - 陳 (require 2+ letters to avoid splitting D- grades)
    .replace(RE_LATIN_DASH_CJK, '$1 - ')
    // CJK-dash-Latin: 陳-Vinta → 陳 - Vinta
    .replace(RE_CJK_DASH_LATIN, '$1 - ')
    // Single-letter ranges: A-B → A - B (only when both sides are single uppercase letters)
    .replace(RE_SINGLE_LETTER_RANGE, '$1 - $2')
    // Backtick pairs: CJK`code`CJK → CJK `code` CJK
    .replace(RE_CJK_BACKTICK_OPEN, '$1 `$2`')
    .replace(RE_BACKTICK_CLOSE_CJK, '`$1` $2')
    // Curly quotes: add space between CJK/Latin and curly quotes (merged: 4→2 passes)
    .replace(RE_BEFORE_LQUOTE, '$1 \u201c')
    .replace(RE_AFTER_RQUOTE, '\u201d $1');
