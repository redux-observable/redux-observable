import { merge } from 'rxjs';
import type { Epic } from './epic';

/**
  Merges all epics into a single one.
 */
export function combineEpics<
  Input = unknown,
  Output extends Input = Input,
  State = void,
  Dependencies = any
>(
  ...epics: Epic<Input, Output, State, Dependencies>[]
): Epic<Input, Output, State, Dependencies> {
  const merger: Epic<Input, Output, State, Dependencies> = (...args) =>
    merge(
      ...epics.map((epic) => {
        const output$ = epic(...args);
        if (!output$) {
          throw new TypeError(
            `combineEpics: one of the provided Epics "${
              epic.name || '<anonymous>'
            }" does not return a stream. Double check you're not missing a return statement!`
          );
        }
        return output$;
      })
    );

  // Technically the `name` property on Function's are supposed to be read-only.
  // While some JS runtimes allow it anyway (so this is useful in debugging)
  // some actually throw an exception when you attempt to do so.
  try {
    Object.defineProperty(merger, 'name', {
      value: `combineEpics(${epics
        .map((epic) => epic.name || '<anonymous>')
        .join(', ')})`,
    });
  } catch (e) {
    // noop
  }

  return merger;
}
