import { Observable, Subject, map } from 'rxjs';
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
    expect(next).toHaveBeenCalledOnce();
    expect(next).lastCalledWith(first);

    input$.next(first);
    expect(state$.value).toEqual(first);
    expect(next).toHaveBeenCalledOnce();

    first.value = 'something else';
    input$.next(first);
    expect(state$.value).toEqual(first);
    expect(next).toHaveBeenCalledOnce();

    const second = { value: 'second' };
    input$.next(second);
    expect(state$.value).toEqual(second);
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).lastCalledWith(second);
  });

  it('works correctly (and does not lift) with operators applied', () => {
    expect.assertions(6);
    const first = { value: 'first' };
    const input$ = new Subject<typeof first>();
    const state$ = new StateObservable(input$, first).pipe(map((d) => d.value));
    const next = vi.fn();
    state$.subscribe(next);

    // @ts-expect-error because we piped an operator over it state$ is no longer
    // a StateObservable it's just a regular Observable and so it loses its `.value` prop
    expect(state$.value).toEqual(undefined);

    expect(next).toHaveBeenCalledOnce();
    expect(next).lastCalledWith('first');

    first.value = 'something else';
    input$.next(first);
    expect(next).toHaveBeenCalledOnce();

    const second = { value: 'second' };
    input$.next(second);
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).lastCalledWith('second');
  });
});
