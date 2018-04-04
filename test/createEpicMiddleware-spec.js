/* globals describe it */
import 'babel-polyfill';
import { expect } from 'chai';
import sinon from 'sinon';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics, ActionsObservable, StateObservable, EPIC_END, ofType } from '../';
import { of, empty, merge } from 'rxjs';
import { mapTo, map, ignoreElements, distinctUntilChanged } from 'rxjs/operators';

describe('createEpicMiddleware', () => {
  it('should provide epics a stream of action$ and a stream of state$', (done) => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = sinon.stub().returns(empty());
    const epicMiddleware = createEpicMiddleware(epic);
    const mockMiddleware = store => next => action => {
      expect(epic.calledOnce).to.equal(true);
      expect(epic.firstCall.args[0]).to.be.instanceOf(ActionsObservable);
      expect(epic.firstCall.args[1]).to.be.instanceof(StateObservable);
      done();
    };
    const store = createStore(reducer, applyMiddleware(epicMiddleware, mockMiddleware));
    store.dispatch({ type: 'FIRST_ACTION_TO_TRIGGER_MIDDLEWARE' });
  });

  it('should warn about reusing the epicMiddleware', () => {
    sinon.spy(console, 'warn');
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, state$) => action$.pipe(
      ofType('PING'),
      map(() => state$.dispatch({ type: 'PONG' })),
      ignoreElements(),
    );

    const middleware = createEpicMiddleware(epic);
    createStore(reducer, applyMiddleware(middleware));
    createStore(reducer, applyMiddleware(middleware));
    expect(console.warn.callCount).to.equal(1);
    expect(console.warn.getCall(0).args[0]).to.equal('redux-observable | WARNING: this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\n See https://goo.gl/2GQ7Da');
    console.warn.restore();
  });

  it('should warn about improper use of dispatch function', () => {
    sinon.spy(console, 'warn');
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, store) => action$.pipe(
      ofType('PING'),
      map(() => store.dispatch({ type: 'PONG' })),
      ignoreElements()
    );

    const middleware = createEpicMiddleware(epic);
    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch({ type: 'PING' });

    expect(console.warn.callCount).to.equal(1);
    expect(console.warn.getCall(0).args[0]).to.equal('redux-observable | DEPRECATION: calling store.dispatch() directly in your Epics is deprecated and will be removed. The second argument to your Epic is now a stream of state$ (a StateObservable), instead of the store. Instead of calling store.dispatch() in your Epic, emit actions through the Observable your Epic returns.\n\n  function <T, R, S, D>(action$: ActionsObservable<T>, state$: StateObservable<S>, dependencies?: D): Observable<R>\n\nLearn more: https://redux-observable.js.org/MIGRATION.html');
    console.warn.restore();
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

    const epicMiddleware = createEpicMiddleware(epic);
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    store.dispatch({ type: 'PING' });
    store.dispatch({ type: 'PING' });

    expect(store.getState()).to.equal(2);
    expect(actions).to.deep.equal([{
      type: '@@redux/INIT'
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

  it('should warn about accessing state$.value before @@redux/INIT', () => {
    sinon.spy(console, 'warn');
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, state$) => of({
      type: 'PONG',
      state: state$.value
    });

    const middleware = createEpicMiddleware(epic);
    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch({ type: 'PING' });

    expect(console.warn.callCount).to.equal(1);
    expect(console.warn.getCall(0).args[0]).to.equal('redux-observable | WARNING: You accessed state$.value inside one of your Epics, before your reducers have run for the first time, so there is no state yet. You\'ll need to wait until after the first action (@@redux/INIT) is dispatched or by using state$ as an Observable.');
    expect(store.getState()).to.deep.equal([{
      type: '@@redux/INIT'
    }, {
      type: 'PONG',
      state: undefined
    }, {
      type: 'PING'
    }]);
    console.warn.restore();
  });

  it('should warn about deprecated use of store.getState()', () => {
    sinon.spy(console, 'warn');
    const actions = [];
    const reducer = (state = { foo: 'bar' }, action) => {
      actions.push(action);
      return state;
    };
    const epic = (action$, state$) =>
      action$.pipe(
        ofType('PING'),
        map(() => ({
          type: 'RESULT',
          state: state$.getState()
        }))
      );

    const middleware = createEpicMiddleware(epic);
    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch({ type: 'PING' });

    expect(console.warn.callCount).to.equal(1);
    expect(console.warn.getCall(0).args[0]).to.equal('redux-observable | DEPRECATION: calling store.getState() in your Epics is deprecated and will be removed. The second argument to your Epic is now a stream of state$ (a StateObservable), instead of the store. To imperatively get the current state use state$.value instead of getState(). Alternatively, since it\'s now a stream you can compose and react to state changes.\n\n  function <T, R, S, D>(action$: ActionsObservable<T>, state$: StateObservable<S>, dependencies?: D): Observable<R>\n\nLearn more: https://redux-observable.js.org/MIGRATION.html');
    expect(actions[actions.length - 1].state).to.equal(store.getState());
    console.warn.restore();
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

    const middleware = createEpicMiddleware(epic);
    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch({ type: 'FIRE_1' });
    store.dispatch({ type: 'FIRE_2' });

    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'FIRE_1' },
      { type: 'ACTION_1' },
      { type: 'FIRE_2' },
      { type: 'ACTION_2' }
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
    const middleware = createEpicMiddleware(epic);
    const store = createStore(reducer, applyMiddleware(middleware));
    process.prependOnceListener('uncaughtException', (err) => {
      expect(err.message).to.equal('some error');
      done();
    });

    // rxjs v6 does not rethrow synchronously instead emitting on
    // HostReportErrors e.g. window.onerror or process.on('uncaughtException')
    expect(() => {
      store.dispatch({ type: 'FIRE_1' });
    }).to.not.throw('some error');
  });

  it('should throw if you don\'t provide a rootEpic', () => {
    expect(() => {
      createEpicMiddleware();
    }).to.throw('You must provide a root Epic to createEpicMiddleware');

    expect(() => {
      createEpicMiddleware({});
    }).to.throw('You must provide a root Epic to createEpicMiddleware');
  });

  it('should throw if you provide a root epic that doesn\'t return anything', (done) => {
    sinon.spy(console, 'error');

    const rootEpic = () => {};
    const epicMiddleware = createEpicMiddleware(rootEpic);
    createStore(() => {}, applyMiddleware(epicMiddleware));

    process.prependOnceListener('uncaughtException', (err) => {
      expect(err.message).to.equal('Your root Epic "rootEpic" does not return a stream. Double check you\'re not missing a return statement!');
      done();
    });
  });

  it('should allow you to replace the root epic with middleware.replaceEpic(epic)', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic1 = action$ =>
      merge(
        of({ type: 'EPIC_1' }),
        action$.pipe(
          ofType('FIRE_1'),
          mapTo({ type: 'ACTION_1' })
        ),
        action$.pipe(
          ofType('FIRE_2'),
          mapTo({ type: 'ACTION_2' })
        ),
        action$.pipe(
          ofType('FIRE_GENERIC'),
          mapTo({ type: 'EPIC_1_GENERIC' })
        ),
        action$.pipe(
          ofType(EPIC_END),
          mapTo({ type: 'CLEAN_UP_AISLE_3' })
        )
      );
    const epic2 = action$ =>
      merge(
        of({ type: 'EPIC_2' }),
        action$.pipe(
          ofType('FIRE_3'),
          mapTo({ type: 'ACTION_3' })
        ),
        action$.pipe(
          ofType('FIRE_4'),
          mapTo({ type: 'ACTION_4' })
        ),
        action$.pipe(
          ofType('FIRE_GENERIC'),
          mapTo({ type: 'EPIC_2_GENERIC' })
        )
      );

    const middleware = createEpicMiddleware(epic1);

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch({ type: 'FIRE_1' });
    store.dispatch({ type: 'FIRE_2' });
    store.dispatch({ type: 'FIRE_GENERIC' });

    middleware.replaceEpic(epic2);

    store.dispatch({ type: 'FIRE_3' });
    store.dispatch({ type: 'FIRE_4' });
    store.dispatch({ type: 'FIRE_GENERIC' });

    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'EPIC_1' },
      { type: 'FIRE_1' },
      { type: 'ACTION_1' },
      { type: 'FIRE_2' },
      { type: 'ACTION_2' },
      { type: 'FIRE_GENERIC' },
      { type: 'EPIC_1_GENERIC' },
      { type: EPIC_END },
      { type: 'CLEAN_UP_AISLE_3' },
      { type: 'EPIC_2' },
      { type: 'FIRE_3' },
      { type: 'ACTION_3' },
      { type: 'FIRE_4' },
      { type: 'ACTION_4' },
      { type: 'FIRE_GENERIC' },
      { type: 'EPIC_2_GENERIC' },
    ]);
  });

  it('supports an adapter for Epic input/output', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = input => input + 1;

    const adapter = {
      input: () => 1,
      output: value => of({
        type: value + 1
      })
    };
    const middleware = createEpicMiddleware(epic, { adapter });

    const store = createStore(reducer, applyMiddleware(middleware));

    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 3 }
    ]);
  });

  it('should not pass third argument to epic if no dependencies provided', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy(action$ => action$);

    const middleware = createEpicMiddleware(epic);

    createStore(reducer, applyMiddleware(middleware));
    expect(epic.firstCall.args.length).to.deep.equal(2);
  });

  it('should inject dependencies into a single epic', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy(action$ => action$);

    const middleware = createEpicMiddleware(epic, { dependencies: 'deps' });

    createStore(reducer, applyMiddleware(middleware));
    expect(epic.firstCall.args.length).to.deep.equal(3);
    expect(epic.firstCall.args[2]).to.deep.equal('deps');
  });

  it('should pass literally anything provided as dependencies, even `undefined`', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy(action$ => action$);

    const middleware = createEpicMiddleware(epic, { dependencies: undefined });

    createStore(reducer, applyMiddleware(middleware));
    expect(epic.firstCall.args.length).to.deep.equal(3);
    expect(epic.firstCall.args[2]).to.deep.equal(undefined);
  });

  it('should inject dependencies into combined epics', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy((action$, state$, { foo, bar }) => {
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

    const middleware = createEpicMiddleware(rootEpic, { dependencies: { foo: 'bar', bar: 'foo' } });

    createStore(reducer, applyMiddleware(middleware));

    expect(epic.called).to.equal(true);
    expect(epic.callCount).to.equal(5);
  });

  it('should call epics with all additional arguments, not just dependencies', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy((action$, state$, deps, arg1, arg2) => {
      expect(deps).to.equal('deps');
      expect(arg1).to.equal('first');
      expect(arg2).to.equal('second');
      return action$;
    });

    const rootEpic = (...args) => combineEpics(epic)(...args, 'first', 'second');

    const middleware = createEpicMiddleware(rootEpic, { dependencies: 'deps' });

    createStore(reducer, applyMiddleware(middleware));
    expect(epic.called).to.equal(true);
  });
});
