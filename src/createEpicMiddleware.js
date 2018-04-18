import { Subject, from, queueScheduler } from 'rxjs';
import { map, mergeMap, subscribeOn, observeOn, takeUntil } from 'rxjs/operators';
import { ActionsObservable } from './ActionsObservable';
import { StateObservable } from './StateObservable';
import { EPIC_END } from './EPIC_END';

const defaultAdapter = {
  input: action$ => action$,
  output: action$ => action$
};

const defaultOptions = {
  adapter: defaultAdapter
};

export function createEpicMiddleware(rootEpicOrOptions, options = defaultOptions) {
  let autoRun = false;
  if (typeof rootEpicOrOptions === 'function') {
    autoRun = true;
    if (process.env.NODE_ENV !== 'production') {
      require('./utils/console').deprecate('In v1.0.0-final createEpicMiddleware only expects the optional `options` argument. Your root Epic should be started using the instance of your middleware with epicMiddleware.run(rootEpic)\n\nLearn more: https://redux-observable.js.org/MIGRATION.html');
    }
  } else {
    options = rootEpicOrOptions;
  }

  // even though we used default param, we need to merge the defaults
  // inside the options object as well in case they declare only some
  options = { ...defaultOptions, ...options };

  // This is a temporary signal used so we can still do the old replaceEpic
  const replaceEpicSignal$ = new Subject();
  const input$ = new Subject();
  const action$ = options.adapter.input(
    new ActionsObservable(input$)
  );
  const epic$ = new Subject();
  let store;

  const epicMiddleware = _store => {
    if (process.env.NODE_ENV !== 'production' && store) {
      // https://github.com/redux-observable/redux-observable/issues/389
      require('./utils/console').warn('this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da');
    }
    store = _store;
    const stateInput$ = new Subject();
    const state$ = new StateObservable(stateInput$, _store);

    const result$ = epic$.pipe(
      map(epic => {
        const output$ = ('dependencies' in options)
          ? epic(action$, state$, options.dependencies)
          : epic(action$, state$);

        if (!output$) {
          throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
        }

        return output$;
      }),
      mergeMap(output$ => from(options.adapter.output(output$)).pipe(
        subscribeOn(queueScheduler),
        observeOn(queueScheduler),
        takeUntil(replaceEpicSignal$)
      ))
    );

    result$.subscribe(store.dispatch);

    return next => {
      // Only for backwards compatibility, to be removed in v1.0.0-final
      if (autoRun) {
        epic$.next(rootEpicOrOptions);
      }

      return action => {
        // Downstream middleware gets the action first,
        // which includes their reducers, so state is
        // updated before epics receive the action
        const result = next(action);

        // It's important to update the state$ before we emit
        // the action because otherwise it would be stale!
        stateInput$.next(store.getState());
        input$.next(action);

        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = rootEpic => {
    if (process.env.NODE_ENV !== 'production') {
      require('./utils/console').deprecate('replaceEpic will be removed in v1.0.0-final in favor of just using takeUntil with your own END action and using epicMiddleware.run(nextEpic)\n\nLearn more: https://redux-observable.js.org/MIGRATION.html');
    }
    store.dispatch({ type: EPIC_END });
    // Since the new epicMiddleware.run() API supports concurrent root Epics
    // we need a way to signal that the existing epics should be unsubscribed
    replaceEpicSignal$.next();
    epic$.next(rootEpic);
  };

  epicMiddleware.run = rootEpic => {
    epic$.next(rootEpic);
  };

  return epicMiddleware;
}
