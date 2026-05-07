import { Processor } from '../createOrderedProcessor';
import { getAllHalfAndFullWidthForms } from '../fullAndHalfWidthSymbols';
import { regex as r } from '../regex';
import { regexSourceRanges as rsr } from '../regexSource';

export const no_space_before_punctuations: Processor = (input) =>
  // Remove space before punctuation, but preserve space before certain symbols:
  // - $ when followed by a digit or letter (e.g. 价格 $10, 设置 $HOME)
  // - $ when preceded by a non-alnum (standalone $ like '前面 $ 後面')
  // - @ when followed by a letter or CJK (mentions like '請 @vinta')
  // - # when followed by a letter or CJK (hashtags like '前面 #tag')
  // - / when preceded by a letter (paths like 'GET /api')
  input.replace(r.of(`${rsr.space}+`).before(r.rangeOf(getAllHalfAndFullWidthForms())._()).$(), (match, offset, str) => {
    const next = str[offset + match.length];
    const afterNext = str[offset + match.length + 1] ?? '';
    // Preserve space before $
    if (next === '$') {
      if (/[a-zA-Z0-9]/.test(afterNext)) return match; // $variable, $100
      const prev = str[offset - 1] ?? '';
      if (!/[a-zA-Z0-9]/.test(prev)) return match; // standalone $
    }
    // Preserve space before @ or # (mentions/hashtags)
    if (next === '@' || next === '#') return match;
    // Preserve space before / when preceded by a letter (API paths like GET /api)
    if (next === '/') {
      const prev = str[offset - 1] ?? '';
      if (/[a-zA-Z0-9]/.test(prev)) return match;
    }
    // Preserve space before - when it's a separator (followed by space or letter)
    if (next === '-') {
      const afterDash = str[offset + match.length + 1] ?? '';
      // Keep space before - when followed by a space (separator dash: 前面 - 後面)
      if (afterDash === ' ') return match;
      // Keep space before - when followed by a letter (e.g., 陳 -Vinta → later becomes 陳 - Vinta)
      if (/[a-zA-Z]/.test(afterDash)) return match;
    }
    return '';
  });
