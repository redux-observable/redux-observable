import { expect } from 'chai';
import sinon from 'sinon';
import { combineEpics, ActionsObservable, ofType, Epic, StateObservable } from '../';
import { Action } from 'redux';
import { Subject, Observable, EMPTY } from 'rxjs';
import { map, toArray } from 'rxjs/operators';

describe('combineEpics', () => {
  it('should combine epics', () => {
    const epic1: Epic = (actions, store) =>
      actions.pipe(
        ofType('ACTION1'),
        map(action => ({ type: 'DELEGATED1', action, store }))
      );
    const epic2: Epic = (actions, store) =>
      actions.pipe(
        ofType('ACTION2'),
        map(action => ({ type: 'DELEGATED2', action, store }))
      );

    const epic = combineEpics(
      epic1,
      epic2
    );

    const store = new StateObservable(new Subject(), { I: 'am', a: 'store' });
    const subject = new Subject<Action>();
    const actions = new ActionsObservable(subject);
    const result: Observable<Action> = (epic as any)(actions, store);
    const emittedActions: any[] = [];

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
    ) as <T>(...args: T[]) => Observable<T>;

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
    const epic1 = () => EMPTY;
    const epic2: () => any = () => {};
    const rootEpic = combineEpics(epic1, epic2);

    expect(() => {
      rootEpic(1 as any, 2 as any, 3 as any);
    }).to.throw('combineEpics: one of the provided Epics "epic2" does not return a stream. Double check you\'re not missing a return statement!');
  });

  describe('returned epic function name', () => {
    const epic1 = () => EMPTY;
    const epic2 = () => EMPTY;
    const epic3 = () => EMPTY;

    it('should name the new epic with `combineEpics(...epic names)`', () => {
      const rootEpic = combineEpics(epic1, epic2);

      expect(rootEpic).to.have.property('name').that.equals('combineEpics(epic1, epic2)');
    });

    it('should annotate combined anonymous epics with `<anonymous>`', () => {
      const rootEpic = combineEpics(() => EMPTY, epic2);

      expect(rootEpic).to.have.property('name').that.equals('combineEpics(<anonymous>, epic2)');
    });

    it('should include all combined epic names in the returned epic', () => {
      const rootEpic = combineEpics(epic1, epic2, epic3);

      expect(rootEpic).to.have.property('name').that.equals('combineEpics(epic1, epic2, epic3)');
    });
  });
});
