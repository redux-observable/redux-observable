/* globals describe it */
import 'babel-polyfill';
import { expect } from 'chai';
import sinon from 'sinon';
import { createStore } from 'redux';
import { createEpicEnhancer, combineEpics, ActionsObservable, EPIC_INIT, EPIC_END } from '../';
// We need to import the operators separately and not add them to the Observable
// prototype, otherwise we might accidentally cover-up that the source we're
// testing uses an operator that it does not import!
import { of } from 'rxjs/observable/of';
import { empty } from 'rxjs/observable/empty';
import { mergeStatic } from 'rxjs/operator/merge';
import { mapTo } from 'rxjs/operator/mapTo';
import { startWith } from 'rxjs/operator/startWith';

describe('createEpicEnhancer', () => {
  it('should provide epics a stream of action$ in and the "lite" store', (done) => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = sinon.stub().returns(empty());
    const epicEnhancer = createEpicEnhancer(epic);
    const store = createStore(reducer, epicEnhancer);
    store.dispatch({ type: 'FIRST_ACTION_TO_TRIGGER_MIDDLEWARE' });
    expect(epic.calledOnce).to.equal(true);
    expect(epic.firstCall.args[0]).to.be.instanceOf(ActionsObservable);
    expect(epic.firstCall.args[1]).to.have.all.keys('getState', 'dispatch');
    done();
  });

  it('should accept an epic that wires up action$ input to action$ out', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, store) =>
      mergeStatic(
        action$.ofType('FIRE_1')::mapTo({ type: 'ACTION_1' }),
        action$.ofType('FIRE_2')::mapTo({ type: 'ACTION_2' })
      );

    const epicEnhancer = createEpicEnhancer(epic);
    const store = createStore(reducer, epicEnhancer);

    store.dispatch({ type: 'FIRE_1' });
    store.dispatch({ type: 'FIRE_2' });
    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: EPIC_INIT },
      { type: 'FIRE_1' },
      { type: 'ACTION_1' },
      { type: 'FIRE_2' },
      { type: 'ACTION_2' }
    ]);
  });

  it('should throw if you don\'t provide a rootEpic', () => {
    expect(() => {
      createEpicEnhancer();
    }).to.throw('You must provide a root Epic to createEpicEnhancer');

    expect(() => {
      createEpicEnhancer({});
    }).to.throw('You must provide a root Epic to createEpicEnhancer');
  });

  it('should throw if you provide a root epic that doesn\'t return anything', () => {
    const rootEpic = () => {};
    const epicEnhancer = createEpicEnhancer(rootEpic);

    expect(() => {
      createStore(() => {}, epicEnhancer);
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

    const epicEnhancer = createEpicEnhancer(epic1);

    const store = createStore(reducer, epicEnhancer);

    store.dispatch({ type: 'FIRE_1' });
    store.dispatch({ type: 'FIRE_2' });
    store.dispatch({ type: 'FIRE_GENERIC' });

    store.replaceEpic(epic2);

    store.dispatch({ type: 'FIRE_3' });
    store.dispatch({ type: 'FIRE_4' });
    store.dispatch({ type: 'FIRE_GENERIC' });

    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: EPIC_INIT },
      { type: 'EPIC_1' },
      { type: 'FIRE_1' },
      { type: 'ACTION_1' },
      { type: 'FIRE_2' },
      { type: 'ACTION_2' },
      { type: 'FIRE_GENERIC' },
      { type: 'EPIC_1_GENERIC' },
      { type: EPIC_END },
      { type: 'CLEAN_UP_AISLE_3' },
      { type: EPIC_INIT },
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
    const epicEnhancer = createEpicEnhancer(epic, { adapter });

    const store = createStore(reducer, epicEnhancer);

    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: EPIC_INIT },
      { type: 3 }
    ]);
  });

  it('should not pass third argument to epic if no dependencies provided', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy(action$ => action$.ofType('FOO'));

    const epicEnhancer = createEpicEnhancer(epic);

    createStore(reducer, epicEnhancer);
    expect(epic.firstCall.args.length).to.deep.equal(2);
  });

  it('should inject dependencies into a single epic', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy(action$ => action$.ofType('FOO'));

    const epicEnhancer = createEpicEnhancer(epic, { dependencies: 'deps' });

    createStore(reducer, epicEnhancer);
    expect(epic.firstCall.args.length).to.deep.equal(3);
    expect(epic.firstCall.args[2]).to.deep.equal('deps');
  });

  it('should pass literally anything provided as dependencies, even `undefined`', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy(action$ => action$.ofType('FOO'));

    const epicEnhancer = createEpicEnhancer(epic, { dependencies: undefined });

    createStore(reducer, epicEnhancer);
    expect(epic.firstCall.args.length).to.deep.equal(3);
    expect(epic.firstCall.args[2]).to.deep.equal(undefined);
  });

  it('should inject dependencies into combined epics', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy((action$, store, { foo, bar }) => {
      expect(foo).to.equal('bar');
      expect(bar).to.equal('foo');
      return action$.ofType('FOO');
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

    const epicEnhancer = createEpicEnhancer(rootEpic, { dependencies: { foo: 'bar', bar: 'foo' } });

    createStore(reducer, epicEnhancer);

    expect(epic.called).to.equal(true);
    expect(epic.callCount).to.equal(5);
  });

  it('should call epics with all additional arguments, not just dependencies', () => {
    const reducer = (state = [], action) => state;
    const epic = sinon.spy((action$, store, deps, arg1, arg2) => {
      expect(deps).to.equal('deps');
      expect(arg1).to.equal('first');
      expect(arg2).to.equal('second');
      return action$.ofType('FOO');
    });

    const rootEpic = (...args) => combineEpics(epic)(...args, 'first', 'second');

    const epicEnhancer = createEpicEnhancer(rootEpic, { dependencies: 'deps' });

    createStore(reducer, epicEnhancer);
    expect(epic.called).to.equal(true);
  });

  it('should return actions emitted by epics on startup back to epics', () => {
    const reducer = (state = [], action) => state.concat(action);
    const init = 'INIT_MY_EPIC';
    const expectedType = 'MY_INIT_DONE';
    const epic = action$ => action$.ofType(init)
      ::mapTo({ type: expectedType })
      ::startWith({ type: init });
    const epicEnhancer = createEpicEnhancer(epic);
    const store = createStore(reducer, epicEnhancer);

    const actions = (store.getState()).slice(-2);
    expect(actions[0]).to.not.equal(undefined);
    expect(actions[0].type, 'first action').to.equal(init);
    expect(actions[1]).to.not.equal(undefined);
    expect(actions[1].type, 'second action').to.equal(expectedType);
  });
});
