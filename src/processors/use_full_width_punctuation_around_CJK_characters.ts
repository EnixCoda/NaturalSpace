import { Processor } from '../createOrderedProcessor';
import { getAllFullWidthForms, halfToFullWidthMap, transformHalfToFullWidth } from '../fullAndHalfWidthSymbols';
import { regex as r } from '../regex';
import { regexSource as rs } from '../regexSource';

// Characters to exclude from this rule (handled by dedicated bracket processor)
const excludedChars = new Set(['(', ')']);
const halfWidthCharsForConversion = Object.keys(halfToFullWidthMap).filter((ch) => !excludedChars.has(ch));

// Build the main regex once
const mainRegex = r
  .rangeOf(halfWidthCharsForConversion.join(''))
  .after(`[${rs.CJK}${getAllFullWidthForms()}]`)
  .or(r.rangeOf(halfWidthCharsForConversion.join('')).before(`[${rs.CJK}${getAllFullWidthForms()}]`)._())
  .$();

// Shared callback for both the initial pass and the propagation loop
const convertMatch = (match: string, offset: number, str: string): string => {
  // Don't convert '.' if it's part of an ellipsis (consecutive dots)
  if (match === '.') {
    const prev = str[offset - 1];
    const next = str[offset + 1];
    if (prev === '.' || next === '.') return match;
    // Abbreviation guard: don't convert . in patterns like U.S.A. (preceded by X.)
    if (/[A-Z]/.test(prev) && offset >= 2 && str[offset - 2] === '.') return match;
    // Don't convert . after a digit (numbered lists: 1. 2. 3.)
    if (/[0-9]/.test(prev)) return match;
    // Don't convert . when preceded by a Latin word and followed by space+CJK (abbreviation at boundary: Inc. 开发)
    if (/[a-zA-Z]/.test(prev)) return match;
  }
  // Don't convert '!' if it's part of markdown image syntax ![
  if (match === '!' && str[offset + 1] === '[') return match;
  return transformHalfToFullWidth(match);
};

// ex: 你好,Tim => 你好，Tim
// NOT vice versa. CJK is pollutive to punctuation.
export const use_full_width_punctuation_around_CJK_characters: Processor = (input) => {
  let result = input.replace(mainRegex, convertMatch);

  // Propagate: repeatedly convert half-width punctuation adjacent to full-width punctuation
  // This handles cases like !! → ！！ (first ! converts, then second ! is adjacent to ！)
  let prev = '';
  while (prev !== result) {
    prev = result;
    result = result.replace(mainRegex, convertMatch);
  }

  return result;
};

