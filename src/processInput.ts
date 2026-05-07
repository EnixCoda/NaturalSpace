import { processText } from './processText';
import { splitByPattern } from './splitByPattern';
import { regexSource as rs } from './regexSource';

const cjkRegex = new RegExp(`[${rs.CJK}]`);
const alphanumRegex = /[a-zA-Z0-9]/;

// Look up the chunks of text that NOT need to be formatted
export function processInput(selectedText: string, preferences?: Preferences) {
  const chunks = splitByPattern(selectedText);
  const formattedChunks = chunks.map(([chunk, pattern]) => {
    switch (pattern) {
      case 'nomatch':
        return processText(chunk, preferences);
      default:
        return chunk;
    }
  });

  // Add spacing at chunk boundaries where CJK meets alphanumeric
  const result: string[] = [];
  for (let i = 0; i < formattedChunks.length; i++) {
    const current = formattedChunks[i];
    if (i > 0 && current.length > 0) {
      const prev = result[result.length - 1];
      if (prev && prev.length > 0) {
        const lastChar = prev[prev.length - 1];
        const firstChar = current[0];
        if (
          (cjkRegex.test(lastChar) && alphanumRegex.test(firstChar)) ||
          (alphanumRegex.test(lastChar) && cjkRegex.test(firstChar))
        ) {
          result.push(' ');
        }
      }
    }
    result.push(current);
  }
  return result.join('');
}
