/* globals describe, beforeEach, afterEach, it */
import 'babel-polyfill';
import { expect } from 'chai';
import sinon from 'sinon';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics, ActionsObservable, StateObservable, ofType } from '../';
import { resetDeprecationsSeen } from '../lib/cjs/utils/console';
import { of, empty, merge } from 'rxjs';
import { mapTo, filter, map, mergeMap, startWith, ignoreElements, distinctUntilChanged } from 'rxjs/operators';
import { initAction } from './initAction';

describe('createEpicMiddleware', () => {
  let spySandbox;

  beforeEach(() => {
    spySandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    spySandbox.restore();
    resetDeprecationsSeen();
  });

  it('should provide epics a stream of action$ and a stream of state$', (done) => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = sinon.stub().returns(empty());
    const epicMiddleware = createEpicMiddleware();
    const mockMiddleware = store => next => action => {
      expect(epic.calledOnce).to.equal(true);
      expect(epic.firstCall.args[0]).to.be.instanceOf(ActionsObservable);
      expect(epic.firstCall.args[1]).to.be.instanceof(StateObservable);
      done();
    };
    const store = createStore(reducer, applyMiddleware(epicMiddleware, mockMiddleware));
    epicMiddleware.run(epic);
    store.dispatch({ type: 'FIRST_ACTION_TO_TRIGGER_MIDDLEWARE' });
  });

  it('should throw an error if you provide a function to createEpicMiddleware (used to be rootEpic)', () => {
    expect(() => {
      createEpicMiddleware(() => {});
    }).to.throw(TypeError, 'Providing your root Epic to `createEpicMiddleware(rootEpic)` is no longer supported, instead use `epicMiddleware.run(rootEpic)`\n\nLearn more: https://redux-observable.js.org/MIGRATION.html#setting-up-the-middleware');
  });

  it('should warn about reusing the epicMiddleware', () => {
    spySandbox.spy(console, 'warn');
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, state$) => action$.pipe(
      ofType('PING'),
      map(() => state$.dispatch({ type: 'PONG' })),
      ignoreElements(),
    );

    const middleware = createEpicMiddleware();
    createStore(reducer, applyMiddleware(middleware));
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    expect(console.warn.callCount).to.equal(1);
    expect(console.warn.getCall(0).args[0]).to.equal('redux-observable | WARNING: this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da');
  });

  it('should update state$ after an action goes through reducers but before epics', () => {
    const actions = [];
    const reducer = (state = 0, action) => {
      actions.push(action);

      if (action.type === 'PING') {
        return state + 1;
      } else {
        return state;
      }
    };
    const epic = (action$, state$) =>
      merge(
        action$.pipe(ofType('PING')),
        state$.pipe(distinctUntilChanged())
      ).pipe(
        map(input => ({
          type: 'PONG',
          state: state$.value,
          input
        }))
      );

    const epicMiddleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    epicMiddleware.run(epic);

    store.dispatch({ type: 'PING' });
    store.dispatch({ type: 'PING' });

    expect(store.getState()).to.equal(2);
    expect(actions).to.deep.equal([initAction, {
      type: 'PONG',
      input: 0,
      state: 0
    }, {
      type: 'PING'
    }, {
      type: 'PONG',
      input: 1,
      state: 1
    }, {
      type: 'PONG',
      input: { type: 'PING' },
      state: 1
    }, {
      type: 'PING'
    }, {
      type: 'PONG',
      input: 2,
      state: 2
    }, {
      type: 'PONG',
      input: { type: 'PING' },
      state: 2
    }]);
  });

  it('should allow accessing state$.value on epic startup', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, state$) => of({
      type: 'PONG',
      state: state$.value
    });

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    store.dispatch({ type: 'PING' });

    expect(store.getState()).to.deep.equal([initAction, {
      type: 'PONG',
      state: [initAction]
    }, {
      type: 'PING'
    }]);
  });

  it('should queue state$ updates', () => {
    const actions = [];
    const reducer = (state = { action: null, value: 0 }, action) => {
      actions.push(action);

      switch (action.type) {
        case 'FIRST':
        case 'SECOND':
        case 'THIRD':
        case 'STATE':
          return {
            action: action.type, value: state.value + 1
          };

        default:
          return state;
      }
    };
    const epic = (action$, state$) =>
      action$.pipe(
        ofType('FIRST'),
        mergeMap(() =>
          merge(
            state$.pipe(
              filter(state => state.value < 6),
              map(state => ({ type: 'STATE', state }))
            ),
            of({ type: 'SECOND' }, { type: 'THIRD' })
          )
        )
      );

    const epicMiddleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    epicMiddleware.run(epic);

    store.dispatch({ type: 'FIRST' });

    expect(store.getState().value).to.equal(8);
    expect(actions).to.deep.equal([initAction, {
      type: 'FIRST'
    }, {
      type: 'STATE',
      state: { action: 'FIRST', value: 1 }
    }, {
      type: 'SECOND'
    }, {
      type: 'THIRD'
    }, {
      type: 'STATE',
      state: { action: 'STATE', value: 2 }
    }, {
      type: 'STATE',
      state: { action: 'SECOND', value: 3 }
    }, {
      type: 'STATE',
      state: { action: 'THIRD', value: 4 }
    }, {
      type: 'STATE',
      state: { action: 'STATE', value: 5 }
    }]);
  });

  it('should accept an epic that wires up action$ input to action$ out', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, state$) =>
      merge(
        action$.pipe(
          ofType('FIRE_1'),
          mapTo({ type: 'ACTION_1' })
        ),
        action$.pipe(
          ofType('FIRE_2'),
          mapTo({ type: 'ACTION_2' })
        )
      );

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    store.dispatch({ type: 'FIRE_1' });
    store.dispatch({ type: 'FIRE_2' });

    expect(store.getState()).to.deep.equal([
      initAction,
      { type: 'FIRE_1' },
      { type: 'ACTION_1' },
      { type: 'FIRE_2' },
      { type: 'ACTION_2' }
    ]);
  });

  it('should support synchronous emission by epics on start up', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic1 = (action$, state$) => of({ type: 'ACTION_1' });
    const epic2 = (action$, state$) => action$.pipe(
      ofType('ACTION_1'),
      mapTo({ type: 'ACTION_2' })
    );

    const rootEpic = combineEpics(epic1, epic2);

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(store.getState()).to.deep.equal([
      initAction,
      { type: 'ACTION_1' },
      { type: 'ACTION_2' }
    ]);
  });

  it('should queue synchronous actions', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic1 = action$ =>
      action$.pipe(
        ofType('ACTION_1'),
        mergeMap(() =>
          of({ type: 'ACTION_2' }, { type: 'ACTION_3' })
        )
      );

    const epic2 = action$ =>
      action$.pipe(
        ofType('ACTION_2'),
        map(() => ({ type: 'ACTION_4' })),
        startWith({ type: 'ACTION_1' })
      );

    const rootEpic = combineEpics(epic1, epic2);

    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(store.getState()).to.deep.equal([
      initAction,
      { type: 'ACTION_1' },
      { type: 'ACTION_2' },
      { type: 'ACTION_3' },
      { type: 'ACTION_4' }
    ]);
  });

  it('exceptions thrown in reducers as part of an epic-dispatched action should go through HostReportErrors', (done) => {
    const reducer = (state = [], action) => {
      switch (action.type) {
        case 'ACTION_1':
          throw new Error('some error');
        default:
          return state;
      }
    };
    const epic = (action$, state$) =>
      merge(
        action$.pipe(
          ofType('FIRE_1'),
          mapTo({ type: 'ACTION_1' })
        ),
        action$.pipe(
          ofType('FIRE_2'),
          mapTo({ type: 'ACTION_2' })
        )
      );
    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    process.prependOnceListener('uncaughtException', (err) => {
      expect(err.message).to.equal('some error');
      done();
    });

    // rxjs v6 does not rethrow synchronously instead emitting on
    // HostReportErrors e.g. window.onerror or process.on('uncaughtException')
    expect(() => {
      store.dispatch({ type: 'FIRE_1' });
    }).to.not.throw();
  });

  it('should throw if you provide a root epic that doesn\'t return anything', (done) => {
    spySandbox.spy(console, 'error');

    const rootEpic = () => { };
    const epicMiddleware = createEpicMiddleware();
    createStore(() => { }, applyMiddleware(epicMiddleware));
    epicMiddleware.run(rootEpic);

    process.prependOnceListener('uncaughtException', (err) => {
      expect(err.message).to.equal('Your root Epic "rootEpic" does not return a stream. Double check you\'re not missing a return statement!');
      done();
    });
  });

  it('should not pass third argument to epic if no dependencies provided', () => {
    const reducer = (state = [], action) => state;
    const epic = spySandbox.spy(action$ => action$);

    const middleware = createEpicMiddleware();
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    expect(epic.firstCall.args.length).to.deep.equal(2);
  });

  it('should inject dependencies into a single epic', () => {
    const reducer = (state = [], action) => state;
    const epic = spySandbox.spy(action$ => action$);

    const middleware = createEpicMiddleware({ dependencies: 'deps' });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    expect(epic.firstCall.args.length).to.deep.equal(3);
    expect(epic.firstCall.args[2]).to.deep.equal('deps');
  });

  it('should pass literally anything provided as dependencies, even `undefined`', () => {
    const reducer = (state = [], action) => state;
    const epic = spySandbox.spy(action$ => action$);

    const middleware = createEpicMiddleware({ dependencies: undefined });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(epic);

    expect(epic.firstCall.args.length).to.deep.equal(3);
    expect(epic.firstCall.args[2]).to.deep.equal(undefined);
  });

  it('should inject dependencies into combined epics', () => {
    const reducer = (state = [], action) => state;
    const epic = spySandbox.spy((action$, state$, { foo, bar }) => {
      expect(foo).to.equal('bar');
      expect(bar).to.equal('foo');
      return action$;
    });

    const rootEpic = combineEpics(
      epic,
      epic,
      combineEpics(
        epic,
        combineEpics(
          epic,
          epic
        )
      )
    );

    const middleware = createEpicMiddleware({ dependencies: { foo: 'bar', bar: 'foo' } });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(epic.called).to.equal(true);
    expect(epic.callCount).to.equal(5);
  });

  it('should call epics with all additional arguments, not just dependencies', () => {
    const reducer = (state = [], action) => state;
    const epic = spySandbox.spy((action$, state$, deps, arg1, arg2) => {
      expect(deps).to.equal('deps');
      expect(arg1).to.equal('first');
      expect(arg2).to.equal('second');
      return action$;
    });

    const rootEpic = (...args) => combineEpics(epic)(...args, 'first', 'second');
    const middleware = createEpicMiddleware({ dependencies: 'deps' });
    createStore(reducer, applyMiddleware(middleware));
    middleware.run(rootEpic);

    expect(epic.called).to.equal(true);
  });
});
