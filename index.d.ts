import { Middleware, MiddlewareAPI, Action } from 'redux';
import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';

export declare class ActionsObservable extends Observable<Action> {
  constructor(actionsSubject: Observable<Action>);
  lift(operator: Operator<any, Action>);
  ofType(...key: any[]);
}

export declare interface Epic {
  (action$: ActionsObservable, store: MiddlewareAPI<any>): Observable<Action>;
}

export declare function createEpicMiddleware(rootEpic: Epic): Middleware;

export declare function combineEpics(...epics: Epic[]): Epic;
