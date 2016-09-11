import { Middleware, MiddlewareAPI } from 'redux';
import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';

export declare class ActionsObservable<T> extends Observable<T> {
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
