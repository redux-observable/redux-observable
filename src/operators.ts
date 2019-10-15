import { Action } from 'redux';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

const keyHasType = (type: unknown, key: unknown) => {
  return type === key || typeof key === 'function' && type === key.toString();
};

export const ofType = <T extends Action, R extends T = T, K extends R['type'] = R['type']>(...keys: K[]) => (source: Observable<T>) => source.pipe(
  filter<T, R>((action): action is R => {
    const { type } = action;
    const len = keys.length;
    if (len === 1) {
      return keyHasType(type, keys[0]);
    } else {
      for (let i = 0; i < len; i++) {
        if (keyHasType(type, keys[i])) {
          return true;
        }
      }
    }
    return false;
  })
);
