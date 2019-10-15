import { Action } from 'redux';
import { Observable, of, from, Operator, ObservableInput, SchedulerLike } from 'rxjs';
import { ofType } from './operators';

export class ActionsObservable<T extends Action> extends Observable<T> {
  /**
   * Just like RxJS itself, we can't actually make this method always type-safe
   * because we would need non-final position spread params e.g.
   *   `static of<T>(...items: T, scheduler?: Scheduler): ActionsObservable<T>`
   * which isn't possible in either JavaScript or TypeScript. So instead, we
   * provide safe typing for up to 6 items, following by a scheduler.
   */
  static of<T extends Action>(item1: T, scheduler?: SchedulerLike): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, scheduler?: SchedulerLike): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, scheduler?: SchedulerLike): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, item4: T, scheduler?: SchedulerLike): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, item4: T, item5: T, scheduler?: SchedulerLike): ActionsObservable<T>;
  static of<T extends Action>(item1: T, item2: T, item3: T, item4: T, item5: T, item6: T, scheduler?: SchedulerLike): ActionsObservable<T>;
  static of<T extends Action>(...array: Array<T | SchedulerLike>): ActionsObservable<T>;
  static of<T extends Action>(...actions: Array<T | SchedulerLike>) {
    return new this(of(...actions));
  }

  static from<T extends Action>(ish: ObservableInput<T>, scheduler?: SchedulerLike): ActionsObservable<T>;
  static from<T extends Action, R extends Action>(ish: ArrayLike<T>, scheduler?: SchedulerLike): ActionsObservable<R>;
  static from<T extends Action>(actions: ObservableInput<T> | ArrayLike<T>, scheduler?: SchedulerLike) {
    return new this(from(actions, scheduler!));
  }

  constructor(actionsSubject: Observable<T>) {
    super();
    this.source = actionsSubject;
  }

  // TODO: Change to `R extends T`?
  lift<R extends Action>(operator: Operator<T, R>): ActionsObservable<R>;
  lift<R>(operator: Operator<T, R>): Observable<R>;
  lift<R>(operator: Operator<T, R>) {
    // TODO: any => R, not satisfying type constraint "<R>"
    const observable = new ActionsObservable<any>(this);
    observable.operator = operator;
    return observable;
  }

  ofType<R extends T = T>(...keys: R['type'][]) {
    // TODO: Remove `any`, there is a long error stack that ends with:
    //  'Action<any>' is assignable to the constraint of type 'R', but 'R' could be instantiated with a different subtype of constraint 'Action<any>'
    return ofType<R>(...keys)(this as any) as ActionsObservable<R>;
  }
}
