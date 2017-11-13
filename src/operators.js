import { filter } from 'rxjs/operator/filter';

const keyHasType = type => key => {
  return type === key || typeof key === 'function' && type === key.toString();
};

export function ofType(...keys) {
  return function ofTypeOperatorFunction(source) {
    return source::filter(({ type }) => keys.some(keyHasType(type)));
  };
}
