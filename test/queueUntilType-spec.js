/* globals describe it */
import { expect } from 'chai';
import { ActionsObservable, queueUntilType } from '../';
import { Subject } from 'rxjs/Subject';
import { toArray } from 'rxjs/operator/toArray';

describe('queueUntilType', () => {
  it('should return an observable', () => {
    const actual = ActionsObservable.of({ type: 'FOO' })
      ::queueUntilType('BAR');
    expect(typeof actual[Symbol.observable]).to.equal('function');
  });
  it('should queue actions', () => {
    ActionsObservable.of({ type: 'FOO' }, { type: 'BAR' })
      ::queueUntilType('BAz')
      ::toArray()
      .subscribe(
        (results) => {
          expect(results.length).to.equal(0);
        }
      );
  });
  it('should flush queue after expected type but not expected type', () => {
    ActionsObservable.of({ type: 'FOO' }, { type: 'BAR' }, { type: 'BAZ' })
      ::queueUntilType('BAZ')
      ::toArray()
      .subscribe(
        (results) => {
          expect(results.length).to.equal(2);
          expect(results[0].type).to.equal('FOO');
          expect(results[1].type).to.equal('BAR');
          expect(results[2]).to.equal(undefined);
        }
      );
  });

  it('should pass through actions after flushing', next => {
    const input$ = new Subject();
    const action$ = new ActionsObservable(input$);
    action$::queueUntilType('FOO')
      ::toArray()
      .subscribe(results => {
        expect(results.length).to.equal(2);
        expect(results[0].type).to.equal('PRE');
        expect(results[1].type).to.equal('POST');
        next();
      });
    input$.next({ type: 'PRE' });
    input$.next({ type: 'FOO' });
    input$.next({ type: 'POST' });
    input$.complete();
  });
});
