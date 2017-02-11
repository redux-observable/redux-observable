/* globals describe it */
import 'babel-polyfill';
import { expect } from 'chai';
import sinon from 'sinon';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics, ActionsObservable, EPIC_END } from '../';
// We need to import the operators separately and not add them to the Observable
// prototype, otherwise we might accidentally cover-up that the source we're
// testing uses an operator that it does not import!
import { of } from 'rxjs/observable/of';
import { empty } from 'rxjs/observable/empty';
import { mergeStatic } from 'rxjs/operator/merge';
import { mapTo } from 'rxjs/operator/mapTo';

describe('createEpicMiddleware', () => {
  it('should provide epics a stream of action$ in and the "lite" store', (done) => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = sinon.stub().returns(empty());
    const epicMiddleware = createEpicMiddleware(epic);
    const mockMiddleware = store => next => action => {
      expect(epic.calledOnce).to.equal(true);
      expect(epic.firstCall.args[0]).to.be.instanceOf(ActionsObservable);
      expect(epic.firstCall.args[1]).to.equal(store);
      done();
    };
    const store = createStore(reducer, applyMiddleware(epicMiddleware, mockMiddleware));
    store.dispatch({ type: 'FIRST_ACTION_TO_TRIGGER_MIDDLEWARE' });
  });

  it('should accept an epic that wires up action$ input to action$ out', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, store) =>
      mergeStatic(
        action$.ofType('FIRE_1')::mapTo({ type: 'ACTION_1' }),
        action$.ofType('FIRE_2')::mapTo({ type: 'ACTION_2' })
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

  it('should throw if you don\'t provide a rootEpic', () => {
    expect(() => {
      createEpicMiddleware();
    }).to.throw('You must provide a root Epic to createEpicMiddleware');

    expect(() => {
      createEpicMiddleware({});
    }).to.throw('You must provide a root Epic to createEpicMiddleware');
  });

  it('should throw if you provide a root epic that doesn\'t return anything', () => {
    const rootEpic = () => {};
    const epicMiddleware = createEpicMiddleware(rootEpic);

    expect(() => {
      createStore(() => {}, applyMiddleware(epicMiddleware));
    }).to.throw('Your root Epic "rootEpic" does not return a stream. Double check you\'re not missing a return statement!');
  });

  it('should allow you to replace the root epic with middleware.replaceEpic(epic)', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic1 = action$ =>
      mergeStatic(
        of({ type: 'EPIC_1' }),
        action$.ofType('FIRE_1')::mapTo({ type: 'ACTION_1' }),
        action$.ofType('FIRE_2')::mapTo({ type: 'ACTION_2' }),
        action$.ofType('FIRE_GENERIC')::mapTo({ type: 'EPIC_1_GENERIC' }),
        action$.ofType(EPIC_END)::mapTo({ type: 'CLEAN_UP_AISLE_3' })
      );
    const epic2 = action$ =>
      mergeStatic(
        of({ type: 'EPIC_2' }),
        action$.ofType('FIRE_3')::mapTo({ type: 'ACTION_3' }),
        action$.ofType('FIRE_4')::mapTo({ type: 'ACTION_4' }),
        action$.ofType('FIRE_GENERIC')::mapTo({ type: 'EPIC_2_GENERIC' })
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
    const epic = sinon.spy((action$, store, { foo, bar }) => {
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
    const epic = sinon.spy((action$, store, deps, arg1, arg2) => {
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
