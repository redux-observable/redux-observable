import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { describe, expect, it, vi } from 'vitest';
import { StateObservable } from '../src';

describe('StateObservable', () => {
  it('should exist', () => {
    expect.assertions(1);
    expect(StateObservable.prototype).toBeInstanceOf(Observable);
  });

  it('should mirror the source subject', () => {
    expect.assertions(3);
    const input$ = new Subject();
    const state$ = new StateObservable(input$, 'first');
    let result = null;

    state$.subscribe((state) => {
      result = state;
    });

    expect(result).toEqual('first');
    input$.next('second');
    expect(result).toEqual('second');
    input$.next('third');
    expect(result).toEqual('third');
  });

  it('should cache last state on the `value` property', () => {
    expect.assertions(2);
    const input$ = new Subject();
    const state$ = new StateObservable(input$, 'first');

    expect(state$.value).toEqual('first');
    input$.next('second');
    expect(state$.value).toEqual('second');
  });

  it('should only update when the next value shallowly differs', () => {
    expect.assertions(10);
    const input$ = new Subject();
    const first = { value: 'first' };
    const state$ = new StateObservable(input$, first);
    const next = vi.fn();
    state$.subscribe(next);

    expect(state$.value).toEqual(first);
    expect(next).toBeCalledTimes(1);
    expect(next).lastCalledWith(first);

    input$.next(first);
    expect(state$.value).toEqual(first);
    expect(next).toBeCalledTimes(1);

    first.value = 'something else';
    input$.next(first);
    expect(state$.value).toEqual(first);
    expect(next).toBeCalledTimes(1);

    const second = { value: 'second' };
    input$.next(second);
    expect(state$.value).toEqual(second);
    expect(next).toBeCalledTimes(2);
    expect(next).lastCalledWith(second);
  });

  it('works correctly (and does not lift) with operators applied', () => {
    expect.assertions(8);
    const first = { value: 'first' };
    const input$ = new Subject<typeof first>();
    const state$ = new StateObservable(input$, first).pipe(map((d) => d.value)) as any as StateObservable<typeof first>;
    const next = vi.fn();
    state$.subscribe(next);

    // because we piped an operator over it state$ is no longer a StateObservable
    // it's just a regular Observable and so it loses its `.value` prop
    expect(state$.value).toEqual(undefined);
    expect(next).toBeCalledTimes(1);
    expect(next).lastCalledWith('first');

    first.value = 'something else';
    input$.next(first);
    expect(state$.value).toEqual(undefined);
    expect(next).toBeCalledTimes(1);

    const second = { value: 'second' };
    input$.next(second);
    expect(state$.value).toEqual(undefined);
    expect(next).toBeCalledTimes(2);
    expect(next).lastCalledWith('second');
  });
});
