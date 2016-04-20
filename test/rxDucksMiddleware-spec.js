/* globals describe it */
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { rxDucksMiddleware } from '../';
import { map } from 'rxjs/operator/map';

describe('rxDucksMiddleware', () => {
  it('should exist', () => {
    expect(rxDucksMiddleware).to.be.a('function');
  });

  it('should wire up some middleware', () => {
    const { actions, send, middleware } = rxDucksMiddleware();
    const middleActions = [];
    const reducedActions = [];

    const store = createStore((state = { data: 0 }, action) => {
      reducedActions.push(action);
      return state;
    }, applyMiddleware(middleware));

    actions.subscribe(action => middleActions.push(action));

    actions::map(({ type, data }) => ({ type, data: data + 1 }))
      .subscribe(send);

    const originalActions = [{ type: 'TEST', data: 1 }, { type: 'TEST', data: 2 }, { type: 'TEST', data: 3 }];
    const middleExpected = [...originalActions];
    const reducedExpected = [{ type: '@@redux/INIT' }, ...middleExpected.map(({ type, data }) => ({ type, data: data + 1 }))];

    originalActions.forEach(action => store.dispatch(action));

    expect(middleActions).to.deep.equal(middleExpected);
    expect(reducedActions).to.deep.equal(reducedExpected);
  });
});
