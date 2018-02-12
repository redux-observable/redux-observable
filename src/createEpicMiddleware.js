import { Subject } from 'rxjs/index.js';
import { map, switchMap } from 'rxjs/operators';
import { ActionsObservable } from './ActionsObservable';
import { EPIC_END } from './EPIC_END';

const defaultAdapter = {
  input: action$ => action$,
  output: action$ => action$
};

const defaultOptions = {
  adapter: defaultAdapter
};

export function createEpicMiddleware(rootEpic, options = defaultOptions) {
  if (typeof rootEpic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicMiddleware');
  }

  // even though we used default param, we need to merge the defaults
  // inside the options object as well in case they declare only some
  options = { ...defaultOptions, ...options };
  const input$ = new Subject();
  const action$ = options.adapter.input(
    new ActionsObservable(input$)
  );
  const epic$ = new Subject();
  let store;

  const epicMiddleware = _store => {
    if (process.env.NODE_ENV !== 'production' && store) {
      // https://github.com/redux-observable/redux-observable/issues/389
      require('./utils/console').warn('this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\n See https://goo.gl/2GQ7Da');
    }
    store = _store;

    return next => {
      epic$.pipe(
        map(epic => {
          const vault = (process.env.NODE_ENV === 'production') ? store : {
            getState: store.getState,
            dispatch: (action) => {
              require('./utils/console').deprecate('calling store.dispatch() directly in your Epics is deprecated and will be removed. Instead, emit actions through the Observable your Epic returns.\n\n  https://goo.gl/WWNYSP');
              return store.dispatch(action);
            }
          };

          const output$ = ('dependencies' in options)
            ? epic(action$, vault, options.dependencies)
            : epic(action$, vault);

          if (!output$) {
            throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
          }

          return output$;
        }),
        switchMap(output$ => options.adapter.output(output$)))
        .subscribe(action => {
          try {
            store.dispatch(action);
          } catch (err) {
            console.error(err);
          }
        }, (err) => {
          console.error(err.message);
          throw err;
        });

      // Setup initial root epic
      epic$.next(rootEpic);

      return action => {
        const result = next(action);
        input$.next(action);
        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = rootEpic => {
    // gives the previous root Epic a last chance
    // to do some clean up
    store.dispatch({ type: EPIC_END });
    // switches to the new root Epic, synchronously terminating
    // the previous one
    epic$.next(rootEpic);
  };

  return epicMiddleware;
}
