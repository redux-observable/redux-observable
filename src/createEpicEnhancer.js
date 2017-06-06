import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';
import { ActionsObservable } from './ActionsObservable';
import { EPIC_END } from './EPIC_END';
import { defaultOptions } from './defaults';

export function createEpicEnhancer(epic, options = defaultOptions) {
  if (typeof epic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicEnhancer');
  }
  options = { ...defaultOptions, ...options };

  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    const epic$ = new Subject();
    const input$ = new Subject();
    const action$ = options.adapter.input(
      new ActionsObservable(input$)
    );

    const dispatch = action => {
      // let action hit reducers and other middleware first
      const result = store.dispatch(action);
      if (action && action.type) {
        input$.next(action);
      }
      return result;
    };
    const mockStore = { dispatch, getState() { return store.getState(); } };

    epic$
      ::map(epic => {
        const output$ = ('dependencies' in options)
          ? epic(action$, mockStore, options.dependencies)
          : epic(action$, mockStore);

        if (!output$) {
          throw new TypeError(`Your root Epic "${epic.name || '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`);
        }

        return output$;
      })
      ::switchMap(output$ => options.adapter.output(output$))
      .subscribe(dispatch);

    const replaceEpic = epic => {
      // gives the previous root Epic a last chance
      // to do some clean up
      dispatch({ type: EPIC_END });
      // switches to the new root Epic, synchronously terminating
      // the previous one
      epic$.next(epic);
    };

    epic$.next(epic);

    return {
      ...store,
      dispatch,
      replaceEpic
    };
  };
}
