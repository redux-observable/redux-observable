import { filter } from 'rxjs/operator/filter';

const hasType = type => key => {
  return type === key || typeof key === 'function' && type === key.toString();
};

export function ofType(...keys) {
  return source => source::filter(({ type }) => keys.some(hasType(type)));
}
