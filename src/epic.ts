import { Observable } from 'rxjs';
import { StateObservable } from './StateObservable';

export declare interface Epic<
  Input = any,
  Output extends Input = Input,
  State = any,
  Dependencies = any
> {
  (
    action$: Observable<Input>,
    state$: StateObservable<State>,
    dependencies: Dependencies
  ): Observable<Output>;
}
