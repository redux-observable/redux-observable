import { expect } from 'chai';
import { Subject } from 'rxjs';
import {
  ofType,
  __FOR_TESTING__resetDeprecationsSeen as resetDeprecationsSeen,
} from '../src';
import { UnknownAction } from 'redux';
import sinon from 'sinon';

describe('operators', () => {
  describe('ofType', () => {
    let spySandbox: sinon.SinonSandbox;

    beforeEach(() => {
      spySandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      spySandbox.restore();
      resetDeprecationsSeen();
    });

    it('should filter by action type', () => {
      let actions = new Subject<UnknownAction>();
      let lulz: UnknownAction[] = [];
      let haha: UnknownAction[] = [];

      actions.pipe(ofType('LULZ')).subscribe((x) => lulz.push(x));
      actions.pipe(ofType('HAHA')).subscribe((x) => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'LULZ', i: 1 });

      expect(lulz).to.deep.equal([
        { type: 'LULZ', i: 0 },
        { type: 'LULZ', i: 1 },
      ]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).to.deep.equal([
        { type: 'LULZ', i: 0 },
        { type: 'LULZ', i: 1 },
      ]);
      expect(haha).to.deep.equal([{ type: 'HAHA', i: 0 }]);
    });

    it('should filter by multiple action types', () => {
      let actions = new Subject<UnknownAction>();
      let lulz: UnknownAction[] = [];
      let haha: UnknownAction[] = [];

      actions.pipe(ofType('LULZ', 'LARF')).subscribe((x) => lulz.push(x));
      actions.pipe(ofType('HAHA')).subscribe((x) => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'LARF', i: 1 });

      expect(lulz).to.deep.equal([
        { type: 'LULZ', i: 0 },
        { type: 'LARF', i: 1 },
      ]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).to.deep.equal([
        { type: 'LULZ', i: 0 },
        { type: 'LARF', i: 1 },
      ]);
      expect(haha).to.deep.equal([{ type: 'HAHA', i: 0 }]);
    });

    it('should warn about not passing any values', () => {
      spySandbox.spy(console, 'warn');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const _operator = ofType();

      expect((console.warn as sinon.SinonSpy).callCount).to.equal(1);
      expect((console.warn as sinon.SinonSpy).getCall(0).args[0]).to.equal(
        'redux-observable | WARNING: ofType was called without any types!'
      );
    });

    it('should warn about using nullsy values', () => {
      spySandbox.spy(console, 'warn');
      // @ts-expect-error deliberately passing null
      const _operator = ofType('foo', null);

      expect((console.warn as sinon.SinonSpy).callCount).to.equal(1);
      expect((console.warn as sinon.SinonSpy).getCall(0).args[0]).to.equal(
        'redux-observable | WARNING: ofType was called with one or more undefined or null values!'
      );
    });
  });
});
