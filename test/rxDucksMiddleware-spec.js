/* globals describe it */
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import { rxDucksMiddleware } from '../';
import { map } from 'rxjs/operator/map';

describe('rxDucksMiddleware', () => {
  it('should exist', () => {
    expect(rxDucksMiddleware).to.be.a('function');
  });

  it('should intercept and process actions', () => {
    const middleware = rxDucksMiddleware((actions) => actions::map(x => ({ ...x, data: x.data + '!' })));
    const reducedActions = [];

    const store = createStore((state = { data: 'start' }, action) => {
      reducedActions.push(action);
      return state;
    }, applyMiddleware(middleware));

    middleware.connect();

    store.dispatch({ type: 'TEST', data: 'this' });
    store.dispatch({ type: 'TEST', data: 'should' });
    store.dispatch({ type: 'TEST', data: 'work' });

    expect(reducedActions).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'TEST', data: 'this!' },
      { type: 'TEST', data: 'should!' },
      { type: 'TEST', data: 'work!' }
    ]);

    middleware.unsubscribe();

    store.dispatch({ type: 'BAD', data: 'should not show up' });

    expect(reducedActions).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'TEST', data: 'this!' },
      { type: 'TEST', data: 'should!' },
      { type: 'TEST', data: 'work!' }
    ]);

    middleware.connect();

    store.dispatch({ type: 'LAST_ONE', data: 'one for the road' });
    expect(reducedActions).to.deep.equal([
      { type: '@@redux/INIT' },
      { type: 'TEST', data: 'this!' },
      { type: 'TEST', data: 'should!' },
      { type: 'TEST', data: 'work!' },
      { type: 'LAST_ONE', data: 'one for the road!' }
    ]);
  });
});
