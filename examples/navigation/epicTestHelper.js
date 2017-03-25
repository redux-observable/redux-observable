import { ActionsObservable } from 'redux-observable';
import { Subject } from 'rxjs';

export default (epic, action, state = {}, dependencies = {}) => {
  const actions = new Subject();
  const actions$ = new ActionsObservable(actions);
  const store = { getState: () => state };

  const promised = epic(actions$, store, dependencies)
    .toArray()
    .toPromise();

  if (action.length) {
    action.map(act => actions.next(act));
    actions.complete();
  } else {
    actions.next(action);
    actions.complete();
  }

  return promised;
};
