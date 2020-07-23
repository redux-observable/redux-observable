import { Action as ReduxAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { from, Subject } from 'rxjs';
import { QueueAction } from 'rxjs/internal/scheduler/QueueAction';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';
import { map, mergeMap, observeOn, subscribeOn } from 'rxjs/operators';
import { Epic } from './epic';
import { StateObservable } from './StateObservable';
import { warn } from './utils/console';

interface Options<Dependencies = any> {
  dependencies?: Dependencies;
}

export interface EpicMiddleware<
  Action extends ReduxAction,
  Output extends Action = Action,
  State = any,
  Dependencies = any
> extends Middleware<{}, State, Dispatch<any>> {
  run(rootEpic: Epic<Action, Output, State, Dependencies>): void;
}

export function createEpicMiddleware<
  Action extends ReduxAction,
  Output extends Action = Action,
  State = any,
  Dependencies = any
>(options: Options<Dependencies> = {}): EpicMiddleware<Action, Output, State, Dependencies> {
  const uniqueQueueScheduler = new QueueScheduler(QueueAction);

  if (process.env.NODE_ENV !== 'production' && typeof options === 'function') {
    throw new TypeError(
      'Providing your root Epic to `createEpicMiddleware(rootEpic)` is no longer supported, instead use `epicMiddleware.run(rootEpic)`\n\nLearn more: https://redux-observable.js.org/MIGRATION.html#setting-up-the-middleware'
    );
  }

  const epic$ = new Subject<Epic<Action, Output, State, Dependencies>>();
  let store: MiddlewareAPI<Dispatch<any>, State>;

  const epicMiddleware: EpicMiddleware<Action, Output, State, Dependencies> = (_store) => {
    if (process.env.NODE_ENV !== 'production' && store) {
      // https://github.com/redux-observable/redux-observable/issues/389
      warn(
        'this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da'
      );
    }
    store = _store;
    const actionSubject$ = new Subject<Action>();
    const stateSubject$ = new Subject<State>();
    const action$ = actionSubject$
      .asObservable()
      .pipe(observeOn(uniqueQueueScheduler));
    const state$ = new StateObservable(
      stateSubject$.pipe(observeOn(uniqueQueueScheduler)),
      store.getState()
    );

    const result$ = epic$.pipe(
      map((epic) => {
        const output$ = epic(action$, state$, options.dependencies!);

        if (!output$) {
          throw new TypeError(
            `Your root Epic "${
              epic.name || '<anonymous>'
            }" does not return a stream. Double check you\'re not missing a return statement!`
          );
        }

        return output$;
      }),
      mergeMap((output$) =>
        from(output$).pipe(
          subscribeOn(uniqueQueueScheduler),
          observeOn(uniqueQueueScheduler)
        )
      )
    );

    result$.subscribe(store.dispatch);

    return (next) => {
      return (action) => {
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

  epicMiddleware.run = (rootEpic) => {
    if (process.env.NODE_ENV !== 'production' && !store) {
      warn(
        'epicMiddleware.run(rootEpic) called before the middleware has been setup by redux. Provide the epicMiddleware instance to createStore() first.'
      );
    }
    epic$.next(rootEpic);
  };

  return epicMiddleware;
}
