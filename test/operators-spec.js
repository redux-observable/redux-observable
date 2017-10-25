/* globals describe it */
import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
import { ofType } from '../';

describe('operators', () => {
  describe('ofType', () => {
    it('should filter by action type', () => {
      let actions = new Subject();
      let lulz = [];
      let haha = [];

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
      let actions = new Subject();
      let lulz = [];
      let haha = [];

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
  });
});
