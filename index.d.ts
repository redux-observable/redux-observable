import { Middleware } from 'redux';
import { Observable, Subscribable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import { Store } from 'redux';

export interface Processor<T, S> {
  (action$?: ActionsObservable<T>, store?: Store<S>): Subscribable<T>
}

export declare function reduxObservable<T, S>(processor?: Processor<T, S>): Middleware;

// ./node_modules/rxjs/Observable.d.ts
export declare class ActionsObservable<T> extends Observable<T> {

  // ./node_modules/rxjs/Observable.d.ts specifies an `Observable`'s `source`
  // property like so: `protected source: Observable<any>;`
  // since `actionsSubject` is being assigned to an `Observable`'s `source`
  // property it is being given the type: `Observable<any>`
  constructor(actionsSubject: Observable<any>);

  // ./node_modules/rxjs/Observable.d.ts specifies operators as generics like so
  // `protected operator: Operator<any, T>;`
  lift(operator: Operator<any, T>);

  // ./node_modules/redux/index.d.ts specifies `Action` as having a `type`
  // property with a type signature of `any`
  // since `key` is being compared with an `Action`'s `type`, `key` has a type
  // signature of `any`
  ofType(...key: any[]): ActionsObservable<T>;
}
