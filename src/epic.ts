import { Action } from 'redux';
import { Observable } from 'rxjs';
import { StateObservable } from './StateObservable';
import { ActionsObservable } from './ActionsObservable';

export declare interface Epic<Input extends Action = any, Output extends Input = Input, State = any, Dependencies = any> {
  (action$: ActionsObservable<Input>, state$: StateObservable<State>, dependencies: Dependencies): Observable<Output>;
}
