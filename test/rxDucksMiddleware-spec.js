/* globals describe it */
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { rxDucksMiddleware } from '../';
import * as Rx from 'rxjs';

const { Observable } = Rx;

describe('rxDucksMiddleware', () => {
  it('should exist', () => {
    expect(rxDucksMiddleware).to.be.a('function');
  });

  it('should intercept and process actions', (done) => {
    const reducer = (state = [], action) => state.concat(action);

    const middleware = rxDucksMiddleware();

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch(() => Observable.of({ type: 'TEST1_HANDLED' }).delay(10));
    store.dispatch(() => Observable.of({ type: 'TEST2_HANDLED' }).delay(20));

    // HACKY: but should work until we use TestScheduler.
    setTimeout(() => {
      expect(store.getState()).to.deep.equal([
        { type: '@@redux/INIT' },
        { type: 'TEST1_HANDLED' },
        { type: 'TEST2_HANDLED' }
      ]);
      done();
    }, 100);
  });
});
