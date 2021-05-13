import { expect } from 'chai';
import { of, Subject } from 'rxjs';
import { ofType, __FOR_TESTING__resetDeprecationsSeen as resetDeprecationsSeen } from '../';
import { AnyAction } from 'redux';
import sinon from 'sinon';
import { map } from 'rxjs/operators';

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

    it('should narrow type based for primitive type', () => {
      enum StringEnum {
        A = 'A',
        B = 'B'
      }

      enum NumericEnum {
        A = 100,
        B = 200,
      }

      const symbolA: unique symbol = Symbol();
      const symbolB = Symbol();

      type StringLiteralAction = {
        type: 'stringLiteralA';
        stringLiteralA: string;
      } | {
        type: 'stringLiteralB';
        stringLiteralB: string;
      };

      type NumericLiteralAction = {
        type: 0;
        numericLiteral0: string;
      } | {
        type: 1;
        numericLiteral1: string;
      }

      type StringEnumAction = {
        type: StringEnum.A;
        stringEnumA: string;
      } | {
        type: StringEnum.B;
        stringEnumB: string;
      };

      type NumericEnumAction = {
        type: NumericEnum.A;
        numericEnumA: string;
      } | {
        type: NumericEnum.B;
        numericEnumB: string;
      };

      type SymbolAction = {
        type: typeof symbolA;
        symbolA: string;
      } | {
        type: typeof symbolB;
        symbolB: string;
      }

      class Constructor {}

      type SpecialAction = {
        type: undefined;
        undefined: string;
      } | {
        type: null;
        null: string;
      } | {
        type: {foo: 'bar'};
        objectLiteral: string;
      } | {
        type: true;
        true: string;
      } | {
        type: false;
        false: string;
      } | {
        type: typeof Constructor;
        constructor: string;
      };


      type TestAction = StringLiteralAction | NumericLiteralAction | StringEnumAction | NumericEnumAction | SymbolAction | SpecialAction;

      // This test only verify the following code can be compiled

      of<TestAction>().pipe(ofType('stringLiteralA'), map((x) => x.stringLiteralA));
      of<TestAction>().pipe(ofType('stringLiteralB'), map((x) => x.stringLiteralB));
      of<TestAction>().pipe(ofType(0), map((x) => x.numericLiteral0));
      of<TestAction>().pipe(ofType(1), map((x) => x.numericLiteral1));
      of<TestAction>().pipe(ofType(StringEnum.A), map((x) => x.stringEnumA));
      of<TestAction>().pipe(ofType(StringEnum.B), map((x) => x.stringEnumB));

      // Maybe a bug of typescript: When type of Action contains both numeric literal and numeric enum,
      // ofType cannot narrow for numeric enum type, so the following does not compile
      //
      //   of<TestAction>().pipe(ofType(NumericEnum.A), map((x) => x.value6));
      //   of<TestAction>().pipe(ofType(NumericEnum.B), map((x) => x.value7));
      //
      // But the following code compiles
      of<Exclude<TestAction, NumericLiteralAction>>().pipe(ofType(NumericEnum.A), map((x => x.numericEnumA)));
      of<Exclude<TestAction, NumericLiteralAction>>().pipe(ofType(NumericEnum.B), map((x => x.numericEnumB)));

      of<TestAction>().pipe(ofType(symbolA), map((x) => x.symbolA));
      of<TestAction>().pipe(ofType(symbolB), map((x) => x.symbolB));
      of<TestAction>().pipe(ofType({ foo: 'bar' }), map((x) => x.objectLiteral));
      of<TestAction>().pipe(ofType(undefined), map((x) => x.undefined));
      of<TestAction>().pipe(ofType(true), map((x) => x.true));
      of<TestAction>().pipe(ofType(false), map((x) => x.false));
      of<TestAction>().pipe(ofType(Constructor), map((x) => x.constructor));
    });
  });
});
