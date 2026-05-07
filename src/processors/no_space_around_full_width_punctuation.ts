import { Processor } from '../createOrderedProcessor';
import { getAllFullWidthForms } from '../fullAndHalfWidthSymbols';
import { regex as r } from '../regex';
import { regexSourceRanges as rsr } from '../regexSource';

// ex: 你好， Tim => 你好，Tim
// ex: Tim ，再见 => Tim，再见
export const no_space_around_full_width_punctuation: Processor = (input) => {
  // Exclude curly quotes from space-stripping — they need spacing for readability
  const formsWithoutCurlyQuotes = getAllFullWidthForms().replace(/[\u201c\u201d]/g, '');
  return input.replace(
    r
      .rangeOf(formsWithoutCurlyQuotes)
      .wrap()
      .between(rsr.space + '*', rsr.space + '*')
      .$(),
    '$1'
  );
};
