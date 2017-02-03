import { filter } from 'rxjs/operator/filter';

export const ofType = function(...keys) {
  return this::filter(({ type }) => {
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
