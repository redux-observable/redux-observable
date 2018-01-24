/* globals describe it */
import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';
import { delay } from 'rxjs/operator/delay';
import { combineEpics, wrapClosableEpic, ActionsObservable } from '../';

describe('closableEpic', () => {
  const epic1 = actions =>
    actions.ofType('ACTION1')::map(action => ({ type: 'DELEGATED1', action }));
  const epic2 = (actions, store) =>
    actions
      .ofType('ACTION2')
      ::delay(1000)
      ::map(action => ({ type: 'DELEGATED2', action }));

  const epic = combineEpics(epic1, epic2);
  const closableEpic = wrapClosableEpic(epic);

  it('closableEpic is a function', () => {
    expect(closableEpic).to.be.a('function');
  });

  it('closableEpic with close method', () => {
    expect(closableEpic.close).to.be.a('function');
  });

  it('close callback will be hook when all actions sent', () => {
    const subject = new Subject();
    const actions = new ActionsObservable(subject);

    const result = closableEpic(actions);
    const emittedActions = [];
    result.subscribe(emittedAction => emittedActions.push(emittedAction));

    subject.next({ type: 'ACTION1' });
    subject.next({ type: 'ACTION2' });

    closableEpic.close(() => {
      expect(emittedActions).to.deep.equal([
        { type: 'DELEGATED1', action: { type: 'ACTION1' } },
        { type: 'DELEGATED2', action: { type: 'ACTION2' } },
      ]);
    });
  });
});
