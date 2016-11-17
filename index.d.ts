import { Middleware, MiddlewareAPI } from 'redux';
import { Observable, ObservableInput } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { Operator } from 'rxjs/Operator';

export declare class ActionsObservable<T> extends Observable<T> {
  /**
   * Just like RxJS itself, we can't actually make this method always type-safe
   * because we would need non-final position spread params e.g.
   *   `static of<T>(...items: T, scheduler?: Scheduler): ActionsObservable<T>`
   * which isn't possible in either JavaScript or TypeScript. So instead, we
   * provide safe typing for up to 6 items, following by a scheduler. 
   */
  static of<T>(item1: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T>(item1: T, item2: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T>(item1: T, item2: T, item3: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T>(item1: T, item2: T, item3: T, item4: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T>(item1: T, item2: T, item3: T, item4: T, item5: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T>(item1: T, item2: T, item3: T, item4: T, item5: T, item6: T, scheduler?: Scheduler): ActionsObservable<T>;
  static of<T>(...array: Array<T | Scheduler>): ActionsObservable<T>;

  static from<T>(ish: ObservableInput<T>, scheduler?: Scheduler): ActionsObservable<T>;
  static from<T, R>(ish: ArrayLike<T>, scheduler?: Scheduler): ActionsObservable<R>;

  constructor(input$: Observable<T>);
  lift(operator: Operator<any, T>) : ActionsObservable<T>;
  ofType(...key: any[]) : ActionsObservable<T>;
}

export declare interface Epic<T> {
  (action$: ActionsObservable<T>, store: MiddlewareAPI<any>): Observable<T>;
}

export interface EpicMiddleware<T> extends Middleware {
  replaceEpic(nextEpic: Epic<T>): void;
}

export declare function createEpicMiddleware<T>(rootEpic: Epic<T>): EpicMiddleware<T>;

export declare function combineEpics<T>(...epics: Epic<T>[]): Epic<T>;
