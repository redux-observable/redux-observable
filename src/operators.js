import { filter } from 'rxjs/operator/filter';

const keyHasType = (type, key) => {
  return type === key || typeof key === 'function' && type === key.toString();
};

export function ofType(...keys) {
  return function ofTypeOperatorFunction(source) {
    return source::filter(({ type }) => {
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
    });
  };
}
