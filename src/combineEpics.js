import { merge } from 'rxjs/observable/merge';

/**
  Merges all epics into a single one.
 */
export const combineEpics = (...epics) => (...args) =>
  merge(
    ...epics.map(epic => epic(...args))
  );
