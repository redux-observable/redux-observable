import { merge } from 'rxjs/observable/merge';

/**
  merges all delegators into a single delegator.
 */
export const combineDelegators = (...delegators) => (actions, store) =>
    merge(...(delegators.map((delegator) => delegator(actions, store))));
