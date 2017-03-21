/* globals describe it */
import { expect } from 'chai';
import { transformEpic, ActionsObservable } from '../';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';
import { _catch } from 'rxjs/operator/catch';
import { of } from 'rxjs/observable/of';

describe('transformEpic', () => {
  it('should transform an epic', () => {
    const epicInput = (actions, store) =>
      actions.ofType('ACTION1')::map(action => ({ type: 'DELEGATED1', action, store }));
    const transformer = (actions, store) =>
      actions.ofType('DELEGATED1')::map(action => ({ type: 'DELEGATED2', action, store }));

    const epic = transformEpic(
      epicInput,
      transformer
    );

    const store = { I: 'am', a: 'store' };
    const subject = new Subject();
    const actions = new ActionsObservable(subject);
    const result = epic(actions, store);
    const emittedActions = [];

    result.subscribe(emittedAction => emittedActions.push(emittedAction));

    const triggerAction = { type: 'ACTION1' };
    subject.next(triggerAction);

    expect(emittedActions).to.deep.equal([
      { type: 'DELEGATED2', action: { type: 'DELEGATED1', action: triggerAction, store }, store },
    ]);
  });

  it('should work if the underlying epic errors', () => {
    const error = new Error('test');

    const epicInput = (actions, store) =>
      actions.ofType('ACTION1')::map(action => { throw error; });
    const transformer = (actions, store) =>
      actions::_catch(err => of({ type: 'ERROR', error: err }));

    const epic = transformEpic(
      epicInput,
      transformer
    );

    const store = { I: 'am', a: 'store' };
    const subject = new Subject();
    const actions = new ActionsObservable(subject);
    const result = epic(actions, store);
    const emittedActions = [];

    result.subscribe(emittedAction => emittedActions.push(emittedAction));

    subject.next({ type: 'ACTION1' });

    expect(emittedActions).to.deep.equal([
      { type: 'ERROR', error }
    ]);
  });
});
