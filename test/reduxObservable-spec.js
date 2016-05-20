/* globals describe it */
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { reduxObservable } from '../';
import * as Rx from 'rxjs';
import Promise from 'promise';
import 'babel-polyfill';
import $$observable from 'symbol-observable';

const { Observable } = Rx;

describe('reduxObservable', () => {
  it('should accept a processor argument that wires up a stream of actions to a stream of actions', () => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = reduxObservable((actions, store) =>
      Observable.merge(
        actions.ofType('FIRE_1').mapTo({ type: 'ACTION_1' }),
        actions.ofType('FIRE_2').mapTo({ type: 'ACTION_2' })
      )
    );

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

  it('should intercept and process actions', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = reduxObservable();

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

    const middleware = reduxObservable();

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

    const middleware = reduxObservable();

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

    const middleware = reduxObservable();

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

    const middleware = reduxObservable();

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(
      (actions) => Observable.of({ type: 'ASYNC_ACTION_2' })
        .delay(10)
        .takeUntil(actions.filter(action => action.type === 'ASYNC_ACTION_ABORT'))
        .merge(
          actions
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

    const middleware = reduxObservable();

    const store = createStore(reducer, applyMiddleware(middleware));

    const action2 = (actions) => Observable.of({ type: 'ASYNC_ACTION_2' });
    const action1 = (actions) => Observable.of({ type: 'ASYNC_ACTION_1' }, action2);

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
