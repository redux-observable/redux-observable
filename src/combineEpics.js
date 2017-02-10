import { merge } from 'rxjs/observable/merge';
import { $$observable } from 'symbol-observable';

/**
  Merges all epics into a single one.
 */
export const combineEpics = (...epics) => (...args) =>
  merge(
    ...epics.map(epic => {
      const output$ = epic(...args);
      if (!output$ || (!output$[$$observable] && !output$.subscribe)) {
        throw new TypeError(`combineEpics: one of the provided Epics "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
      }
      return output$;
    })
  );
