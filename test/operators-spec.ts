import { expect } from 'chai';
import { Subject } from 'rxjs';
import { ofType, __FOR_TESTING__resetDeprecationsSeen as resetDeprecationsSeen } from '../';
import { AnyAction } from 'redux';
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
      let actions = new Subject<AnyAction>();
      let lulz: AnyAction[] = [];
      let haha: AnyAction[] = [];

      actions.pipe(ofType('LULZ')).subscribe(x => lulz.push(x));
      actions.pipe(ofType('HAHA')).subscribe(x => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'LULZ', i: 1 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LULZ', i: 1 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LULZ', i: 1 }]);
      expect(haha).to.deep.equal([{ type: 'HAHA', i: 0 }]);
    });

    it('should filter by multiple action types', () => {
      let actions = new Subject<AnyAction>();
      let lulz: AnyAction[] = [];
      let haha: AnyAction[] = [];

      actions.pipe(ofType('LULZ', 'LARF')).subscribe(x => lulz.push(x));
      actions.pipe(ofType('HAHA')).subscribe(x => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'LARF', i: 1 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LARF', i: 1 }]);
      expect(haha).to.deep.equal([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).to.deep.equal([{ type: 'LULZ', i: 0 }, { type: 'LARF', i: 1 }]);
      expect(haha).to.deep.equal([{ type: 'HAHA', i: 0 }]);
    });

    it('should handle actionCreators which define a toString method', () => {
      // This helps when using the popular `redux-actions` npm package.
      const actions = new Subject<AnyAction>();
      const cache1: AnyAction[] = [];
      const cache2: AnyAction[] = [];
      const LULZ_TYPE = 'LULZ';
      const HAHA_TYPE = 'HAHA';
      const LARF_TYPE = Symbol();

      const createActionCreator = (type: string | symbol) => {
        const actionCreator = (payload: number) => ({ type, payload });
        actionCreator.toString = () => type;
        return actionCreator;
      };

      const lulz = createActionCreator(LULZ_TYPE);
      const haha = createActionCreator(HAHA_TYPE);
      const larf = createActionCreator(LARF_TYPE);

      // Sanity check.
      expect(String(lulz)).to.deep.equal(LULZ_TYPE);
      expect(lulz(0)).to.deep.equal({ type: LULZ_TYPE, payload: 0 });

      actions.pipe(ofType(lulz, larf)).subscribe(x => cache1.push(x));
      actions.pipe(ofType(haha)).subscribe(x => cache2.push(x));

      actions.next(lulz(0));
      expect(cache1).to.deep.equal([lulz(0)]);
      expect(cache2).to.deep.equal([]);

      actions.next(larf(1));
      expect(cache1).to.deep.equal([lulz(0), larf(1)]);
      expect(cache2).to.deep.equal([]);

      actions.next(haha(0));
      expect(cache1).to.deep.equal([lulz(0), larf(1)]);
      expect(cache2).to.deep.equal([haha(0)]);
    });

    it('should not fail when types are symbols', () => {
      const actions = new Subject<AnyAction>();
      const cache1: AnyAction[] = [];
      const cache2: AnyAction[] = [];
      const LULZ_TYPE = Symbol();
      const HAHA_TYPE = Symbol();
      const LARF_TYPE = Symbol();

      actions.pipe(ofType(LULZ_TYPE as symbol, LARF_TYPE as symbol)).subscribe(x => cache1.push(x));
      actions.pipe(ofType(HAHA_TYPE)).subscribe(x => cache2.push(x));

      actions.next({ type: LULZ_TYPE, i: 0 });

      expect(cache1).to.deep.equal([{ type: LULZ_TYPE, i: 0 }]);
      expect(cache2).to.deep.equal([]);

      actions.next({ type: LARF_TYPE, i: 1 });

      expect(cache1).to.deep.equal([{ type: LULZ_TYPE, i: 0 }, { type: LARF_TYPE, i: 1 }]);
      expect(cache2).to.deep.equal([]);

      actions.next({ type: HAHA_TYPE, i: 0 });

      expect(cache1).to.deep.equal([{ type: LULZ_TYPE, i: 0 }, { type: LARF_TYPE, i: 1 }]);
      expect(cache2).to.deep.equal([{ type: HAHA_TYPE, i: 0 }]);
    });

    it('should warn about not passing any values', () => {
      spySandbox.spy(console, 'warn');

      // @ts-ignore
      const _operator = ofType();

      expect((console.warn as sinon.SinonSpy).callCount).to.equal(1);
      expect((console.warn as sinon.SinonSpy).getCall(0).args[0]).to.equal('redux-observable | WARNING: ofType was called without any types!');
    });

    it('should warn about using nullsy values', () => {
      spySandbox.spy(console, 'warn');
      const _operator = ofType('foo', null);

      expect((console.warn as sinon.SinonSpy).callCount).to.equal(1);
      expect((console.warn as sinon.SinonSpy).getCall(0).args[0]).to.equal('redux-observable | WARNING: ofType was called with one or more undefined or null values!');
    });
  });
});
