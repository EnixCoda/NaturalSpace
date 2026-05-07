export type Pattern = 'nomatch' | 'ignore' | 'url';

const patterns = {
  // protocol
  formalURLPattern: /([a-z]+:\/\/)?([a-z][-a-zA-Z0-9@:%._+~#=]+\.[a-z]{2,6}\b)+(\/[/\w.-]*)*(\?[^ ]+)?(#[^ ]+)?/gi,
  // protocol omitted
  informalURLPattern: /(\w+\.)+\.com(:\d+)?/gi,
  localhostPattern: /[a-z]+:\/\/localhost/gi,
  ipAddressPattern: /([0-9]{1,3}\.){3}[0-9]{1,3}/g,
};

export function splitByPattern(text: string): [content: string, pattern: Pattern][] {
  const chunks: ReturnType<typeof splitByPattern> = [];

  const allPatterns = new RegExp(
    [
      patterns.formalURLPattern.source,
      patterns.informalURLPattern.source,
      patterns.localhostPattern.source,
      patterns.ipAddressPattern.source,
    ]
      .map((_) => `(${_})`)
      .join('|'),
    'ig'
  );

  const matches = text.matchAll(allPatterns);

  const cjkTrail = /[\u4e00-\u9fa5\u3040-\u30FF\uAC00-\uD7AF]+$/;

  let lastIndex = 0;
  for (const match of matches) {
    let [matchedText] = match;
    const { index = lastIndex } = match;
    const prefix = text.slice(lastIndex, index);
    if (prefix) chunks.push([prefix, 'nomatch']);
    // Trim trailing CJK characters from URL matches (they're likely regular text, not part of URL)
    // Keep CJK if preceded by = (part of a query parameter value like ?q=你好)
    const trailingCJK = matchedText.match(cjkTrail);
    if (trailingCJK) {
      const beforeCJK = matchedText.slice(0, matchedText.length - trailingCJK[0].length);
      if (!beforeCJK.endsWith('=')) {
        matchedText = beforeCJK;
      }
    }
    chunks.push([matchedText, 'ignore']);
    lastIndex = index + matchedText.length;
  }
  const prefix = text.slice(lastIndex);
  if (prefix) chunks.push([prefix, 'nomatch']);

  return chunks;
}
