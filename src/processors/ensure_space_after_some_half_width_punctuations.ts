import { Processor } from '../createOrderedProcessor';

// ex: Fine.Thank you. => Fine. Thank you.
// ex: Tim:Hello => Tim: Hello
// ex: A,B => A, B
export const ensure_space_after_some_half_width_punctuations: Processor = (input) =>
  input
    // Period: add space when followed by uppercase letter (sentence boundary)
    // Require 2+ chars before period to avoid splitting abbreviations like U.S.A.
    .replace(/([a-zA-Z0-9]{2,}\.) *([A-Z])/g, (match, prefix, cap, offset, str) => {
      // Don't split stock-ticker-like identifiers: ALLCAPS.SINGLECAP (e.g., BABA.N, NYSE.A)
      const wordBefore = prefix.slice(0, -1); // remove trailing dot
      const afterCap = str[offset + match.length] ?? '';
      if (/^[A-Z]+$/.test(wordBefore) && !/[a-zA-Z]/.test(afterCap)) return match;
      return `${prefix} ${cap}`;
    })
    // Comma: add space if followed by a letter; also letter-comma-digit gets space
    .replace(/([a-zA-Z0-9],) *(?=[a-zA-Z])/g, '$1 ')
    .replace(/([a-zA-Z],) *(?=\d)/g, '$1 ')
    // Exclamation and question: always add space between alphanumerics
    .replace(/([a-zA-Z0-9][!?]) *(?=[a-zA-Z0-9])/g, '$1 ')
    // Colon: add space only after a letter and NOT when followed by a digit or hyphen
    // (preserves identifiers like node:18-alpine, time formats 14:30, ratios 16:9)
    .replace(/([a-zA-Z]:) *(?=[a-zA-Z])/g, '$1 ');
