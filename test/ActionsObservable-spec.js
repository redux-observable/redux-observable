/* globals describe it */
import { expect } from 'chai';
import { ActionsObservable, createEpicMiddleware } from '../';
import { createStore, applyMiddleware } from 'redux';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';

describe('ActionsObservable', () => {
  it('should exist', () => {
    expect(ActionsObservable).to.be.a('function');
  });

  it('should be the type provided to a dispatched function', () => {
    let middleware = createEpicMiddleware();
    let reducer = (state, action) => {
      return state;
    };

    let store = createStore(reducer, applyMiddleware(middleware));

    store.dispatch((arg1) => {
      expect(arg1).to.be.an.instanceof(ActionsObservable);
      return of({ type: 'WEEE' });
    });
  });

  describe('ofType operator', () => {
    it('should filter by action type', () => {
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

    it('should filter by multiple action types', () => {
      let actions = new Subject();
      let actionsObs = new ActionsObservable(actions);
      let lulz = [];
      let haha = [];

      actionsObs.ofType('LULZ', 'LARF').subscribe(x => lulz.push(x));
      actionsObs.ofType('HAHA').subscribe(x => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'LARF', i: 1 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LARF', i: 1 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LARF', i: 1 }]);
      expect(haha).to.deep.equal([{ type: 'HAHA', i: 0 }]);
    });
  });
});
