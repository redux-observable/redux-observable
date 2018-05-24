/* globals describe it beforeEach afterEach */
import { expect } from 'chai';
import sinon from 'sinon';
import { StateObservable } from '../';
import { Observable, Subject } from 'rxjs';

describe('StateObservable', () => {
  let spySandbox;

  beforeEach(() => {
    spySandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    spySandbox.restore();
  });

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

  it('should only update when the next value shallowly differs', () => {
    const input$ = new Subject();
    const state$ = new StateObservable(input$);
    const next = spySandbox.spy();
    state$.subscribe(next);

    expect(state$.value).to.equal(undefined);
    expect(next.callCount).to.equal(0);

    const first = { value: 'first' };
    input$.next(first);
    expect(state$.value).to.equal(first);
    expect(next.callCount).to.equal(1);
    expect(next.getCall(0).args).to.deep.equal([first]);

    input$.next(first);
    expect(state$.value).to.equal(first);
    expect(next.callCount).to.equal(1);

    first.value = 'something else';
    input$.next(first);
    expect(state$.value).to.equal(first);
    expect(next.callCount).to.equal(1);

    const second = { value: 'second' };
    input$.next(second);
    expect(state$.value).to.equal(second);
    expect(next.callCount).to.equal(2);
    expect(next.getCall(1).args).to.deep.equal([second]);
  });
});
