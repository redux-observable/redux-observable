import { filter } from 'rxjs/operators';

const matchesType = type => key => {
  return type === key || typeof key === 'function' && type === key.toString();
};

export const ofType = (...keys) => source => source.pipe(
  filter(({ type }) => keys.some(matchesType(type)))
);
