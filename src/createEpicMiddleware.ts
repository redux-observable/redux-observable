import { Action, Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { Subject, from, queueScheduler, Observable } from 'rxjs';
import { finalize, map, mergeMap, observeOn, subscribeOn, takeUntil } from 'rxjs/operators';
import { StateObservable } from './StateObservable';
import { Epic } from './epic';
import { warn } from './utils/console';

interface Options<D = any> {
  dependencies?: D;
}

interface ThreadStorage {
  [key: string]: null | {
    id: string;
    sigterm$: Subject<void>;
    sigkill$: Subject<void>;
    output$: Observable<any>;
  };
}

export interface EpicMiddleware<
  T extends Action,
  O extends T = T,
  S = void,
  D = any
> extends Middleware<{}, S, Dispatch<any>> {
  run(rootEpic: Epic<T, O, S, D>): void;
  sigterm(rootEpic: Epic<T, O, S, D>): Observable<O>;
  sigkill(rootEpic: Epic<T, O, S, D>): Observable<O>;
}

export function createEpicMiddleware<
  T extends Action,
  O extends T = T,
  S = void,
  D = any
>(options: Options<D> = {}): EpicMiddleware<T, O, S, D> {
  // This isn't great. RxJS doesn't publicly export the constructor for
  // QueueScheduler nor QueueAction, so we reach in. We need to do this because
  // we don't want our internal queuing mechanism to be on the same queue as any
  // other RxJS code outside of redux-observable internals.
  const QueueScheduler: any = queueScheduler.constructor;
  const uniqueQueueScheduler: typeof queueScheduler = new QueueScheduler(
    (queueScheduler as any).SchedulerAction
  );

  if (process.env.NODE_ENV !== 'production' && typeof options === 'function') {
    throw new TypeError(
      'Providing your root Epic to `createEpicMiddleware(rootEpic)` is no longer supported, instead use `epicMiddleware.run(rootEpic)`\n\nLearn more: https://redux-observable.js.org/MIGRATION.html#setting-up-the-middleware'
    );
  }

  const epic$ = new Subject<Epic<T, O, S, D>>();
  let store: MiddlewareAPI<Dispatch<any>, S>;
  const threads: ThreadStorage = {};

  const epicMiddleware: EpicMiddleware<T, O, S, D> = _store => {
    if (process.env.NODE_ENV !== 'production' && store) {
      // https://github.com/redux-observable/redux-observable/issues/389
      warn(
        'this middleware is already associated with a store. createEpicMiddleware should be called for every store.\n\nLearn more: https://goo.gl/2GQ7Da'
      );
    }
    store = _store;
    const actionSubject$ = new Subject<T>();
    const stateSubject$ = new Subject<S>();
    const action$ = actionSubject$
      .asObservable()
      .pipe(observeOn(uniqueQueueScheduler));
    const state$ = new StateObservable(
      stateSubject$.pipe(observeOn(uniqueQueueScheduler)),
      store.getState()
    );

    const result$ = epic$.pipe(
      map(epic => {
        const id = epic.id;
        const sigterm$ = new Subject<void>();
        const sigkill$ = new Subject<void>();

        const thread$ = epic(
          action$.pipe(
            takeUntil(sigterm$),
          ),
          state$,
          options.dependencies!,
        );

        if (!thread$) {
          throw new TypeError(
            `Your root Epic "${epic.name ||
              '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`
          );
        }

        return { id, thread$, sigkill$, sigterm$ };
      }),
      mergeMap(({ id, thread$, sigkill$, sigterm$ }) => {
        const output$ = from(thread$).pipe(
          subscribeOn(uniqueQueueScheduler),
          observeOn(uniqueQueueScheduler),
          takeUntil(sigkill$),
          finalize(() => {
            threads[id] = null;
          }),
        );

        threads[id] = { id, output$, sigkill$, sigterm$ };
        return output$;
      })
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
      warn(
        'epicMiddleware.run(rootEpic) called before the middleware has been setup by redux. Provide the epicMiddleware instance to createStore() first.'
      );
    }

    if (!rootEpic.id) {
      Object.defineProperty(rootEpic, 'id', {
        value: Math.random().toString(16),
      });
    }

    epic$.next(rootEpic);
  };

  epicMiddleware.sigterm = (rootEpic) => {
    const id = rootEpic.id;
    const thread = threads[id];

    if (!thread) {
      // thread is not running,
      // probably need to throw
      return;
    }

    setTimeout(() => {
      thread.sigterm$.next();
    }, 0);

    return thread.output$;
  };

  epicMiddleware.sigkill = (rootEpic) => {
    const id = rootEpic.id;
    const thread = threads[id];

    if (!thread) {
      // thread is not running,
      // probably need to throw
      return;
    }

    setTimeout(() => {
      thread.sigkill$.next();
    }, 0);

    return thread.output$;
  };

  return epicMiddleware;
}
