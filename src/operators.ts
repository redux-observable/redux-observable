import { Action } from 'redux';
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { warn } from './utils/console';

const keyHasType = (type: unknown, key: unknown) => {
  return type === key || (typeof key === 'function' && type === key.toString());
};

const isAction = (action: unknown): action is Action =>
  action !== null &&
  typeof action === 'object' &&
  'type' in action &&
  typeof action.type === 'string';

/**
 * Inferring the types of this is a bit challenging, and only works in newer
 * versions of TypeScript.
 *
 * @param ...types One or more Redux action types you want to filter for, variadic.
 */
export function ofType<
  // All possible actions your app can dispatch
  Input,
  // The types you want to filter for
  Type extends string,
  // The resulting actions that match the above types
  Output extends Input = Extract<Input, Action<Type>>
>(...types: [Type, ...Type[]]): OperatorFunction<Input, Output> {
  const len = types.length;

  if (process.env.NODE_ENV !== 'production') {
    if (len === 0) {
      warn('ofType was called without any types!');
    }
    if (types.some((key) => key === null || key === undefined)) {
      warn('ofType was called with one or more undefined or null values!');
    }
  }

  return filter(
    len === 1
      ? (action): action is Output => isAction(action) && keyHasType(action.type, types[0])
      : (action): action is Output => {
        if (isAction(action)) {
          for (let i = 0; i < len; i++) {
            if (keyHasType(action.type, types[i])) {
              return true;
            }
          }
        }

        return false;
      }
  );
}
