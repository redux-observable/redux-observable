/* globals describe it */
import { expect } from 'chai';
import { ActionsObservable, reduxObservable } from '../';
import { createStore, applyMiddleware } from 'redux';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';

describe('ActionsObservable', () => {
  it('should exist', () => {
    expect(ActionsObservable).to.be.a('function');
  });

  it('should be the type provided to a dispatched function', () => {
    let middleware = reduxObservable();
    let reducer = (state, action) => {
      return state;
    };

    let store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch((arg1) => {
      expect(arg1).to.be.an.instanceof(ActionsObservable);
      return of({ type: 'WEEE' });
    });
  });

  it('should have a ofType operator that filters by action type', () => {
    let actions = new Subject();
    let actionsObs = new ActionsObservable(actions);
    let lulz = [];
    let haha = [];

    actionsObs.ofType('LULZ').subscribe(x => lulz.push(x));
    actionsObs.ofType('HAHA').subscribe(x => haha.push(x));

    actions.next({ type: 'LULZ', i: 0 });

    expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }]);
    expect(haha).to.deep.equal([]);

    actions.next({ type: 'LULZ', i: 1 });

    expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LULZ', i: 1 }]);
    expect(haha).to.deep.equal([]);

    actions.next({ type: 'HAHA', i: 0 });

    expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LULZ', i: 1 }]);
    expect(haha).to.deep.equal([{ type: 'HAHA', i: 0 }]);
  });
});
