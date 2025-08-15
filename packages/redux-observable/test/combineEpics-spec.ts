import { Action } from 'redux';
import { EMPTY, Subject, map, toArray } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Epic, StateObservable, combineEpics, ofType } from '../src';

describe('combineEpics', () => {
  it('should combine epics', () => {
    expect.assertions(1);
    type State = { I: string; a: string };

    const epic1: Epic<Action, Action, State> = (action$, state$) =>
      action$.pipe(
        ofType('ACTION1'),
        map((action) => ({ type: 'DELEGATED1', action, state$ }))
      );

    const epic2: Epic<Action, Action, State> = (action$, state$) =>
      action$.pipe(
        ofType('ACTION2'),
        map((action) => ({ type: 'DELEGATED2', action, state$ }))
      );

    const epic = combineEpics<Action, Action, State>(epic1, epic2);

    const state$ = new StateObservable(new Subject<State>(), {
      I: 'am',
      a: 'store',
    });
    const action$ = new Subject<Action>();
    const result = epic(action$, state$, undefined);
    const emittedActions: Action[] = [];

    result.subscribe((emittedAction) => emittedActions.push(emittedAction));

    action$.next({ type: 'ACTION1' });
    action$.next({ type: 'ACTION2' });

    expect(emittedActions).toEqual([
      { type: 'DELEGATED1', action: { type: 'ACTION1' }, state$ },
      { type: 'DELEGATED2', action: { type: 'ACTION2' }, state$ },
    ]);
  });

  it('should pass along every argument arbitrarily', () =>
    new Promise<void>((done) => {
      expect.assertions(5);
      const epic1 = vi.fn(() => ['first']);
      const epic2 = vi.fn(() => ['second']);

      // @ts-expect-error type doesn't match on purpose
      const rootEpic = combineEpics(epic1, epic2);

      // @ts-expect-error type doesn't match on purpose
      rootEpic(1, 2, 3, 4)
        .pipe(toArray())
        .subscribe((values) => {
          expect(values).toEqual(['first', 'second']);

          expect(epic1).toHaveBeenCalledOnce();
          expect(epic2).toHaveBeenCalledOnce();

          expect(epic1).toHaveBeenCalledWith(1, 2, 3, 4);
          expect(epic2).toHaveBeenCalledWith(1, 2, 3, 4);

          done();
        });
    }));

  it("should return a new epic that, when called, errors if one of the combined epics doesn't return anything", () => {
    expect.assertions(1);
    const epic1 = () => EMPTY;
    const epic2 = () => {};

    // @ts-expect-error type doesn't match on purpose
    const rootEpic = combineEpics(epic1, epic2);

    expect(() => {
      // @ts-expect-error type doesn't match on purpose
      rootEpic(1, 2, 3);
    }).toThrowError(
      'combineEpics: one of the provided Epics "epic2" does not return a stream. Double check you\'re not missing a return statement!'
    );
  });

  describe('returned epic function name', () => {
    const epic1 = () => EMPTY;
    const epic2 = () => EMPTY;
    const epic3 = () => EMPTY;

    it('should name the new epic with `combineEpics(...epic names)`', () => {
      expect.assertions(1);
      const rootEpic = combineEpics(epic1, epic2);

      expect(rootEpic).toHaveProperty('name', 'combineEpics(epic1, epic2)');
    });

    it('should annotate combined anonymous epics with `<anonymous>`', () => {
      expect.assertions(1);
      const rootEpic = combineEpics(() => EMPTY, epic2);

      expect(rootEpic).toHaveProperty(
        'name',
        'combineEpics(<anonymous>, epic2)'
      );
    });

    it('should include all combined epic names in the returned epic', () => {
      expect.assertions(1);
      const rootEpic = combineEpics(epic1, epic2, epic3);

      expect(rootEpic).toHaveProperty(
        'name',
        'combineEpics(epic1, epic2, epic3)'
      );
    });
  });
});
