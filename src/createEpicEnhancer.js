import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';
import { ActionsObservable } from './ActionsObservable';
import { EPIC_INIT } from './EPIC_INIT';
import { EPIC_END } from './EPIC_END';
import { defaultOptions } from './defaults';
import { cacheUntilType } from './cacheUntilType';
import { mergeStatic } from 'rxjs/operator/merge';
import { first } from 'rxjs/operator/first';

export function createEpicEnhancer(epic, options = defaultOptions) {
  if (typeof epic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicEnhancer');
  }
  options = { ...defaultOptions, ...options };

  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    const epic$ = new Subject();
    const input$ = new Subject();
    const _action$ = new ActionsObservable(input$);
    const action$ = options.adapter.input(_action$);

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
      ::map(output$ => options.adapter.output(output$))
      ::switchMap(epic => {
        return mergeStatic(
          epic,
          // add epic that passes INIT through
          // this allows us to detect when all epics have subscribed
          // to action$.
          _action$.ofType(EPIC_INIT)::first()
        )
        // actions are cached by this operator until the INIT action
        // we use the INIT as a signal to flush cached actions
        // this allows actions emitted by epics at subscribe (i.e. startWith),
        // before subscribing to input$, to loop back into the epics
        // this happens synchronously
        // all future actions are passed through
        ::cacheUntilType(EPIC_INIT);
      })
      .subscribe(dispatch);


    const replaceEpic = epic => {
      // gives the previous root Epic a last chance
      // to do some clean up
      dispatch({ type: EPIC_END });
      // switches to the new root Epic, synchronously terminating
      // the previous one
      epic$.next(epic);

      dispatch({ type: EPIC_INIT });
    };

    epic$.next(epic);

    // we dispatch INIT to open up the cacheUntilType operator
    dispatch({ type: EPIC_INIT });

    return {
      ...store,
      dispatch,
      replaceEpic
    };
  };
}
