/* globals describe it */
import { expect } from 'chai';
import sinon from 'sinon';
import { combineEpics, ActionsObservable, ofType } from '../';
import { Subject } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

describe('combineEpics', () => {
  it('should combine epics', () => {
    const epic1 = (actions, store) =>
      actions.pipe(
        ofType('ACTION1'),
        map(action => ({ type: 'DELEGATED1', action, store }))
      );
    const epic2 = (actions, store) =>
      actions.pipe(
        ofType('ACTION2'),
        map(action => ({ type: 'DELEGATED2', action, store }))
      );

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
    const epic1 = sinon.stub().returns(['first']);
    const epic2 = sinon.stub().returns(['second']);

    const rootEpic = combineEpics(
      epic1,
      epic2
    );

    rootEpic(1, 2, 3, 4).pipe(toArray()).subscribe(values => {
      expect(values).to.deep.equal(['first', 'second']);

      expect(epic1.callCount).to.equal(1);
      expect(epic2.callCount).to.equal(1);

      expect(epic1.firstCall.args).to.deep.equal([1, 2, 3, 4]);
      expect(epic2.firstCall.args).to.deep.equal([1, 2, 3, 4]);

      done();
    });
  });

  it('should return a new epic that, when called, errors if one of the combined epics doesn\'t return anything', () => {
    const epic1 = () => [];
    const epic2 = () => {};
    const rootEpic = combineEpics(epic1, epic2);

    expect(() => {
      rootEpic();
    }).to.throw('combineEpics: one of the provided Epics "epic2" does not return a stream. Double check you\'re not missing a return statement!');
  });

  describe('returned epic function name', () => {
    const epic1 = () => 'named epic';
    const epic2 = () => 'named epic';
    const epic3 = () => 'named epic';

    it('should name the new epic with `combineEpics(...epic names)`', () => {
      const rootEpic = combineEpics(epic1, epic2);

      expect(rootEpic).to.have.property('name').that.equals('combineEpics(epic1, epic2)');
    });

    it('should annotate combined anonymous epics with `<anonymous>`', () => {
      const rootEpic = combineEpics(() => 'anonymous', epic2);

      expect(rootEpic).to.have.property('name').that.equals('combineEpics(<anonymous>, epic2)');
    });

    it('should include all combined epic names in the returned epic', () => {
      const rootEpic = combineEpics(epic1, epic2, epic3);

      expect(rootEpic).to.have.property('name').that.equals('combineEpics(epic1, epic2, epic3)');
    });
  });
});
