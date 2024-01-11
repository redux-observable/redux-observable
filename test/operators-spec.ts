import { UnknownAction } from 'redux';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ofType, __FOR_TESTING__resetDeprecationsSeen as resetDeprecationsSeen } from '../src';

describe('operators', () => {
  describe('ofType', () => {
    afterEach(() => {
      vi.resetAllMocks();
      resetDeprecationsSeen();
    });

    it('should filter by action type', () => {
      expect.assertions(6);
      const actions = new Subject<UnknownAction>();
      const lulz: UnknownAction[] = [];
      const haha: UnknownAction[] = [];

      actions.pipe(ofType('LULZ')).subscribe((x) => lulz.push(x));
      actions.pipe(ofType('HAHA')).subscribe((x) => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).toEqual([{ type: 'LULZ', i: 0 }]);
      expect(haha).toEqual([]);

      actions.next({ type: 'LULZ', i: 1 });

      expect(lulz).toEqual([
        { type: 'LULZ', i: 0 },
        { type: 'LULZ', i: 1 },
      ]);
      expect(haha).toEqual([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).toEqual([
        { type: 'LULZ', i: 0 },
        { type: 'LULZ', i: 1 },
      ]);
      expect(haha).toEqual([{ type: 'HAHA', i: 0 }]);
    });

    it('should filter by multiple action types', () => {
      expect.assertions(6);
      const actions = new Subject<UnknownAction>();
      const lulz: UnknownAction[] = [];
      const haha: UnknownAction[] = [];

      actions.pipe(ofType('LULZ', 'LARF')).subscribe((x) => lulz.push(x));
      actions.pipe(ofType('HAHA')).subscribe((x) => haha.push(x));

      actions.next({ type: 'LULZ', i: 0 });

      expect(lulz).toEqual([{ type: 'LULZ', i: 0 }]);
      expect(haha).toEqual([]);

      actions.next({ type: 'LARF', i: 1 });

      expect(lulz).toEqual([
        { type: 'LULZ', i: 0 },
        { type: 'LARF', i: 1 },
      ]);
      expect(haha).toEqual([]);

      actions.next({ type: 'HAHA', i: 0 });

      expect(lulz).toEqual([
        { type: 'LULZ', i: 0 },
        { type: 'LARF', i: 1 },
      ]);
      expect(haha).toEqual([{ type: 'HAHA', i: 0 }]);
    });

    it('should warn about not passing any values', () => {
      expect.assertions(2);
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error deliberately passing nothing
      ofType();

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('redux-observable | WARNING: ofType was called without any types!');
    });

    it('should warn about using nullsy values', () => {
      expect.assertions(2);
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // @ts-expect-error deliberately passing null
      ofType('foo', null);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(
        'redux-observable | WARNING: ofType was called with one or more undefined or null values!',
      );
    });
  });
});
