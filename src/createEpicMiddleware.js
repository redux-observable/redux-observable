import { Subject, from, queueScheduler } from 'rxjs';
import { map, mergeMap, observeOn, subscribeOn } from 'rxjs/operators';
import { ActionsObservable } from './ActionsObservable';
import { StateObservable } from './StateObservable';

const defaultAdapter = {
  input: action$ => action$,
  output: action$ => action$
};

const defaultOptions = {
  adapter: defaultAdapter
};

export function createEpicMiddleware(options = defaultOptions) {
  // even though we used default param, we need to merge the defaults
  // inside the options object as well in case they declare only some
  options = { ...defaultOptions, ...options };

  const actionSubject$ = new Subject().pipe(
    observeOn(queueScheduler)
  );
  const action$ = options.adapter.input(
    new ActionsObservable(actionSubject$)
  );
  const epic$ = new Subject();
  let store;

  const epicMiddleware = _store => {
    if (process.env.NODE_ENV !== 'production' && store) {
      // https://github.com/redux-observable/redux-observable/issues/389
      require('./utils/console').warn('this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da');
    }
    store = _store;
    const stateSubject$ = new Subject().pipe(
      observeOn(queueScheduler)
    );
    const state$ = new StateObservable(stateSubject$, _store);

    const result$ = epic$.pipe(
      map(epic => {
        const output$ = 'dependencies' in options
          ? epic(action$, state$, options.dependencies)
          : epic(action$, state$);

        if (!output$) {
          throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
        }

        return output$;
      }),
      mergeMap(output$ =>
        from(options.adapter.output(output$)).pipe(
          subscribeOn(queueScheduler),
          observeOn(queueScheduler)
        )
      )
    );

    result$.subscribe(store.dispatch);

    return next => {
      return action => {
        // Downstream middleware gets the action first,
        // which includes their reducers, so state is
        // updated before epics receive the action
        const result = next(action);

        // It's important to update the state$ before we emit
        // the action because otherwise it would be stale
        stateSubject$.next(store.getState());
        actionSubject$.next(action);

        return result;
      };
    };
  };

  epicMiddleware.run = rootEpic => {
    if (process.env.NODE_ENV !== 'production' && !store) {
      require('./utils/console').warn('epicMiddleware.run(rootEpic) called before the middleware has been setup by redux. Provide the epicMiddleware instance to createStore() first.');
    }
    epic$.next(rootEpic);
  };

  return epicMiddleware;
}
