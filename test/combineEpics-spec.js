/* globals describe it */
import { expect } from 'chai';
import { combineEpics, ActionsObservable } from '../';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';

describe('combineEpics', () => {
  it('should combine epics', () => {
    let epic1 = (actions, store) =>
      actions.ofType('ACTION1')::map(action => ({ type: 'DELEGATED1', action, store }));
    let epic2 = (actions, store) =>
      actions.ofType('ACTION2')::map(action => ({ type: 'DELEGATED2', action, store }));

    let epic = combineEpics(
      epic1,
      epic2
    );

    let store = { I: 'am', a: 'store' };
    let subject = new Subject();
    let actions = new ActionsObservable(subject);
    let result = epic(actions, store);
    let emittedActions = [];

    result.subscribe(emittedAction => emittedActions.push(emittedAction));

    subject.next({ type: 'ACTION1' });
    subject.next({ type: 'ACTION2' });

    expect(emittedActions).to.deep.equal([
      { type: 'DELEGATED1', action: { type: 'ACTION1' }, store },
      { type: 'DELEGATED2', action: { type: 'ACTION2' }, store },
    ]);
  });
});
