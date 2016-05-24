/* globals describe it */
import { expect } from 'chai';
import { combineDelegators, ActionsObservable } from '../';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';

describe('combineDelegators', () => {
  it('should combine delegators', () => {
    let delegator1 = (actions, store) =>
      actions.ofType('ACTION1')::map(action => ({ type: 'DELEGATED1', action, store }));
    let delegator2 = (actions, store) =>
      actions.ofType('ACTION2')::map(action => ({ type: 'DELEGATED2', action, store }));

    let delegator = combineDelegators(
      delegator1,
      delegator2
    );

    let store = { I: 'am', a: 'store' };
    let subject = new Subject();
    let actions = new ActionsObservable(subject);
    let result = delegator(actions, store);
    let delegatedActions = [];

    result.subscribe(delegatedAction => delegatedActions.push(delegatedAction));

    subject.next({ type: 'ACTION1' });
    subject.next({ type: 'ACTION2' });

    expect(delegatedActions).to.deep.equal([
      { type: 'DELEGATED1', action: { type: 'ACTION1' }, store },
      { type: 'DELEGATED2', action: { type: 'ACTION2' }, store },
    ]);
  });
});
