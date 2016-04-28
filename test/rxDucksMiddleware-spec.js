/* globals describe it */
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { rxDucksMiddleware } from '../';
import { timer } from 'rxjs/observable/timer';
import { map } from 'rxjs/operator/map';
import { startWith } from 'rxjs/operator/startWith';

describe('rxDucksMiddleware', () => {
  it('should exist', () => {
    expect(rxDucksMiddleware).to.be.a('function');
  });

  it('should intercept and process actions', (done) => {
    const middleware = rxDucksMiddleware();
    const reducedActions = [];

    const store = createStore((state = {}, action) => {
      reducedActions.push(action);
      switch (action.type) {
        case 'STARTING_TEST':
          return { ...state, testStarted: true };
        case 'END_TEST':
          expect(state.testStarted).to.equal(true);
          expect(reducedActions).to.deep.equal([
            { type: '@@redux/INIT' },
            { type: 'STARTING_TEST' },
            { type: 'END_TEST' }
          ]);
          done();
          return { ...state, testEnded: true };
        default:
          break;
      }
      return state;
    }, applyMiddleware(middleware));

    let sub = store.dispatch({
      type: 'START_TEST',
      async: () =>
        timer(10)
        ::map(() => ({ type: 'END_TEST' }))
        ::startWith({ type: 'STARTING_TEST' })
    });

    expect(sub).to.be.a('object');
    expect(sub.unsubscribe).to.be.a('function');
  });
});
