import { filter } from 'rxjs/operator/filter';

export function ofType(...keys) {
  return function ofTypeOperatorFunction(source) {
    return source::filter(({ type }) => {
      const len = keys.length;
      if (len === 1) {
        return type === keys[0];
      } else {
        for (let i = 0; i < len; i++) {
          if (keys[i] === type) {
            return true;
          }
        }
      }
      return false;
    });
  };
}
