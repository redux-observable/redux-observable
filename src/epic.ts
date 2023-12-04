import type { Observable } from 'rxjs';
import type { StateObservable } from './StateObservable';

export declare interface Epic<
  Input = unknown,
  Output extends Input = Input,
  State = void,
  Dependencies = any
> {
  (
    action$: Observable<Input>,
    state$: StateObservable<State>,
    dependencies: Dependencies
  ): Observable<Output>;
}
