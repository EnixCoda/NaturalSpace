import { Processor } from '../createOrderedProcessor';
import { fullToHalfWidthMap, transformFullToHalfWidth } from '../fullAndHalfWidthSymbols';
import { regexSource as rs } from '../regexSource';

// ex: Hello，World => Hello, World
// ex: The end。 => The end.
// Convert full-width punctuation back to half-width when the entire text contains no CJK characters.
// This handles the case where full-width punctuation was mistakenly used in pure English/Latin text.
export const use_half_width_punctuation_when_not_adjacent_to_CJK: Processor = (input) => {
  const cjkRegex = new RegExp(`[${rs.CJK}]`);
  // Only convert if the entire input contains no CJK characters
  if (cjkRegex.test(input)) return input;

  const targetPuncs = '，。！？：；';
  const targetRange = new RegExp(`[${targetPuncs}]`, 'g');

  return input.replace(targetRange, (match) => transformFullToHalfWidth(match));
};
