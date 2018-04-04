/* globals describe it */
import { expect } from 'chai';
import { StateObservable } from '../';
import { Observable, Subject } from 'rxjs';

describe('StateObservable', () => {
  it('should exist', () => {
    expect(StateObservable.prototype).to.be.instanceof(Observable);
  });

  it('should mirror the source subject', () => {
    const input$ = new Subject();
    const state$ = new StateObservable(input$);
    let result = null;

    state$.subscribe(state => {
      result = state;
    });

    expect(result).to.equal(null);
    input$.next('first');
    expect(result).to.equal('first');
    input$.next('second');
    expect(result).to.equal('second');
  });

  it('should cache last state on the `value` property', () => {
    const input$ = new Subject();
    const state$ = new StateObservable(input$);

    expect(state$.value).to.equal(undefined);
    input$.next('first');
    expect(state$.value).to.equal('first');
    input$.next('second');
    expect(state$.value).to.equal('second');
  });
});
