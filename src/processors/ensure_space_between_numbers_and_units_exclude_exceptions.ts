import { Processor } from '../createOrderedProcessor';
import { regex as r } from '../regex';
import { regexSourceRanges as rsr } from '../regexSource';

// ex: 123% => 123%
// ex: 34GB => 34 GB  (digit + 2+ letter suffix → add space)
// ex: 123abc => 123 abc  (digit + 2+ letter suffix → add space)
// ex: 9.6Gbps => 9.6 Gbps  (decimal + 2+ letter suffix → add space)
// ex: H2O => H2O  (letter precedes digit → word context, no split)
// ex: v2.0beta => v2.0beta  (letter precedes the number group → word context, no split)
// ex: 4K => 4K  (single-letter suffix → no split)
// ex: 1080p => 1080p  (single-letter suffix → no split)
export const ensure_space_between_numbers_and_units_exclude_exceptions: Processor = (input) =>
  input
    // Add space between the last digit of a number and a 2+ letter suffix,
    // but only if the number is NOT part of a letter-started word (like H2O, v2.0beta),
    // and NOT followed by an ordinal suffix (1st, 2nd, 3rd, 4th).
    // (?<![a-zA-Z][0-9.]*) fails when a letter precedes the digit chain up to this point.
    .replace(/(?<![a-zA-Z][0-9.]*)([0-9])(?![0-9])(?!(?:st|nd|rd|th)\b)(?=[a-zA-Z]{2,})/g, '$1 ')
    // Remove the space if the letters are unit symbols (%, °, etc.)
    .replace(r.of('[0-9]').wrap().then(`${rsr.space}+`).before(rsr.units).$(), '$1');
