/* globals describe it */
import { expect } from 'chai';
import sinon from 'sinon';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from '../';
import * as Rx from 'rxjs';
import Promise from 'promise';
import 'babel-polyfill';
import $$observable from 'symbol-observable';

const { Observable } = Rx;

describe('createEpicMiddleware', () => {
  it('should accept a epic argument that wires up a stream of actions to a stream of actions', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic = (action$, store) =>
      Observable.merge(
        action$.ofType('FIRE_1').mapTo({ type: 'ACTION_1' }),
        action$.ofType('FIRE_2').mapTo({ type: 'ACTION_2' })
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

  it('should allow you to replace the root epic with middleware.replaceEpic(epic)', () => {
    const reducer = (state = [], action) => state.concat(action);
    const epic1 = action$ =>
      Observable.merge(
        Observable.of({ type: 'EPIC_1' }),
        action$.ofType('FIRE_1').mapTo({ type: 'ACTION_1' }),
        action$.ofType('FIRE_2').mapTo({ type: 'ACTION_2' }),
        action$.ofType('FIRE_GENERIC').mapTo({ type: 'EPIC_1_GENERIC' })
      );
    const epic2 = action$ =>
      Observable.merge(
        Observable.of({ type: 'EPIC_2' }),
        action$.ofType('FIRE_3').mapTo({ type: 'ACTION_3' }),
        action$.ofType('FIRE_4').mapTo({ type: 'ACTION_4' }),
        action$.ofType('FIRE_GENERIC').mapTo({ type: 'EPIC_2_GENERIC' })
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
      { type: 'EPIC_2' },
      { type: 'FIRE_3' },
      { type: 'ACTION_3' },
      { type: 'FIRE_4' },
      { type: 'ACTION_4' },
      { type: 'FIRE_GENERIC' },
      { type: 'EPIC_2_GENERIC' },
    ]);
  });

  it('emit warning that thunkservable are deprecated', () => {
    sinon.spy(console, 'warn');

    const reducer = (state = [], action) => state.concat(action);
    const middleware = createEpicMiddleware();
    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(() => Observable.of({ type: 'ASYNC_ACTION_1' }));

    expect(console.warn.calledOnce).to.equal(true);
    expect(
      console.warn.calledWith('DEPRECATION: Using thunkservables with redux-observable is now deprecated in favor of the new "Epics" feature. See http://redux-observable.js.org/docs/FAQ.html#why-were-thunkservables-deprecated')
    ).to.equal(true);

    console.warn.restore();
  });

  it('should intercept and process actions', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = createEpicMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(() => Observable.of({ type: 'ASYNC_ACTION_1' }).delay(10));
    store.dispatch(() => Observable.of({ type: 'ASYNC_ACTION_2' }).delay(20));

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'ASYNC_ACTION_1' },
        { type: 'ASYNC_ACTION_2' }
      ]);
      done();
    }, 100);
  });

  it('should work dispatched functions that return a promise', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = createEpicMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(() => Promise.resolve({ type: 'ASYNC_ACTION_1' }));
    store.dispatch(() => Promise.resolve({ type: 'ASYNC_ACTION_2' }));

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'ASYNC_ACTION_1' },
        { type: 'ASYNC_ACTION_2' }
      ]);
      done();
    }, 100);
  });

  it('should work with iterators/generators', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = createEpicMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(() => (function *() {
      yield { type: 'ASYNC_ACTION_1' };
      yield { type: 'ASYNC_ACTION_2' };
    })());

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'ASYNC_ACTION_1' },
        { type: 'ASYNC_ACTION_2' }
      ]);
      done();
    }, 100);
  });

  it('should work with observablesque arguments', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = createEpicMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    let finalized = false;

    store.dispatch(() => ({
      [$$observable]() {
        return {
          subscribe(observer) {
            observer.next({ type: 'ASYNC_ACTION_1' });
            observer.next({ type: 'ASYNC_ACTION_2' });
            observer.complete();

            return {
              unsubscribe() {
                finalized = true;
              }
            };
          }
        };
      }
    }));

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'ASYNC_ACTION_1' },
        { type: 'ASYNC_ACTION_2' }
      ]);

      expect(finalized).to.equal(true);
      done();
    }, 100);
  });

  it('should emit POJO actions to the actions Subject', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = createEpicMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(
      (action$) => Observable.of({ type: 'ASYNC_ACTION_2' })
        .delay(10)
        .takeUntil(action$.filter(action => action.type === 'ASYNC_ACTION_ABORT'))
        .merge(
          action$
            .map(action => ({ type: action.type + '_MERGED' }))
            .take(1)
        )
        .startWith({ type: 'ASYNC_ACTION_1' })
    );

    store.dispatch({ type: 'ASYNC_ACTION_ABORT' });

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'ASYNC_ACTION_1' },
        { type: 'ASYNC_ACTION_ABORT' },
        { type: 'ASYNC_ACTION_ABORT_MERGED' }
      ]);
      done();
    }, 100);
  });

  it('should store.dispatch onNext to allow async actions to emit other async actions', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = createEpicMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    const action2 = (action$) => Observable.of({ type: 'ASYNC_ACTION_2' });
    const action1 = (action$) => Observable.of({ type: 'ASYNC_ACTION_1' }, action2);

    store.dispatch(action1);

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'ASYNC_ACTION_1' },
        { type: 'ASYNC_ACTION_2' }
      ]);
      done();
    }, 100);
  });
});
