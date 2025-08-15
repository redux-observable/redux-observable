import {
  Action,
  Middleware,
  Reducer,
  UnknownAction,
  applyMiddleware,
  createStore,
} from 'redux';
import {
  EMPTY,
  Observable,
  config,
  distinctUntilChanged,
  filter,
  ignoreElements,
  map,
  merge,
  mergeMap,
  of,
  queueScheduler,
  startWith,
} from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Epic,
  StateObservable,
  combineEpics,
  createEpicMiddleware,
  ofType,
  __FOR_TESTING__resetDeprecationsSeen as resetDeprecationsSeen,
} from '../src';
import { initAction } from './initAction';

describe('createEpicMiddleware', () => {
  afterEach(() => {
    config.onUnhandledError = null;
    vi.resetAllMocks();
    resetDeprecationsSeen();
  });

  it('should provide epics a stream of action$ and a stream of state$', () =>
    new Promise<void>((done) => {
      expect.assertions(3);
      const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
        state.concat(action);
      const epic = vi.fn((...args) => {
        expect(args[0]).toBeInstanceOf(Observable);
        expect(args[1]).toBeInstanceOf(StateObservable);
        return EMPTY;
      });
      const epicMiddleware = createEpicMiddleware();
      const mockMiddleware: Middleware<unknown, void> =
        (_store) => (_next) => (_action) => {
          expect(epic).toHaveBeenCalledOnce();

          done();
        };
      const store = createStore(
        reducer,
        applyMiddleware(epicMiddleware, mockMiddleware)
      );
      epicMiddleware.run(epic);
      store.dispatch({ type: 'FIRST_ACTION_TO_TRIGGER_MIDDLEWARE' });
    }));

  it('should throw an error if you provide a function to createEpicMiddleware (used to be rootEpic)', () => {
    expect.assertions(1);
    expect(() => {
      // @ts-expect-error type mismatch on purpose
      createEpicMiddleware(() => {});
    }).toThrow(
      'Providing your root Epic to `createEpicMiddleware(rootEpic)` is no longer supported, instead use `epicMiddleware.run(rootEpic)`\n\nLearn more: https://redux-observable.js.org/MIGRATION.html#setting-up-the-middleware'
    );
  });

  it('should warn about reusing the epicMiddleware', () => {
    expect.assertions(2);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
      state.concat(action);
    const epic: Epic = (action$, _state$) =>
      action$.pipe(
        ofType('PING'),
        map(() => ({ type: 'PONG' })),

        ignoreElements()
      );

    const middleware = createEpicMiddleware();
    createStore(reducer, applyMiddleware(middleware));
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      'redux-observable | WARNING: this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da'
    );
  });

  it('should update state$ after an action goes through reducers but before epics', () => {
    expect.assertions(2);
    const actions: Action[] = [];
    const reducer: Reducer<number> = (state = 0, action) => {
      actions.push(action);

      if (action.type === 'PING') {
        return state + 1;
      } else {
        return state;
      }
    };
    const epic: Epic = (action$, state$) =>
      merge(
        action$.pipe(ofType('PING')),
        state$.pipe(distinctUntilChanged())
      ).pipe(
        map((input: unknown) => ({
          type: 'PONG',
          state: state$.value,
          input,
        }))
      );

    const epicMiddleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    epicMiddleware.run(epic);

    store.dispatch({ type: 'PING' });
    store.dispatch({ type: 'PING' });

    expect(store.getState()).toEqual(2);
    expect(actions).toEqual([
      initAction,
      {
        type: 'PONG',
        input: 0,
        state: 0,
      },
      {
        type: 'PING',
      },
      {
        type: 'PONG',
        input: 1,
        state: 1,
      },
      {
        type: 'PONG',
        input: { type: 'PING' },
        state: 1,
      },
      {
        type: 'PING',
      },
      {
        type: 'PONG',
        input: 2,
        state: 2,
      },
      {
        type: 'PONG',
        input: { type: 'PING' },
        state: 2,
      },
    ]);
  });

  it('should allow accessing state$.value on epic startup', () => {
    expect.assertions(1);
    const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
      state.concat(action);
    const epic: Epic = (_action$, state$) =>
      of({
        type: 'PONG',
        state: state$.value,
      });

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    store.dispatch({ type: 'PING' });

    expect(store.getState()).toEqual([
      initAction,
      {
        type: 'PONG',
        state: [initAction],
      },
      {
        type: 'PING',
      },
    ]);
  });

  it('should queue state$ updates', () => {
    expect.assertions(2);
    type TestState = { action: string | null; value: number };
    const actions: UnknownAction[] = [];
    const reducer: Reducer<TestState> = (
      state = { action: null, value: 0 },
      action
    ) => {
      actions.push(action);

      switch (action.type) {
        case 'FIRST':
        case 'SECOND':
        case 'THIRD':
        case 'STATE':
          return {
            action: action.type,
            value: state.value + 1,
          };

        default:
          return state;
      }
    };
    const epic: Epic<UnknownAction, UnknownAction, TestState> = (
      action$,
      state$
    ) =>
      action$.pipe(
        ofType('FIRST'),
        mergeMap(() =>
          merge(
            state$.pipe(
              filter((state) => state.value < 6),
              map((state) => ({ type: 'STATE', state }))
            ),
            of({ type: 'SECOND' }, { type: 'THIRD' })
          )
        )
      );

    const epicMiddleware = createEpicMiddleware<
      UnknownAction,
      UnknownAction,
      TestState
    >();
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    epicMiddleware.run(epic);

    store.dispatch({ type: 'FIRST' });

    expect(store.getState().value).toEqual(8);
    expect(actions).toEqual([
      initAction,
      {
        type: 'FIRST',
      },
      {
        type: 'STATE',
        state: { action: 'FIRST', value: 1 },
      },
      {
        type: 'SECOND',
      },
      {
        type: 'THIRD',
      },
      {
        type: 'STATE',
        state: { action: 'STATE', value: 2 },
      },
      {
        type: 'STATE',
        state: { action: 'SECOND', value: 3 },
      },
      {
        type: 'STATE',
        state: { action: 'THIRD', value: 4 },
      },
      {
        type: 'STATE',
        state: { action: 'STATE', value: 5 },
      },
    ]);
  });

  it('should accept an epic that wires up action$ input to action$ out', () => {
    expect.assertions(1);
    const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
      state.concat(action);
    const epic: Epic = (action$, _state$) =>
      merge(
        action$.pipe(
          ofType('FIRE_1'),
          map(() => ({ type: 'ACTION_1' }))
        ),
        action$.pipe(
          ofType('FIRE_2'),
          map(() => ({ type: 'ACTION_2' }))
        )
      );

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    store.dispatch({ type: 'FIRE_1' });
    store.dispatch({ type: 'FIRE_2' });

    expect(store.getState()).toEqual([
      initAction,
      { type: 'FIRE_1' },
      { type: 'ACTION_1' },
      { type: 'FIRE_2' },
      { type: 'ACTION_2' },
    ]);
  });

  it('should support synchronous emission by epics on start up', () => {
    expect.assertions(1);
    const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
      state.concat(action);
    const epic1: Epic = (_action$, _state$) => of({ type: 'ACTION_1' });
    const epic2: Epic = (action$, _state$) =>
      action$.pipe(
        ofType('ACTION_1'),
        map(() => ({ type: 'ACTION_2' }))
      );

    const rootEpic = combineEpics(epic1, epic2);

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(store.getState()).toEqual([
      initAction,
      { type: 'ACTION_1' },
      { type: 'ACTION_2' },
    ]);
  });

  it('should queue synchronous actions', () => {
    expect.assertions(1);
    const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
      state.concat(action);
    const epic1: Epic = (action$) =>
      action$.pipe(
        ofType('ACTION_1'),
        mergeMap(() => of({ type: 'ACTION_2' }, { type: 'ACTION_3' }))
      );

    const epic2: Epic = (action$) =>
      action$.pipe(
        ofType('ACTION_2'),
        map(() => ({ type: 'ACTION_4' })),
        startWith({ type: 'ACTION_1' })
      );

    const rootEpic = combineEpics(epic1, epic2);

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(store.getState()).toEqual([
      initAction,
      { type: 'ACTION_1' },
      { type: 'ACTION_2' },
      { type: 'ACTION_3' },
      { type: 'ACTION_4' },
    ]);
  });

  it('exceptions thrown in reducers as part of an epic-dispatched action should go through HostReportErrors', () =>
    new Promise<void>((done) => {
      expect.assertions(2);
      const reducer: Reducer<UnknownAction[]> = (state = [], action) => {
        switch (action.type) {
          case 'ACTION_1':
            throw new Error('some error');
          default:
            return state;
        }
      };
      const epic: Epic = (action$, _state$) =>
        merge(
          action$.pipe(
            ofType('FIRE_1'),
            map(() => ({ type: 'ACTION_1' }))
          ),
          action$.pipe(
            ofType('FIRE_2'),
            map(() => ({ type: 'ACTION_2' }))
          )
        );
      const middleware = createEpicMiddleware();
      const store = createStore(reducer, applyMiddleware(middleware));
      middleware.run(epic);

      config.onUnhandledError = (err: Error) => {
        expect(err.message).toEqual('some error');
        done();
      };

      // rxjs v6 does not rethrow synchronously instead emitting on
      // HostReportErrors e.g. window.onerror or process.on('uncaughtException')
      expect(() => {
        store.dispatch({ type: 'FIRE_1' });
      }).not.toThrow();
    }));

  it("should throw if you provide a root epic that doesn't return anything", () =>
    new Promise<void>((done) => {
      expect.assertions(2);
      const rootEpic = () => {};
      const epicMiddleware = createEpicMiddleware();
      createStore(() => {}, applyMiddleware(epicMiddleware));

      config.onUnhandledError = (err: Error) => {
        expect(err.message).toEqual(
          'Your root Epic "rootEpic" does not return a stream. Double check you\'re not missing a return statement!'
        );
        done();
      };

      expect(() => {
        // @ts-expect-error type mismatch on purpose
        epicMiddleware.run(rootEpic);
      }).not.toThrow();
    }));

  it('should pass undefined as third argument to epic if no dependencies provided', () => {
    expect.assertions(2);
    const reducer: Reducer<UnknownAction[]> = (state = [], _action) => state;
    const epic = vi.fn(
      (
        ...args: [
          Observable<unknown>,
          StateObservable<UnknownAction[]>,
          undefined,
        ]
      ) => {
        expect(args.length).toEqual(3);
        expect(args[2]).toEqual(undefined);

        return args[0];
      }
    );

    const middleware = createEpicMiddleware<
      unknown,
      unknown,
      UnknownAction[]
    >();
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);
  });

  it('should inject dependencies into a single epic', () => {
    expect.assertions(2);
    const reducer: Reducer<UnknownAction[]> = (state = [], _action) => state;
    const epic = vi.fn(
      (
        ...args: [Observable<unknown>, StateObservable<UnknownAction[]>, string]
      ) => {
        expect(args.length).toEqual(3);
        expect(args[2]).toEqual('deps');

        return args[0];
      }
    );

    const middleware = createEpicMiddleware<
      unknown,
      unknown,
      UnknownAction[],
      string
    >({ dependencies: 'deps' });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);
  });

  it('should pass literally anything provided as dependencies, even `undefined`', () => {
    expect.assertions(2);
    const reducer: Reducer<UnknownAction[]> = (state = [], _action) => state;
    const epic = vi.fn(
      (
        ...args: [
          Observable<unknown>,
          StateObservable<UnknownAction[]>,
          undefined,
        ]
      ) => {
        expect(args.length).toEqual(3);
        expect(args[2]).toEqual(undefined);

        return args[0];
      }
    );

    const middleware = createEpicMiddleware<
      unknown,
      unknown,
      UnknownAction[],
      undefined
    >({ dependencies: undefined });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);
  });

  it('should inject dependencies into combined epics', () => {
    expect.assertions(11);
    const reducer: Reducer<UnknownAction[]> = (state = [], _action) => state;
    const epic = vi.fn(
      (
        action$: Observable<unknown>,
        _state$: StateObservable<UnknownAction[]>,
        { foo, bar }: Record<string, string>
      ) => {
        expect(foo).toEqual('bar');
        expect(bar).toEqual('foo');
        return action$;
      }
    );

    const rootEpic: Epic<
      unknown,
      unknown,
      UnknownAction[],
      Record<string, string>
    > = combineEpics(epic, epic, combineEpics(epic, combineEpics(epic, epic)));

    const middleware = createEpicMiddleware<
      unknown,
      unknown,
      UnknownAction[],
      Record<string, string>
    >({
      dependencies: { foo: 'bar', bar: 'foo' },
    });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(epic).toHaveBeenCalledTimes(5);
  });

  it('should call epics with all additional arguments, not just dependencies', () => {
    expect.assertions(4);
    const reducer: Reducer<UnknownAction[]> = (state = [], _action) => state;
    const epic = vi.fn(
      <T>(action$: T, _state$: T, deps: T, arg1: T, arg2: T) => {
        expect(deps).toEqual('deps');
        expect(arg1).toEqual('first');
        expect(arg2).toEqual('second');
        return action$;
      }
    );

    // @ts-expect-error type mismatch on purpose
    const rootEpic = (...args: Parameters<Epic>) =>
      combineEpics(epic)(...args, 'first', 'second');
    const middleware = createEpicMiddleware({ dependencies: 'deps' });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(epic).toHaveBeenCalled();
  });

  it('should not allow interference from the public queueScheduler singleton', () =>
    new Promise<void>((done) => {
      expect.assertions(1);
      const reducer: Reducer<UnknownAction[]> = (state = [], action) =>
        state.concat(action);
      const epic1: Epic = (action$) =>
        action$.pipe(
          ofType('ACTION_1'),
          mergeMap(() => of({ type: 'ACTION_2' }, { type: 'ACTION_3' }))
        );

      const epic2: Epic = (action$) =>
        action$.pipe(
          ofType('ACTION_2'),
          map(() => ({ type: 'ACTION_4' }))
        );

      const rootEpic = combineEpics(epic1, epic2);

      queueScheduler.schedule(() => {
        const middleware = createEpicMiddleware();
        const store = createStore(reducer, applyMiddleware(middleware));
        middleware.run(rootEpic);
        store.dispatch({ type: 'ACTION_1' });

        expect(store.getState()).toEqual([
          initAction,
          { type: 'ACTION_1' },
          { type: 'ACTION_2' },
          { type: 'ACTION_3' },
          { type: 'ACTION_4' },
        ]);

        done();
      });
    }));
});
