import { memoizeLast, sleep } from './utils';

describe('memoizeLast', () => {
  it('should call the function only once', () => {
    let callCount = 0;
    const fn = memoizeLast(() => {
      callCount++;
      return 42;
    });

    expect(fn()).toBe(42);
    expect(fn()).toBe(42);
    expect(fn()).toBe(42);
    expect(callCount).toBe(1);
  });

  it('should return the same reference', () => {
    const obj = { value: 'test' };
    const fn = memoizeLast(() => obj);

    expect(fn()).toBe(obj);
    expect(fn()).toBe(obj);
  });

  it('should handle functions returning falsy values', () => {
    const fn = memoizeLast(() => 0);
    expect(fn()).toBe(0);
    expect(fn()).toBe(0);
  });

  it('should handle functions returning undefined', () => {
    const fn = memoizeLast(() => undefined);
    expect(fn()).toBeUndefined();
    expect(fn()).toBeUndefined();
  });

  it('should handle functions returning null', () => {
    const fn = memoizeLast(() => null);
    expect(fn()).toBeNull();
    expect(fn()).toBeNull();
  });

  it('should handle functions returning empty string', () => {
    const fn = memoizeLast(() => '');
    expect(fn()).toBe('');
    expect(fn()).toBe('');
  });
});

describe('sleep', () => {
  it('should resolve after the specified duration', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40); // allow small tolerance
  });

  it('should use default duration of 100ms', async () => {
    const start = Date.now();
    await sleep();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });

  it('should return a promise', () => {
    const result = sleep(10);
    expect(result).toBeInstanceOf(Promise);
  });
});
