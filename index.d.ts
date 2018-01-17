import { Middleware, MiddlewareAPI, Action } from 'redux';
import { Observable, ObservableInput } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { Operator } from 'rxjs/Operator';

export declare class ActionsObservable<T extends Action> extends Observable<T> {
  /**
   * Just like RxJS itself, we can't actually make this method always type-safe
   * because we would need non-final position spread params e.g.
   *   `static of<T>(...items: T, scheduler?: Scheduler): ActionsObservable<T>`
   * which isn't possible in either JavaScript or TypeScript. So instead, we
   * provide safe typing for up to 6 items, following by a scheduler.
   */
  static of<T extends Action>(item1: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, item4: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, item4: T, item5: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, item4: T, item5: T, item6: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T extends Action>(...array: Array<T | Scheduler>): ActionsObservable<T>;

  static from<T extends Action>(ish: ObservableInput<T>, scheduler?: Scheduler): ActionsObservable<T>;
  static from<T extends Action, R extends Action>(ish: ArrayLike<T>, scheduler?: Scheduler): ActionsObservable<R>;

  constructor(input$: Observable<T>);
  lift<R extends Action>(operator: Operator<T, R>): ActionsObservable<R>;
  lift<R>(operator: Operator<T, R>): Observable<R>;
  ofType<R extends T = T>(...key: R['type'][]): ActionsObservable<R>;
}

export declare interface Epic<T extends Action, S, D = any, O extends T = T> {
  (action$: ActionsObservable<T>, store: MiddlewareAPI<S>, dependencies: D): Observable<O>;
}

export interface EpicMiddleware<T extends Action, S, D = any, O extends T = T> extends Middleware {
  replaceEpic(nextEpic: Epic<T, S, D, O>): void;
}

interface Adapter {
  input: (input$: Observable<any>) => any;
  output: (output$: any) => Observable<any>;
}

interface Options<D = any> {
  adapter?: Adapter;
  dependencies?: D;
}

export declare function createEpicMiddleware<T extends Action, S, D = any, O extends T = T>(rootEpic: Epic<T, S, D, O>, options?: Options<D>): EpicMiddleware<T, S, D, O>;

export declare function combineEpics<T extends Action, S, D = any, O extends T = T>(...epics: Epic<T, S, D, O>[]): Epic<T, S, D, O>;
export declare function combineEpics<E>(...epics: E[]): E;

export declare function ofType<T extends Action, R extends T = T, K extends R['type'] = R['type']>(...key: K[]): (source: Observable<T>) => Observable<R>;

export declare const EPIC_END: '@@redux-observable/EPIC_END';
