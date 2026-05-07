/**
 * Performance benchmarks — informational, no assertions.
 * Run with: npx vitest run src/performance.test.ts --reporter=verbose
 */
import { add_space_after_units } from './processors/add_space_after_units';
import { ensure_space_after_some_half_width_punctuations } from './processors/ensure_space_after_some_half_width_punctuations';
import { ensure_space_around_some_half_width_punctuations } from './processors/ensure_space_around_some_half_width_punctuations';
import { ensure_space_before_left_brackets } from './processors/ensure_space_before_left_brackets';
import { ensure_space_between_CJK_and_digit_letters } from './processors/ensure_space_between_CJK_and_digit_letters';
import { ensure_space_between_numbers_and_units_exclude_exceptions as ensure_space_numbers_units } from './processors/ensure_space_between_numbers_and_units_exclude_exceptions';
import { no_full_width_numbers } from './processors/no full-width numbers';
import { no_space_before_punctuations } from './processors/no space before punctuations';
import { no_duplicated_whitespace_except_leading_and_trailing_ones as no_dup_ws } from './processors/no_duplicated_whitespace_except_leading_and_trailing_ones';
import { no_space_around_full_width_punctuation } from './processors/no_space_around_full_width_punctuation';
import { no_space_between_CJK } from './processors/no_space_between_CJK';
import { use_full_width_brackets_if_they_contain_CJK_characters } from './processors/use_full_width_brackets_if_they_contain_CJK_characters';
import { use_full_width_punctuation_around_CJK_characters } from './processors/use_full_width_punctuation_around_CJK_characters';
import { use_full_width_quotes_if_they_contain_CJK_characters } from './processors/use_full_width_quotes_if_they_contain_CJK_characters';
import { use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found } from './processors/use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found';
import { use_half_width_punctuation_when_not_adjacent_to_CJK } from './processors/use_half_width_punctuation_when_not_adjacent_to_CJK';
import { use_preferred_full_width_quotes } from './processors/use_preferred_full_width_quotes';
import { processText } from './processText';

const prefs = {} as Preferences;
const N = 3000;

function bench(fn: () => void): { avg: number; p50: number; p95: number } {
  for (let i = 0; i < 100; i++) fn(); // warmup
  const times: number[] = [];
  for (let i = 0; i < N; i++) {
    const t0 = performance.now();
    fn();
    times.push((performance.now() - t0) * 1000);
  }
  times.sort((a, b) => a - b);
  return {
    avg: times.reduce((a, b) => a + b, 0) / N,
    p50: times[Math.floor(N * 0.5)],
    p95: times[Math.floor(N * 0.95)],
  };
}

const INPUTS = {
  short: '你好Hello',
  medium:
    '本文将介绍如何使用TypeScript和React18构建一个高性能的Web应用.我们将使用Next.js13作为框架,Tailwind CSS作为样式方案.',
  long: '在 這個 例子中 我們 將 混合使用CJK, English, and numbers 這 樣的 文 字让 你看到 一个比 较混 乱的段 落 2023年5月6日 是 今天 的日期 我们 的ChatGPT 是一 个基于 GPT4架构 的 大型 语言 模型 有时 候 混合 不 同 的语 言 和数字 会让 段落 显得 很 混乱',
};

describe('performance benchmarks', () => {
  it('full pipeline across input sizes', () => {
    const rows: string[] = [];
    rows.push('Input size | avg(μs) | p50(μs) | p95(μs)');
    rows.push('-----------|---------|---------|--------');
    for (const [label, input] of Object.entries(INPUTS)) {
      const { avg, p50, p95 } = bench(() => processText(input, prefs));
      rows.push(
        `${label.padEnd(10)} | ${avg.toFixed(1).padStart(7)} | ${p50.toFixed(1).padStart(7)} | ${p95
          .toFixed(1)
          .padStart(7)}`
      );
    }
    console.log('\n' + rows.join('\n'));
    expect(true).toBe(true);
  });

  it('per-processor timing on medium input', () => {
    const input = INPUTS.medium;
    const processors: [string, (s: string, p: Preferences) => string][] = [
      ['no_full_width_numbers (1)', no_full_width_numbers],
      ['no_space_before_punctuations (2)', no_space_before_punctuations],
      ['no_duplicated_whitespace (3)', no_dup_ws],
      ['use_full_width_brackets_if_CJK (4)', use_full_width_brackets_if_they_contain_CJK_characters],
      ['use_full_width_quotes_if_CJK (5)', use_full_width_quotes_if_they_contain_CJK_characters],
      ['ensure_space_CJK_and_digits (6)', ensure_space_between_CJK_and_digit_letters],
      ['ensure_space_numbers_and_units (7)', ensure_space_numbers_units],
      ['add_space_after_units (8)', add_space_after_units],
      ['no_space_between_CJK (9)', no_space_between_CJK],
      ['use_preferred_full_width_quotes (10)', use_preferred_full_width_quotes],
      ['use_full_width_punct_around_CJK (11)', use_full_width_punctuation_around_CJK_characters],
      ['use_half_width_punct_no_CJK (12)', use_half_width_punctuation_when_not_adjacent_to_CJK],
      ['ensure_space_before_brackets (13)', ensure_space_before_left_brackets],
      ['half_width_in_CJK_brackets (14)', use_half_width_punctuation_between_CJK_brackets_if_no_CJK_found],
      ['no_space_around_full_width (15)', no_space_around_full_width_punctuation],
      ['ensure_space_after_half_punct (16)', ensure_space_after_some_half_width_punctuations],
      ['ensure_space_around_half_punct (17)', ensure_space_around_some_half_width_punctuations],
    ];

    const results: [string, number][] = [];
    for (const [name, proc] of processors) {
      const { avg } = bench(() => proc(input, prefs));
      results.push([name, avg]);
    }

    const sorted = [...results].sort((a, b) => b[1] - a[1]);
    const rows = ['Processor (pipeline step)                     | avg(μs)'];
    rows.push('----------------------------------------------|--------');
    for (const [name, avg] of sorted) {
      const bar = '█'.repeat(Math.round(avg / 0.5));
      rows.push(`${name.padEnd(46)}| ${avg.toFixed(1).padStart(6)}  ${bar}`);
    }
    console.log('\n' + rows.join('\n'));
    expect(true).toBe(true);
  });
});
