import { createOrderedProcessor, ProcessorRecord } from './createOrderedProcessor';

describe('createOrderedProcessor', () => {
  it('should apply processors in order', () => {
    const records: ProcessorRecord[] = [
      ['add-prefix', (input) => 'prefix-' + input],
      ['add-suffix', (input) => input + '-suffix'],
    ];
    const order = ['add-prefix', 'add-suffix'];
    const processor = createOrderedProcessor(records, order);
    expect(processor('hello', {})).toBe('prefix-hello-suffix');
  });

  it('should respect ordering over declaration order', () => {
    const records: ProcessorRecord[] = [
      ['second', (input) => input + '2'],
      ['first', (input) => input + '1'],
    ];
    const order = ['first', 'second'];
    const processor = createOrderedProcessor(records, order);
    expect(processor('', {})).toBe('12');
  });

  it('should handle processors not in order list', () => {
    const records: ProcessorRecord[] = [
      ['known', (input) => input + 'K'],
      ['unknown', (input) => input + 'U'],
    ];
    const order = ['known'];
    const processor = createOrderedProcessor(records, order);
    const result = processor('', {});
    // 'known' should come first since it's in the order
    expect(result).toBe('KU');
  });

  it('should handle empty input', () => {
    const records: ProcessorRecord[] = [['noop', (input) => input]];
    const order = ['noop'];
    const processor = createOrderedProcessor(records, order);
    expect(processor('', {})).toBe('');
  });

  it('should pass preferences to each processor', () => {
    const records: ProcessorRecord[] = [['check-prefs', (_input, prefs) => (prefs as any).value || 'none']];
    const order = ['check-prefs'];
    const processor = createOrderedProcessor(records, order);
    expect(processor('anything', { value: 'found' } as any)).toBe('found');
    expect(processor('anything', {})).toBe('none');
  });

  it('should chain processors sequentially', () => {
    const records: ProcessorRecord[] = [
      ['upper', (input) => input.toUpperCase()],
      ['exclaim', (input) => input + '!'],
      ['wrap', (input) => `[${input}]`],
    ];
    const order = ['upper', 'exclaim', 'wrap'];
    const processor = createOrderedProcessor(records, order);
    expect(processor('hello', {})).toBe('[HELLO!]');
  });

  it('should handle single processor', () => {
    const records: ProcessorRecord[] = [['only', (input) => input.trim()]];
    const order = ['only'];
    const processor = createOrderedProcessor(records, order);
    expect(processor('  hello  ', {})).toBe('hello');
  });

  it('should handle no processors', () => {
    const records: ProcessorRecord[] = [];
    const order: string[] = [];
    const processor = createOrderedProcessor(records, order);
    expect(processor('hello', {})).toBe('hello');
  });
});
