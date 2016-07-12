import { merge } from 'rxjs/observable/merge';

/**
  Merges all epics into a single one.
 */
export const combineEpics = (...epics) => (actions, store) =>
  merge(...(epics.map(epic => epic(actions, store))));
