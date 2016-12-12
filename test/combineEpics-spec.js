/* globals describe it */
import { expect } from 'chai';
import sinon from 'sinon';
import { combineEpics, ActionsObservable } from '../src';
import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';
import { of } from 'rxjs/observable/of';
import { toArray } from 'rxjs/operator/toArray';
import { Observable } from 'rxjs/Observable';

describe('combineEpics', () => {
  it('should combine epics', () => {
    const epic1 = (actions, store) =>
      actions.ofType('ACTION1')::map(action => ({ type: 'DELEGATED1', action, store }));
    const epic2 = (actions, store) =>
      actions.ofType('ACTION2')::map(action => ({ type: 'DELEGATED2', action, store }));

    const epic = combineEpics(
      epic1,
      epic2
    );

    const store = { I: 'am', a: 'store' };
    const subject = new Subject();
    const actions = new ActionsObservable(subject);
    const result = epic(actions, store);
    const emittedActions = [];

    result.subscribe(emittedAction => emittedActions.push(emittedAction));

    subject.next({ type: 'ACTION1' });
    subject.next({ type: 'ACTION2' });

    expect(emittedActions).to.deep.equal([
      { type: 'DELEGATED1', action: { type: 'ACTION1' }, store },
      { type: 'DELEGATED2', action: { type: 'ACTION2' }, store },
    ]);
  });

  it('should pass along every argument arbitrarily', (done) => {
    const epic1 = sinon.stub().returns(Observable::of('first'));
    const epic2 = sinon.stub().returns(Observable::of('second'));

    const rootEpic = combineEpics(
      epic1,
      epic2
    );

    rootEpic(1, 2, 3, 4)::toArray().subscribe(values => {
      expect(values).to.deep.equal(['first', 'second']);

      expect(epic1.callCount).to.equal(1);
      expect(epic2.callCount).to.equal(1);

      expect(epic1.firstCall.args).to.deep.equal([1, 2, 3, 4]);
      expect(epic2.firstCall.args).to.deep.equal([1, 2, 3, 4]);

      done();
    });
  });

  it('should return a new epic that, when called, errors if one of the combined epics doesn\'t return anything', () => {
    const epic1 = (actions) => actions.ofType('ACTION1')::map(_ => 'DELEGATED1');
    const epic2 = () => {};

    expect(() => {
      const rootEpic = combineEpics(epic1, epic2);
      const actions = new ActionsObservable(new Subject());
      rootEpic(actions, {});
    }).to.throw('combineEpics: one of the provided Epics "epic2" does not return a stream. Double check you\'re not missing a return statement!');
  });

  it('should return a new epic that, when called, errors if one of the compined epics doesn\'t return subscribable', () => {
    const epic1 = (actions) => actions.ofType('ACTION1')::map(_ => 'DELEGATED1');
    const epic2 = (actions) => ({});

    const rootEpic = combineEpics(epic1, epic2);
    const actions = new ActionsObservable(new Subject());

    expect(() => {
      rootEpic(actions, {});
    }).to.throw('combineEpics: one of the provided Epics "epic2" does not return a stream. Double check you\'re not missing a return statement!');
  });
});
