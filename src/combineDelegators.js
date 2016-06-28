import { Subject } from 'rxjs/Subject';

/**
  merges all delegators into a single delegator.
 */
export const combineDelegators = (...delegators) => {
  const dynamicDelegators$ = new Subject();

  const delegator = (actions, store) =>
    dynamicDelegators$
      .mergeMap(dynamicD => dynamicD(actions, store))
      .merge(...(delegators.map((delegator) => delegator(actions, store))));

  delegator.addDelegator = (newDelegator) => dynamicDelegators$.next(newDelegator);

  return delegator;
};
