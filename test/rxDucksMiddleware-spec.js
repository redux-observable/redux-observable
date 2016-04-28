/* globals describe it */
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { rxDucksMiddleware } from '../';
import { merge } from 'rxjs/observable/merge';
import { map } from 'rxjs/operator/map';
import { filter } from 'rxjs/operator/filter';

describe('rxDucksMiddleware', () => {
  it('should exist', () => {
    expect(rxDucksMiddleware).to.be.a('function');
  });

  it('should intercept and process actions', () => {
    const part1 = (actions) => actions::filter(({ type }) => type === 'TEST1')
      ::map(() => ({ type: 'TEST1_HANDLED' }));

    const part2 = (actions) => actions::filter(({ type }) => type === 'TEST2')
      ::map(() => ({ type: 'TEST2_HANDLED' }));

    const reducer = (state = [], action) => state.concat(action);

    const middleware = rxDucksMiddleware((actions) =>
      merge(part1(actions), part2(actions)));

    const store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch({ type: 'TEST1' });
    store.dispatch({ type: 'TEST2' });

    expect(store.getState()).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'TEST1' },
      { type: 'TEST1_HANDLED' },
      { type: 'TEST2' },
      { type: 'TEST2_HANDLED' }
    ]);
  });
});
