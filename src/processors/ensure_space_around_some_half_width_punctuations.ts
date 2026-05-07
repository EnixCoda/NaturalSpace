import { Processor } from '../createOrderedProcessor';
import { getAllHalfWidthForms } from '../fullAndHalfWidthSymbols';

// ex: 好&坏 => 好 & 坏  (CJK-&-CJK gets spaces)
// ex: a&b => a & b  (lowercase letters — treated as operator)
// ex: R&D部门 => R&D 部门  (ALL-UPPERCASE abbreviation — no split)
// ex: AT&T公司 => AT&T 公司  (ALL-UPPERCASE abbreviation — no split)
// ex: Tom&Jerry => Tom & Jerry  (mixed-case words — split)
// ex: 5cm×3cm宽 => 5cm × 3cm 宽  (multiplication sign gets spaces)
export const ensure_space_around_some_half_width_punctuations: Processor = (input) => {
  const halfWidthForms = getAllHalfWidthForms().replace(/[-\]\\^]/g, '\\$&');
  const notHalfNotSpace = `[^${halfWidthForms}\\s]`;

  const isAllUppercaseAbbreviation = (str: string, offset: number, matchLen: number): boolean => {
    const beforeWord = str.slice(0, offset).match(/[a-zA-Z]+$/)?.[0] ?? '';
    const afterWord = str.slice(offset + matchLen).match(/^[a-zA-Z]+/)?.[0] ?? '';
    return beforeWord.length > 0 && afterWord.length > 0 && /^[A-Z]+$/.test(beforeWord) && /^[A-Z]+$/.test(afterWord);
  };

  return (
    input
      // Space AFTER &: fires when next char is non-symbol non-space
      .replace(new RegExp(`(&+)(?=${notHalfNotSpace})`, 'g'), (match, amps, offset, str) => {
        if (isAllUppercaseAbbreviation(str, offset, match.length)) return match;
        return `${match} `;
      })
      // Space BEFORE &: fires when prev char is non-symbol non-space (handles idempotency
      // since no_space_before_punctuations strips the space before & on re-processing)
      .replace(new RegExp(`(?<=${notHalfNotSpace})(&+)`, 'g'), (match, amps, offset, str) => {
        if (isAllUppercaseAbbreviation(str, offset, match.length)) return match;
        return ` ${match}`;
      })
      // × (multiplication sign U+00D7): add space around it
      .replace(/(\S)×/g, '$1 ×')
      .replace(/×(\S)/g, '× $1')
  );
};
